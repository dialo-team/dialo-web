

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

// chặn người dùng
export const blockUserApi = (targetId: string) => {
  return axiosClient.post(`/api/v1/users/${targetId}/block`, {
    reason: "block",
  });
};

// lấy danh sách đã block
export const getBlockedUsersApi = async () => {
  const res = await axiosClient.get("/api/v1/me/blocks");
  return res.data;
};

// DELETE /api/v1/users/{targetUser}/unblock
export const unblockUserApi = (targetId: string) => {
  return axiosClient.delete(`/api/v1/users/${targetId}/unblock`);
};