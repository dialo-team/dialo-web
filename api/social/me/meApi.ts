import axiosClient from "../../axiosClient";

export const getMeApi = async () => {
  const res = await axiosClient.get("/api/v1/me");
  return res.data;
};