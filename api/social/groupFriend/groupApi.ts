import axiosClient from "../../axiosClient";

// tạo group
export const createGroupApi = (
  name: string,
  memberIds: string[]
) => {
  return axiosClient.post("/api/v1/conversations/groups", {
    name,
    memberIds,
  });
};