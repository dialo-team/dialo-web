import axiosClient from "../../axiosClient";


// Lời mời nhận
export const getReceivedRequestsApi = async () => {
  const res = await axiosClient.get("/api/v1/me/friend-requests");
  return res.data;
};

//  Lời mời đã gửi
export const getSentRequestsApi = async () => {
  const res = await axiosClient.get("/api/v1/me/friend-requests/sent");
  return res.data;
};