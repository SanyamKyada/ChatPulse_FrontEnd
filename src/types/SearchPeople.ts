export interface PersonToInvite {
  userId: string;
  name: string;
  profileImage: string | null;
  isOnline: boolean;
  lastSeenTimestamp: string;
  isRequestAlreadySent: boolean;
}

export type DirectorySearchResult = PersonToInvite[];
