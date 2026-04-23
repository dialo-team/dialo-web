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


// thêm thành viên
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

// lấy danh sách thành viên nhóm
export const getListMemberApi = async (
  conversationId: string,
) => {
  
  return axiosClient.get(
    `/api/v1/conversations/${conversationId}/members`,
    {
      
    }
  );
};

// đổi role thành viên nhóm
export const updateMemberRoleApi = (
  conversationId: string,
  memberId: string,
  role: string
) => {
  return axiosClient.put(
    `/api/v1/conversations/${conversationId}/members/${memberId}/role`,
    { role }
  );
};

// rời nhóm
export const leaveGroupApi = (conversationId: string) => {
  return axiosClient.post(
    `/api/v1/conversations/${conversationId}/leave`,
    {}
  );
};

// giải tán nhóm
export const dissolveGroupApi = (conversationId: string) => {
  return axiosClient.delete(
    `/api/v1/conversations/${conversationId}/dissolve`
  );
};

const DISSOLVED_KEY = "dissolvedGroups";

export const markGroupDissolved = (conversationId: string) => {
  const list: string[] = JSON.parse(localStorage.getItem(DISSOLVED_KEY) || "[]");
  if (!list.includes(conversationId)) {
    list.push(conversationId);
    localStorage.setItem(DISSOLVED_KEY, JSON.stringify(list));
  }
};

export const isGroupDissolvedLocally = (conversationId: string): boolean => {
  const list: string[] = JSON.parse(localStorage.getItem(DISSOLVED_KEY) || "[]");
  return list.includes(conversationId);
};


/// thay đổi avatar nhóm
export const updateGroupAvatarApi = (
  conversationId: string,
  base64Image: string
) => {
  return axiosClient.put(
    `/api/v1/conversations/${conversationId}/group-avatar`,
    {
      groupAvatarUrl: base64Image,
    }
  );
};