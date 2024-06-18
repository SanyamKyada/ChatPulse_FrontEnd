export interface RecentChat {
  conversationId: number;
  friendRequestId: number;
  contactId: string;
  personImageURL: string;
  personName: string;
  lastMessage: string;
  lastMessageRecivedAt: string;
  noOfUnseenMessages: number;
  isOnline: boolean;
  lastSeenTimestamp: string;
  isWave: boolean;
}

export interface RecentChatGroups {
  [key: string]: RecentChat[];
}
