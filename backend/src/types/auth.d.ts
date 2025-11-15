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
  idToken : string;
  refreshToken : string;
  expiresIn : string;
}
