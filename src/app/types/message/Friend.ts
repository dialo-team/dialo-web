export type Friend = {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  unreadCount?: number;
  unreadDisplay?: string;
};