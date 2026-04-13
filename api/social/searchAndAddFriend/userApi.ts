import type { User } from "@/app/types/social/User";
import axiosClient from "../../axiosClient";


export const userApi = {
  getUserByPhone: async (phone: string): Promise<User | null> => {
    try {
      const res = await axiosClient.get(
        `/api/v1/users/phone/${phone}/info`
      );

      return res.data.data; 
    } catch {
      return null;
    }
  },

  sendFriendRequest: async (
    targetId: string,
    reason: string
  ): Promise<void> => {
    try {
      await axiosClient.post(
        `/api/v1/users/${targetId}/request`,
        {
          reason,
        }
      );
    } catch (error) {
      console.error("sendFriendRequest error:", error);
      throw error;
    }
  },
};