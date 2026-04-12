import axiosClient from "../axiosClient";

export const getQrChallenge = () => {
  return axiosClient.post("/api/v1/auth/qr/challenges/request");
};