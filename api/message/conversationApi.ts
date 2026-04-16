import axiosClient from "../axiosClient";
import type {
  ConversationDetailDto,
  ConversationDto,
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