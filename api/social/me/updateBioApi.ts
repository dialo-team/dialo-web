import axiosClient from "../../axiosClient";

/**
 * 10. Cập nhật bio
 */
export const updateBioApi = (data: { bio: string }) => {
  return axiosClient.patch("/api/v1/me/bio", data);
};
