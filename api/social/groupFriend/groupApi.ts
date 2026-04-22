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


// đổi tên group
export const updateGroupNameApi = (
  conversationId: string,
  groupName: string
) => {
  return axiosClient.put(
    `/api/v1/conversations/${conversationId}/group-name`,
    { groupName }
  );
};

export const addMembersApi = async (
  conversationId: string,
  memberIds: string[]
) => {
  
  return axiosClient.post(
    `/api/v1/conversations/${conversationId}/members`,
    {
      memberIds,
    }
  );
};

export const leaveGroupApi = (conversationId: string) => {
  return axiosClient.post(
    `/api/v1/conversations/${conversationId}/leave`,
    {}
  );
};