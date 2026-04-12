import axiosClient from "../axiosClient";

/**
 * 1. Đăng ký tài khoản
 */
export const registerApi = (data: {
  phone: string;
}) => {
  return axiosClient.post("/api/v1/auth/signup/request", data);
};

/**
 * 2. Verify OTP sau đăng ký / đăng nhập
 */
export const verifyOtpApi = (data: {
  phone: string;
  password: string;
  otp: string;
}) => {
  return axiosClient.post("/api/v1/auth/signup", data);
};