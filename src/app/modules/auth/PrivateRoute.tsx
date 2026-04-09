import React from "react";
import { Navigate } from "react-router-dom";

interface Props {
  children: React.ReactNode;
}

export const PrivateRoute = ({ children }: Props) => {
  const token = localStorage.getItem("accessToken");

  console.log("token:", token);

  if (!token) {
    // Nếu chưa login, chuyển về login
    return <Navigate to="/login" replace />;
  }

  // Có token thì render component
  return children;
};