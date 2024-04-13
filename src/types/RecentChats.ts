export interface RecentChat {
  conversationId: number;
  contactId: string;
  personImageURL: string;
  personName: string;
  lastMessage: string;
  lastMessageRecivedAt: string;
  noOfUnseenMessages: number;
  isOnline: boolean;
  lastSeenTimestamp: string;
}

export interface RecentChatGroups {
  [key: string]: RecentChat[];
}
