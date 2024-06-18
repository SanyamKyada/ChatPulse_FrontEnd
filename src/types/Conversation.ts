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

//   interface Message {
//     messageId: 1,
//     content: string,
//     timestamp: string,
//     isFromCurrentUser: boolean
//   }

//   export type MessagesAPIResponse = Message[];
