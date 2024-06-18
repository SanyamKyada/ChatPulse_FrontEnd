export interface LoginResponse {
  userId: string;
  userN: string;
  jwtToken: string;
  refreshToken: string;
}

export interface RegisterResponse {
  message: string;
  httpStatusCode: number;
}

export interface LoginCredentials {
  userName: string;
  password: string;
}

export interface RegisterCredentials {
  userName: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}
