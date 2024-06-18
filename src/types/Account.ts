export interface LoginResponse {
  userId: string;
  userN: string;
  jwtToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
