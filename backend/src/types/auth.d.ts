export type RegisterUserRequest = {
  email: string;
  password: string;
  displayName: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  user: {
    uid: string;
    displayName: string;
    email: string;
  }
  authToken: string;
  refreshToken: string;
  expiresIn: string;
}
