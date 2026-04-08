import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://14.225.254.174:8082",
  headers: {
    "Content-Type": "application/json",
  },
});

// Optional: interceptor (nếu cần token sau này)
// axiosClient.interceptors.response.use(
//   (response) => response.data,
//   (error) => {
//     return Promise.reject(error.response?.data || error);
//   }
// );

export default axiosClient;