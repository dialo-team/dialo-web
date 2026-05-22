import axios from "axios";

let isRefreshing = false;
let pendingRequests: Array<(token: string | null) => void> = [];

const flushPendingRequests = (token: string | null) => {
  pendingRequests.forEach((callback) => callback(token));
  pendingRequests = [];
};

const axiosClient = axios.create({
  baseURL: "http://14.225.192.37:9000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor để tự động thêm token nếu có
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  const hasAuthorizationHeader = Boolean(config.headers?.Authorization);
  const hasUserIdHeader = Boolean((config.headers as any)?.["X-User-Id"]);

  if (token && !hasAuthorizationHeader) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (!hasUserIdHeader) {
    try {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser?.id) {
          (config.headers as any)["X-User-Id"] = parsedUser.id;
        }
      }
    } catch {
      // ignore invalid localStorage user payload
    }
  }

  return config;
});


axiosClient.interceptors.response.use(
  // (response) => response,
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl: string = originalRequest?.url || "";
    const isPasswordResetFlow = requestUrl.includes("/api/v1/auth/password/reset");
    const isRefreshTokenFlow = requestUrl.includes("/api/v1/auth/refresh-token");

    if (error.response?.status === 500) {
      error.response.data = {
        ...(error.response.data || {}),
        message: "Lỗi server",
      };
      return Promise.reject(error);
    }

    // Password reset flow sử dụng resetToken riêng, không dùng refresh access token.
    if (isPasswordResetFlow || isRefreshTokenFlow) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingRequests.push((newToken) => {
            if (!newToken) {
              reject(error);
              return;
            }

            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(axiosClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        isRefreshing = false;
        flushPendingRequests(null);
        return Promise.reject(error);
      }

      try {
        const res = await axiosClient.post("/api/v1/auth/refresh-token", {
          refreshToken,
        });

        const accessToken =
          res.data?.data?.accessToken || res.data?.accessToken;

        if (!accessToken) {
          throw new Error("Missing access token from refresh response");
        }

        localStorage.setItem("accessToken", accessToken);
        flushPendingRequests(accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosClient(originalRequest);
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        flushPendingRequests(null);
        window.location.href = "/login"; // redirect login
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);


export default axiosClient;