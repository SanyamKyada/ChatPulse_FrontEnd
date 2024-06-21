import { getUser } from "../services/AuthService";

export function getAuthToken() {
  const { accessToken } = getUser();
  return accessToken;
}

export function getUserId(): string {
  const { userId } = getUser();
  return userId;
}
