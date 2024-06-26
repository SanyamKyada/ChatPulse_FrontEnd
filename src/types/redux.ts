export interface RootState {
  user: UserState;
}

export interface UserState {
  profileImage: string | null;
}
