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

// thu hồi lười mời
export const cancelFriendRequestApi = (targetId: string) => {
  return axiosClient.delete(`/api/v1/users/${targetId}/request`);
};

// từ chối lời mời
export const rejectFriendRequestApi = (targetId: string) => {
  return axiosClient.post(`/api/v1/users/${targetId}/reject`);
};