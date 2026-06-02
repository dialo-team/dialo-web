import axios from "axios";

const videoClient = axios.create({
  baseURL: "https://dialo-video-service-production.up.railway.app",
  headers: { "Content-Type": "application/json" },
});

export type TokenResponse = {
  token: string;
  url: string;
};

export const getVideoTokenApi = (roomId: string, participantName: string) =>
  videoClient.post<TokenResponse>("/token", { roomId, participantName });

export const callInviteApi = (params: {
  conversationId: string;
  callerId: string;
  callerName: string;
  callerAvatar?: string;
  recipientIds: string[];
}) => videoClient.post("/call/invite", params);

export const callAcceptApi = (conversationId: string, callerId: string) =>
  videoClient.post("/call/accept", { conversationId, callerId });

export const callDeclineApi = (conversationId: string, callerId: string) =>
  videoClient.post("/call/decline", { conversationId, callerId });

export const callEndApi = (conversationId: string, recipientIds: string[]) =>
  videoClient.post("/call/end", { conversationId, recipientIds });
