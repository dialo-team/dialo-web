import axiosClient from "../axiosClient";

/**
 * 1. Login bằng password
 */
export const loginPassApi = (data: {
  phone: string;
  password: string;
}) => {
  // return axiosClient.post("/api/v1/auth/old/signin", data);
  return axiosClient.post("/api/v1/auth/signin/request", data);
};

/**
 * 2. Verify OTP (nếu login cần OTP)
 */
export const verifyLoginOtpApi = (data: {
  phone: string;
  otp: string;
}) => {
  // return axiosClient.post("/api/v1/auth/old/signin/verify", data);
  return axiosClient.post("/api/v1/auth/signin", data);
};