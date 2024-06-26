import {
  ConversationApiResponse_Partial,
  RecentChatAPIResponse,
} from "../types/Conversation";
import { PersonToInvite } from "../types/FriendRequest";
import { RecentChatGroups } from "../types/RecentChats";
import { getGroupTitleFromDate } from "./datetime";
const baseImagesUrl = import.meta.env.VITE_IMAGES_URL;

const CONTACT_IMAGE =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8cGVvcGxlfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60";

export const conversationHelper = {
  groupConversationsByTimestamp: (conversations: RecentChatAPIResponse) => {
    const sortedConversations = conversations.sort((a, b) => {
      const timestampA = new Date(a.lastMessage.timestamp);
      const timestampB = new Date(b.lastMessage.timestamp);
      return timestampB.getTime() - timestampA.getTime();
    });
    return sortedConversations.reduce(
      (groups: RecentChatGroups, conversation) => {
        const groupKey = getGroupTitleFromDate(
          conversation.lastMessage.timestamp
        );
        if (!groups[groupKey]) {
          groups[groupKey] = [];
        }

        groups[groupKey].push({
          conversationId: conversation.conversationId,
          friendRequestId: conversation.friendRequestId,
          personImageURL: conversation.contact.profileImage
            ? `${baseImagesUrl}/${conversation.contact.profileImage}`
            : CONTACT_IMAGE,
          personName: conversation.contact.name,
          contactId: conversation.contact.contactId,
          lastMessage: conversation.lastMessage.content,
          lastMessageRecivedAt: new Date(
            conversation.lastMessage.timestamp
          ).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          noOfUnseenMessages: conversation.numberOfUnseenMessages,
          isOnline: conversation.contact.isOnline,
          lastSeenTimestamp: conversation.contact.lastSeenTimestamp,
          isWave: conversation.lastMessage.isWave,
          availabilityStatus: conversation.contact.availabilityStatus,
        });
        return groups;
      },
      {}
    );
  },
  getPersonDetails: (
    recentChats: RecentChatAPIResponse,
    conversationId: number | undefined,
    friendRequestId: number | undefined,
    personToInviteDetails: PersonToInvite
  ) => {
    const activeConversation = recentChats.find(
      (chat) =>
        chat.conversationId === conversationId ||
        chat.friendRequestId === friendRequestId
    );
    return activeConversation
      ? {
          contactId: activeConversation.contact.contactId,
          contactName: activeConversation.contact.name,
          contactOnlineStatus: activeConversation.contact.isOnline,
          lastSeenTimestamp: activeConversation.contact.lastSeenTimestamp,
          profileImage: activeConversation.contact.profileImage
            ? `${baseImagesUrl}/${activeConversation.contact.profileImage}`
            : CONTACT_IMAGE,
          availabilityStatus: activeConversation.contact.availabilityStatus,
        }
      : {
          contactId: personToInviteDetails.userId,
          contactName: personToInviteDetails.name,
          contactOnlineStatus: personToInviteDetails.isOnline,
          lastSeenTimestamp: personToInviteDetails.lastSeenTimestamp,
          profileImage: personToInviteDetails.profileImage
            ? `${baseImagesUrl}/${personToInviteDetails.profileImage}`
            : CONTACT_IMAGE,
          availabilityStatus: personToInviteDetails.availabilityStatus,
        };
  },
  updateChatState: (
    prevChats: RecentChatAPIResponse,
    userId: string | undefined,
    conversationId: number | undefined,
    friendRequestId: number | undefined,
    updates: Partial<ConversationApiResponse_Partial>
  ): RecentChatAPIResponse => {
    const conversationIndex = userId
      ? prevChats.findIndex((chat) => chat.contact.contactId === userId)
      : conversationId
      ? prevChats.findIndex((chat) => chat.conversationId === conversationId)
      : prevChats.findIndex((chat) => chat.friendRequestId === friendRequestId);

    if (conversationIndex !== -1) {
      const updatedConversation = {
        ...prevChats[conversationIndex],
        ...updates,
        contact: {
          ...prevChats[conversationIndex].contact,
          ...updates.contact,
        },
        lastMessage: {
          ...prevChats[conversationIndex].lastMessage,
          ...updates.lastMessage,
        },
      };
      const updatedChats = [...prevChats];
      updatedChats[conversationIndex] = updatedConversation;
      return updatedChats;
    }
    return prevChats;
  },
};
