export interface Conversation {
  id: string;
  isMe: boolean;
  imageURL: string;
  message: string;
  time: string;
}

export interface ConversationGroups {
  [key: string]: Conversation[];
}

interface Contact {
  contactId: string;
  name: string;
  profileImage: string | null;
  isOnline: boolean;
  lastSeenTimestamp: string;
  availabilityStatus: number;
}

interface LastMessage {
  messageId: number;
  content: string;
  timestamp: string;
  isFromCurrentUser: boolean;
  isWave: boolean;
}

export interface ConversationApiResponse {
  conversationId: number;
  friendRequestId: number;
  numberOfUnseenMessages: number;
  contact: Contact;
  conversationType: number;
  lastMessage: LastMessage;
}
export type RecentChatAPIResponse = ConversationApiResponse[];

export interface ConversationApiResponse_Partial {
  conversationId: number;
  friendRequestId: number;
  numberOfUnseenMessages: number;
  contact: Partial<Contact>;
  conversationType: number;
  lastMessage: Partial<LastMessage>;
}
// export type RecentChatAPIResponse_Partial = ConversationApiResponse_Partial[];

//   interface Message {
//     messageId: 1,
//     content: string,
//     timestamp: string,
//     isFromCurrentUser: boolean
//   }

//   export type MessagesAPIResponse = Message[];
