import axiosClient from "../axiosClient";

const getUserId = () =>
  JSON.parse(localStorage.getItem("user") || "{}")?.id || "";

export const createPollApi = (payload: {
  conversationId: string;
  title: string;
  options: string[];
}) =>
  axiosClient.post("/api/v1/messages/poll", payload, {
    headers: { "X-User-Id": getUserId() },
  });

export const votePollApi = (messageId: string, optionIds: string[]) =>
  axiosClient.put(
    `/api/v1/messages/${messageId}/poll/votes`,
    { optionIds },
    { headers: { "X-User-Id": getUserId() } },
  );

export const addPollOptionApi = (messageId: string, content: string) =>
  axiosClient.post(
    `/api/v1/messages/${messageId}/poll/options`,
    { content },
    { headers: { "X-User-Id": getUserId() } },
  );

export const closePollApi = (messageId: string) =>
  axiosClient.post(
    `/api/v1/messages/${messageId}/poll/close`,
    null,
    { headers: { "X-User-Id": getUserId() } },
  );
