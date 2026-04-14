

import axiosClient from "../../axiosClient";

// lấy dnah sách bạn bè
export const getFriendsApi = async () => {
  const res = await axiosClient.get("/api/v1/me/friends");
  return res.data;
};


// xóa bạn
export const unfriendApi = (targetId: string) => {
  return axiosClient.delete(`/api/v1/users/${targetId}/unfriend`);
};