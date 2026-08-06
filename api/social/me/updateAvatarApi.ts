import axiosClient from "../../axiosClient";

/**
 * 8. Đổi avatar
 */
export const updateAvatarApi = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  return axiosClient.patch("/api/v1/me/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
