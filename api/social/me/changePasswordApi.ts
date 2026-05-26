import axiosClient from "../../axiosClient";


export const changePasswordApi = (data: {
  oldPass: string;
  newPass: string;
  refreshToken: string;
}) => {
  return axiosClient.post("/api/v1/auth/password/change", data);
};