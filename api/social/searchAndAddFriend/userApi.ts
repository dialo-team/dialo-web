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
};