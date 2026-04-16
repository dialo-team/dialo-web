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