import axiosClient from "../../axiosClient";

/**
 * 11. Cập nhật thông tin cơ bản
 */
export const updateBasicInfoApi = (data: {
  userName: string;
  dob: string;
  gender: string;
}) => {
  return axiosClient.patch("/api/v1/me/basic-info", data);
};
