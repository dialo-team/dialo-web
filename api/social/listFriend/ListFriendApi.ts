import axios from "axios";

export const getFriendsApi = async () => {
  const res = await axios.get("/api/v1/me/friends");
  return res.data;
};