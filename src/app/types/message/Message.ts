export interface AttachmentDto {
  fileName?: string;
  fileUrl?: string;
  mimeType?: string;
  size?: number;
  thumbnailUrl?: string;
}

export interface MessageDto {
  id: string;
  senderId: string | null;
  senderName: string;
  senderAvatarUrl: string | null;
  content: string;
  createdAt: string;
  type: string;
  system: boolean;
  revoked: boolean;
  displayPosition: "LEFT" | "RIGHT" | "CENTER";
  attachment: AttachmentDto | null;
}


