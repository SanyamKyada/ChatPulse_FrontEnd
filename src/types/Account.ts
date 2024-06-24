export interface LoginResponse {
  userId: string;
  userName: string;
  accessToken: string;
  refreshToken: string;
  availabilityStatus: number;
  email: string;
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
