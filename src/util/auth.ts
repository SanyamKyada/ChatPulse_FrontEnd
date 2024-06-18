export function getAuthToken() {
  return sessionStorage.getItem("access_token");
}

export function getUserId(): string {
  return sessionStorage.getItem("userId");
}
