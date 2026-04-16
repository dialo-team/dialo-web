import type { MessageDto } from "./Message";

export interface ConversationDto {
  conversationId: string;
  counterpartAvatarUrl: string;
  counterpartId: string;
  counterpartName: string;
  lastMessage: string;
  lastMessageAt: string;
  lastMessageId: string;
  lastMessageSenderId: string | null;
  lastMessageSystem: boolean;
  lastMessageType: string;
  unreadCount: number;
  unreadDisplay: string;
}

export interface ConversationDetailDto {
  conversationId: string;
  counterpartAvatarUrl: string;
  counterpartId: string;
  counterpartName: string;
  messages: MessageDto[];
  unreadCount: number;
}