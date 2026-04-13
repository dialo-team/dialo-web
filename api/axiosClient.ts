import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://14.225.254.174:9000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor để tự động thêm token nếu có
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  const hasAuthorizationHeader = Boolean(config.headers?.Authorization);

  if (token && !hasAuthorizationHeader) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl: string = originalRequest?.url || "";
    const isPasswordResetFlow = requestUrl.includes("/api/v1/auth/password/reset");

    // Password reset flow sử dụng resetToken riêng, không dùng refresh access token.
    if (isPasswordResetFlow) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          const res = await axiosClient.post("/api/v1/auth/refresh-token", { refreshToken });
          localStorage.setItem("accessToken", res.data.accessToken);
          originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
          return axiosClient(originalRequest);
        } catch {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.location.href = "/login"; // redirect login
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;