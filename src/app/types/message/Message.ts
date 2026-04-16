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
  attachment: any;
}


