import React from "react";
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosClient from "../../../../api/axiosClient";

interface Props {
  children: React.ReactNode;
}

// Xoa token khi xac dinh phien khong con hop le.
const clearAuthStorage = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};

// Giai ma payload JWT de doc thong tin exp o client.
const parseJwtPayload = (token: string) => {
  try {
    const rawToken = token.startsWith("Bearer ") ? token.slice(7) : token;
    const parts = rawToken.split(".");
    if (parts.length !== 3) return null;

    const normalized = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const payload = JSON.parse(atob(padded));

    return payload;
  } catch {
    return null;
  }
};

// Token "dung duoc" khi parse duoc payload va chua qua han.
const isAccessTokenUsable = (token: string) => {
  const payload = parseJwtPayload(token);
  if (!payload || typeof payload.exp !== "number") return false;

  const nowInSeconds = Math.floor(Date.now() / 1000);
  return payload.exp > nowInSeconds + 10;
};

export const PrivateRoute = ({ children }: Props) => {
  // isChecking giup tranh render sai man hinh trong luc dang xac thuc phien.
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Chan setState sau khi component unmount.
    let cancelled = false;

    const verifyAuthState = async () => {
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      // Co accessToken va chua het han -> vao trang ngay.
      if (accessToken && isAccessTokenUsable(accessToken)) {
        if (!cancelled) {
          setIsAuthenticated(true);
          setIsChecking(false);
        }
        return;
      }

      // Khong co refreshToken de cuu phien -> buoc dang nhap lai.
      if (!refreshToken) {
        clearAuthStorage();
        if (!cancelled) {
          setIsAuthenticated(false);
          setIsChecking(false);
        }
        return;
      }

      try {
        // Access token het han/sai -> thu refresh qua BE de xac nhan lai phien.
        const res = await axiosClient.post("/api/v1/auth/refresh-token", {
          refreshToken,
        });

        // Ho tro 2 dang response: { data: { accessToken } } hoac { accessToken }.
        const newAccessToken =
          res.data?.data?.accessToken ?? res.data?.accessToken ?? "";
        const newRefreshToken =
          res.data?.data?.refreshToken ??
          res.data?.refreshToken ??
          refreshToken;

        // Neu refresh tra token khong hop le thi xem nhu that bai.
        if (!newAccessToken || !isAccessTokenUsable(newAccessToken)) {
          throw new Error("Invalid access token after refresh");
        }

        localStorage.setItem("accessToken", newAccessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        if (!cancelled) {
          setIsAuthenticated(true);
        }
      } catch {
        // Refresh fail -> xoa phien local va day ve login.
        clearAuthStorage();
        if (!cancelled) {
          setIsAuthenticated(false);
        }
      } finally {
        if (!cancelled) {
          setIsChecking(false);
        }
      }
    };

    // Chay 1 lan khi vao route (bao gom truong hop F5).
    verifyAuthState();

    return () => {
      cancelled = true;
    };
  }, []);

  // Dang kiem tra phien: tam thoi khong render noi dung protected.
  if (isChecking) {
    return null;
  }

  if (!isAuthenticated) {
    // Nếu chưa login, chuyển về login
    return <Navigate to="/login" replace />;
  }

  // Có token thì render component
  return children;
};
