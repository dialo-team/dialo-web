import axiosClient from "../axiosClient";
import type { ConversationDetailDto, ConversationDto } from "../../src/app/types/message/Conversation";


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