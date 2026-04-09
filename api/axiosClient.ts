import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://14.225.254.174:8082",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor để tự động thêm token nếu có
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// axiosClient.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     return Promise.reject(error.response?.data || error);
//   }
// );


axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
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