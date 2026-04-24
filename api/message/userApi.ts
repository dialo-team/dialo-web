import axiosClient from "../axiosClient";
import type { UserProfileDto } from "../../src/app/types/message/Conversation";

export const getUserByIdApi = async (userId: string): Promise<UserProfileDto> => {
  const res = await axiosClient.get(`/api/v1/users/${encodeURIComponent(userId)}`);
  return res.data;
};

export const upsertUserApi = async (payload: {
  id: string;
  displayName: string;
  avatarUrl?: string;
}): Promise<UserProfileDto> => {
  const res = await axiosClient.post("/api/v1/users", payload);
  return res.data;
};
