
import axiosClient from "../axiosClient";

/**
 * 1. Gửi OTP
 */
export const requestResetPasswordApi = (data: {
  source: string;
  type: "SMS";
}) => {
  return axiosClient.post("/api/v1/auth/password/reset/request", data);
};

/**
 * 2. Xác thực OTP → lấy resetToken
 */
export const confirmResetOtpApi = (data: {
  source: string;
  type: "SMS";
  otp: string;
}) => {
  return axiosClient.post("/api/v1/auth/password/reset/confirm", data);
};


/**
 * 3. Đổi mật khẩu
 */
export const resetPasswordApi = (
  data: {
    password: string;
  },
  resetToken: string
) => {
  return axiosClient.post("/api/v1/auth/password/reset", data, {
    headers: {
      Authorization: resetToken, 
    },
  });
};