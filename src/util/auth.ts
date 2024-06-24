import { getUser } from "../services/AuthService";

export function getAuthToken() {
  const { accessToken } = getUser();
  return accessToken;
}

export function getUserId(): string {
  const { userId } = getUser();
  return userId;
}

export function updateAvailabilityStatus(statusId) {
  const user = getUser();
  localStorage.setItem(
    "user",
    JSON.stringify({ ...user, availabilityStatus: statusId })
  );
}
