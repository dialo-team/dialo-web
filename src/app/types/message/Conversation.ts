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

export interface PinnedMessageDto {
  messageId: string;
  pinnedByUserId: string;
  pinnedByName?: string;
  pinnedAt: string;
}

export interface ConversationDetailDto {
  conversationId: string;
  requesterId?: string;
  counterpartAvatarUrl: string;
  counterpartId: string;
  counterpartName: string;
  remarkName?: string;
  groupDescription?: string;
  pinnedMessages?: PinnedMessageDto[];
  messages: MessageDto[];
  unreadCount: number;
  unreadDisplay?: string;
  createdAt?: string;
}

export interface GroupMemberDto {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  role: string;
  nickname?: string;
}

export interface GroupMemberHistoryDto {
  id: string;
  action: string;
  actorUserId: string;
  actorDisplayName: string;
  targetUserId: string;
  targetDisplayName: string;
  oldRole?: string;
  newRole?: string;
  description?: string;
  createdAt: string;
}

export interface UserProfileDto {
  id: string;
  displayName: string;
  avatarUrl?: string;
}