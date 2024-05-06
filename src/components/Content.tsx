import React, { useEffect, useState } from "react";
import RecentChats from "./RecentChats";
import ConversationMain from "./Conversation/ConversationMain";
import axios from "axios";
import {
  ConversationGroups,
  RecentChatAPIResponse,
} from "../types/Conversation";
import { RecentChatGroups } from "../types/RecentChats";
import { getGroupTitleFromDate } from "../util/datetime";
import {
  getHubConnection,
  handleContactStatusChange,
} from "../Services/SignalRService";
import { isLoggedIn } from "../Services/AuthService";

const CONTACT_IMAGE =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8cGVvcGxlfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60";

const groupConversationsByTimestamp = (
  conversations: RecentChatAPIResponse
) => {
  return conversations.reduce((groups: RecentChatGroups, conversation) => {
    const groupKey = getGroupTitleFromDate(conversation.lastMessage.timestamp);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push({
      conversationId: conversation.conversationId,
      personImageURL: CONTACT_IMAGE,
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
    });
    return groups;
  }, {});
};

const Content: React.FC = () => {
  const [conversationId, setConversationId] = useState<number | undefined>(
    undefined
  );

  const [recentChats, setRecentChats] = useState<RecentChatAPIResponse>([]);

  const recentChatGroups = groupConversationsByTimestamp(recentChats);

  const SetConversationId = (conversationId) => {
    setConversationId(conversationId);
  };

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const userId = sessionStorage.getItem("userId");
        const response = await axios.get(
          `https://localhost:7003/api/conversation/${userId}/recent`
        );
        setRecentChats(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchConversations();

    if (isLoggedIn()) {
      handleContactStatusChange((userId, isOnline) => {
        setRecentChats((prevChats: RecentChatAPIResponse) => {
          const conversationIndex = prevChats.findIndex(
            (x) => x.contact.contactId == userId
          );
          if (conversationIndex !== -1) {
            const updatedConversation = {
              ...prevChats[conversationIndex],
            };

            updatedConversation.contact.isOnline = isOnline;
            updatedConversation.contact.lastSeenTimestamp =
              new Date().toLocaleString();

            const updatedChats = [...prevChats];
            updatedChats[conversationIndex] = updatedConversation;
            return updatedChats;
          }

          return prevChats;
        });
      });
    }
  }, []);

  //This effect will run when no conversation is selected.
  useEffect(() => {
    if (isLoggedIn()) {
      const receiveMessageHandler = (senderUserId, message) => {
        updateUnseenMessages(senderUserId, true);
      };
      const hubConnection = getHubConnection();
      if (conversationId === undefined) {
        //Handle recive message when no conversation is selected
        hubConnection.on("ReceiveMessage", receiveMessageHandler);
      }
      return () => {
        hubConnection.off("ReceiveMessage", receiveMessageHandler);
      };
    }
  }, [conversationId === undefined]);

  let contactId, contactName, contactOnlineStatus, lastSeenTimestamp;
  if (conversationId && recentChats.length) {
    const activeConversation = recentChats.find(
      (x) => x.conversationId == conversationId
    );
    contactId = activeConversation?.contact.contactId;
    contactName = activeConversation?.contact.name;
    contactOnlineStatus = activeConversation?.contact.isOnline;
    lastSeenTimestamp = activeConversation?.contact.lastSeenTimestamp;
  }

  const updateUnseenMessages = (
    senderUserId: string,
    shouldIncrease: boolean
  ) => {
    setRecentChats((prevChats: RecentChatAPIResponse) => {
      const conversationIndex = prevChats.findIndex(
        (x) => x.contact.contactId == senderUserId
      );
      if (conversationIndex !== -1) {
        const updatedConversation = {
          ...prevChats[conversationIndex],
        };

        updatedConversation.numberOfUnseenMessages = shouldIncrease
          ? updatedConversation?.numberOfUnseenMessages + 1
          : 0;

        const updatedChats = [...prevChats];
        updatedChats[conversationIndex] = updatedConversation;
        return updatedChats;
      }

      return prevChats;
    });
  };

  return (
    <div className="chat-content">
      <RecentChats
        recentChatGroups={recentChatGroups}
        OnSelectConversation={SetConversationId}
      />

      {conversationId ? (
        <ConversationMain
          activeConversationId={conversationId}
          onlineStatus={contactOnlineStatus}
          contactId={contactId}
          contactName={contactName}
          lastSeenTimestamp={lastSeenTimestamp}
          handleBackNavigation={SetConversationId}
          updateUnseenMessages={updateUnseenMessages}
        />
      ) : (
        <div className="conversation conversation-default active">
          <i className="ri-chat-3-line"></i>
          <p>Select chat and view conversation!</p>
        </div>
      )}
    </div>
  );
};

export default Content;
