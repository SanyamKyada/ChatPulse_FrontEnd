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

const CONTACT_IMAGE =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8cGVvcGxlfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60";

const Content: React.FC = () => {
  const [conversationId, setConversationId] = useState<number | undefined>(
    undefined
  );

  const [recentChatGroups, setRecentChatGroups] = useState<RecentChatGroups>(
    {}
  );

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
        setRecentChatGroups(groupConversationsByTimestamp(response.data));
      } catch (error) {
        console.error(error);
      }
    };

    const groupConversationsByTimestamp = (
      conversations: RecentChatAPIResponse
    ) => {
      return conversations.reduce((groups: RecentChatGroups, conversation) => {
        const groupKey = getGroupTitleFromDate(
          conversation.lastMessage.timestamp
        );
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

    fetchConversations();
  }, []);

  let contactId, contactName, contactOnlineStatus, lastSeenTimestamp;
  if (conversationId && Object.keys(recentChatGroups).length) {
    const conversation = Object.values(recentChatGroups)
      .flat()
      .find((x) => x.conversationId == conversationId);
    contactId = conversation?.contactId;
    contactName = conversation?.personName;
    contactOnlineStatus = conversation?.isOnline;
    lastSeenTimestamp = conversation?.lastSeenTimestamp;
  }

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
