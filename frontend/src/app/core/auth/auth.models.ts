export type AuthUser = {
  id: string;
  email: string;
  displayName: string;
};

export type AuthResponse = {
  user: AuthUser;
  accessToken: string;
};

export type RegisterPayload = {
  email: string;
  displayName: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};
