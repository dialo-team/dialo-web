export interface PollSettings {
  allowMultiple: boolean;
  allowAddOption: boolean;
  hideResultBeforeVote: boolean;
  hideVoters: boolean;
}

export interface AttachmentDto {
  fileName?: string;
  fileUrl?: string;
  mimeType?: string;
  size?: number;
  thumbnailUrl?: string;
}

export interface LocationPayload {
  latitude?: number;
  longitude?: number;
  address?: string;
  label?: string;
}

export interface ContactCard {
  userId: string;
  displayName: string;
  phone?: string;
  avatarUrl?: string;
}

export interface MessageReactionDto {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  emoji: string;
  reactedAt: string;
}

export interface ReadReceiptDto {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  readAt: string;
}

export interface PollOptionResponse {
  id: string;
  content: string;
  voters: { id: string; userName: string; avatar?: string }[];
}

export interface PollResponse {
  title: string;
  closed: boolean;
  closedAt?: string;
  closedByUserId?: string;
  options: PollOptionResponse[];
}

export interface MessageDto {
  id: string;
  conversationId?: string;
  senderId: string | null;
  receiverId?: string  | null ;
  senderName: string;
  senderAvatarUrl: string | null;
  receiverName?: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  type: string;
  system: boolean;
  revoked: boolean;
  edited?: boolean;
  editedAt?: string;
  forwardedFromMessageId?: string;
  durationSeconds?: number;
  displayPosition: "LEFT" | "RIGHT" | "CENTER";
  attachment: AttachmentDto | null;
  poll?: PollResponse;
  location?: LocationPayload;
  contactCard?: ContactCard;
  reactions?: MessageReactionDto[];
  readReceipts?: ReadReceiptDto[];
}
