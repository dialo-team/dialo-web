import axiosClient from "../axiosClient";

/**
 * 1. Đăng ký tài khoản
 */
export const registerApi = (data: {
//   fullName: string;
  phone: string;
  password: string;
}) => {
  return axiosClient.post("/api/v1/auth/old/signup", data);
};

/**
 * 2. Verify OTP sau đăng ký / đăng nhập
 */
export const verifyOtpApi = (data: {
  phone: string;
  otp: string;
}) => {
  return axiosClient.post("/api/v1/auth/old/signup/verify", data);
};