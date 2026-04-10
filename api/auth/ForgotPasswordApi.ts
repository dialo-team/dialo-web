import axios from "axios";
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


// export const resetPasswordApi = (data: { password: string }, resetToken: string) => {
//   console.log(data);
//   console.log("Reset Token:", resetToken); // kiểm tra token
//   return axios.post(
//     "http://14.225.254.174:8082/api/v1/auth/password/reset",
//     data,
//     {
//       headers: {
//         Authorization: resetToken, // chỉ truyền token trực tiếp
//         "Content-Type": "application/json",
//       },
//     }
//   );
// };