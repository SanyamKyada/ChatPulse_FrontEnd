export interface RecentChat {
  conversationId: number;
  contactId: string;
  personImageURL: string;
  personName: string;
  lastMessage: string;
  lastMessageRecivedAt: string;
  noOfUnseenMessages: number;
}

export interface RecentChatGroups {
  [key: string]: RecentChat[];
}
