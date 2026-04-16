import axiosClient from "../../axiosClient";

/**
 * 9. Đổi background
 */
export const updateBackgroundApi = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  return axiosClient.patch("/api/v1/me/background", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
