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
  availabilityStatus: number;
}

export interface RecentChatGroups {
  [key: string]: RecentChat[];
}
