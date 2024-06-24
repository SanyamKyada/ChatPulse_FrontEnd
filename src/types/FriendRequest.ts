export interface PersonToInvite {
  userId: string;
  name: string;
  profileImage: string | null;
  isOnline: boolean;
  lastSeenTimestamp: string;
  isRequestAlreadySent: boolean;
  availabilityStatus: number;
}

export type DirectorySearchResult = PersonToInvite[];

export type FriendRequestMessage = {
  id: number;
  content: string;
  timestamp: string;
};

export type FriendRequest = {
  id: number;
  senderUserId: string;
  receiverUserId: string;
  status: number;
  requestTimeStamp: string;
  hasWaved: boolean;
  friendRequestMessages: FriendRequestMessage[];
};
