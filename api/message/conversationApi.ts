import axiosClient from "../axiosClient";
import type {
  ConversationDetailDto,
  ConversationDto,
  GroupMemberDto,
  GroupMemberHistoryDto,
} from "../../src/app/types/message/Conversation";
import type { MessageDto } from "../../src/app/types/message/Message";

export type SendMessageRequest = {
  conversationId: string;
  senderId: string;
  type: string;
  content: string;
};

export type RevokeMessageRequest = {
  messageId: string;
  userId: string;
};

export type DeleteMessageForMeRequest = {
  messageId: string;
  userId: string;
};

export type ClearConversationHistoryRequest = {
  conversationId: string;
  userId: string;
};

export const sendFileMessageApi = async (
  conversationId: string,
  file: File,
): Promise<MessageDto> => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await axiosClient.post(
    `/api/v1/messages/file?conversationId=${encodeURIComponent(conversationId)}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return res.data;
};


export const getConversationsApi = async (): Promise<ConversationDto[]> => {
  const res = await axiosClient.get("/api/v1/conversations");
  return res.data;
};

export const getConversationDetailApi = async (
  conversationId: string,
): Promise<ConversationDetailDto> => {
  const res = await axiosClient.get(
    `/api/v1/conversations/${conversationId}`,
  );
  return res.data;
};

export const markConversationReadApi = async (
  conversationId: string,
): Promise<void> => {
  await axiosClient.put(`/api/v1/conversations/${encodeURIComponent(conversationId)}/read`);
};

export const sendMessageApi = async (
  payload: SendMessageRequest,
): Promise<MessageDto> => {
  const res = await axiosClient.post("/api/v1/messages", payload);
  return res.data;
};

export const revokeMessageApi = async (
  payload: RevokeMessageRequest,
): Promise<void> => {
  await axiosClient.post(
    `/api/v1/messages/${encodeURIComponent(payload.messageId)}/revoke`,
    null,
    {
      headers: {
        messageId: payload.messageId,
        "X-User-Id": payload.userId,
      },
    },
  );
};

export const deleteMessageForMeApi = async (
  payload: DeleteMessageForMeRequest,
): Promise<void> => {
  await axiosClient.delete(
    `/api/v1/messages/${encodeURIComponent(payload.messageId)}`,
    {
      headers: {
        "messageId": payload.messageId,
        "X-User-Id": payload.userId,
      },
    },
  );
};

export const getConversationMediaApi = async (
  conversationId: string,
): Promise<MessageDto[]> => {
  const res = await axiosClient.get(
    `/api/v1/conversations/${encodeURIComponent(conversationId)}/media?limit=1000`,
  );
  return res.data;
};
export const remarkConversationApi = async (
  conversationId: string,
  requesterId: string,
  remarkName: string,
) => {
  const res = await axiosClient.put(
    `/api/v1/conversations/${conversationId}/remark`,
    {
      requesterId,
      remarkName,
    },
  );
  return res.data;
};
export const clearConversationHistoryApi = async (
  payload: ClearConversationHistoryRequest,
): Promise<void> => {
  await axiosClient.post(
    `/api/v1/conversations/${encodeURIComponent(payload.conversationId)}/clear-history`,
    null,
    {
      headers: {
        "X-User-Id": payload.userId,
      },
    },
  );
};

export const forwardMessageApi = async (payload: {
  sourceMessageId: string;
  targetConversationId: string;
}): Promise<MessageDto> => {
  const userId = JSON.parse(localStorage.getItem("user") || "{}")?.id || "";
  const res = await axiosClient.post("/api/v1/messages/forward", payload, {
    headers: { "X-User-Id": userId },
  });
  return res.data;
};

export const reactMessageApi = async (
  messageId: string,
  emoji: string,
): Promise<MessageDto> => {
  const res = await axiosClient.post(
    `/api/v1/messages/${encodeURIComponent(messageId)}/react`,
    { emoji },
  );
  return res.data;
};

export const editMessageApi = async (
  messageId: string,
  content: string,
): Promise<MessageDto> => {
  const res = await axiosClient.put(
    `/api/v1/messages/${encodeURIComponent(messageId)}`,
    { content },
  );
  return res.data;
};

export const createConversationApi = async (payload: {
  participantIds: string[];
  createdBy?: string;
  initialSystemMessage?: string;
}): Promise<ConversationDto> => {
  const res = await axiosClient.post("/api/v1/conversations", payload);
  return res.data;
};

export const typingApi = async (
  conversationId: string,
  typing: boolean,
): Promise<void> => {
  await axiosClient.post(
    `/api/v1/conversations/${encodeURIComponent(conversationId)}/typing`,
    { typing },
  );
};

export const pinMessageApi = async (
  conversationId: string,
  messageId: string,
): Promise<void> => {
  await axiosClient.post(
    `/api/v1/conversations/${encodeURIComponent(conversationId)}/pin/${encodeURIComponent(messageId)}`,
  );
};

export const unpinMessageApi = async (
  conversationId: string,
  messageId: string,
): Promise<void> => {
  await axiosClient.delete(
    `/api/v1/conversations/${encodeURIComponent(conversationId)}/pin/${encodeURIComponent(messageId)}`,
  );
};

export const getGroupMembersApi = async (
  conversationId: string,
): Promise<GroupMemberDto[]> => {
  const res = await axiosClient.get(
    `/api/v1/conversations/${encodeURIComponent(conversationId)}/members`,
  );
  return res.data;
};

export const addMembersApi = async (
  conversationId: string,
  memberIds: string[],
): Promise<ConversationDto> => {
  const res = await axiosClient.post(
    `/api/v1/conversations/${encodeURIComponent(conversationId)}/members`,
    { memberIds },
  );
  return res.data;
};

export const removeMemberApi = async (
  conversationId: string,
  memberId: string,
): Promise<ConversationDto> => {
  const res = await axiosClient.delete(
    `/api/v1/conversations/${encodeURIComponent(conversationId)}/members/${encodeURIComponent(memberId)}`,
  );
  return res.data;
};

export const assignRoleApi = async (
  conversationId: string,
  memberId: string,
  role: string,
): Promise<ConversationDto> => {
  const res = await axiosClient.put(
    `/api/v1/conversations/${encodeURIComponent(conversationId)}/members/${encodeURIComponent(memberId)}/role`,
    { role },
  );
  return res.data;
};

export const updateMemberNicknameApi = async (
  conversationId: string,
  memberId: string,
  nickname: string,
): Promise<ConversationDto> => {
  const res = await axiosClient.put(
    `/api/v1/conversations/${encodeURIComponent(conversationId)}/members/${encodeURIComponent(memberId)}/nickname`,
    { nickname },
  );
  return res.data;
};

export const leaveGroupApi = async (
  conversationId: string,
): Promise<ConversationDto> => {
  const res = await axiosClient.post(
    `/api/v1/conversations/${encodeURIComponent(conversationId)}/leave`,
  );
  return res.data;
};

export const createGroupApi = async (payload: {
  name?: string;
  memberIds: string[];
}): Promise<ConversationDto> => {
  const res = await axiosClient.post("/api/v1/conversations/groups", payload);
  return res.data;
};

export const searchMessagesApi = async (
  conversationId: string,
  keyword: string,
): Promise<MessageDto[]> => {
  const res = await axiosClient.get(
    `/api/v1/conversations/${encodeURIComponent(conversationId)}/search`,
    { params: { keyword } },
  );
  return res.data;
};

export const searchGroupMembersApi = async (
  conversationId: string,
  keyword: string,
): Promise<GroupMemberDto[]> => {
  const res = await axiosClient.get(
    `/api/v1/conversations/${encodeURIComponent(conversationId)}/members/search`,
    { params: { keyword } },
  );
  return res.data;
};

export const getGroupHistoryApi = async (
  conversationId: string,
): Promise<GroupMemberHistoryDto[]> => {
  const res = await axiosClient.get(
    `/api/v1/conversations/${encodeURIComponent(conversationId)}/history`,
  );
  return res.data;
};

export const dissolveGroupApi = async (
  conversationId: string,
): Promise<void> => {
  await axiosClient.delete(
    `/api/v1/conversations/${encodeURIComponent(conversationId)}/dissolve`,
  );
};

export const updateGroupNameApi = async (
  conversationId: string,
  groupName: string,
): Promise<ConversationDto> => {
  const res = await axiosClient.put(
    `/api/v1/conversations/${encodeURIComponent(conversationId)}/group-name`,
    { groupName },
  );
  return res.data;
};

export const updateGroupDescriptionApi = async (
  conversationId: string,
  groupDescription: string,
): Promise<ConversationDto> => {
  const res = await axiosClient.put(
    `/api/v1/conversations/${encodeURIComponent(conversationId)}/group-description`,
    { groupDescription },
  );
  return res.data;
};