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
// const userId = sessionStorage.getItem("userId");

const Content: React.FC = () => {
  const [conversationId, setConversationId] = useState<number | undefined>(
    undefined
  );
  // const [conversations, setConversations] = useState<RecentChatAPIResponse>([]);
  const [recentChatGroups, setRecentChatGroups] = useState<RecentChatGroups>(
    {}
  );
  // const [conversationGroups, setConversationGroups] = useState<{
  //   [key: number]: ConversationGroups;
  // }>({});

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
        });
        return groups;
      }, {});
    };

    fetchConversations();
  }, []);

  // useEffect(() => {
  //   const fetchConversationMessages = async () => {
  //     try {
  //       const response = await axios.get(
  //         `https://localhost:7003/api/conversation/${conversationId}/messages?userId=${userId}&skip=0&take=20`
  //       );
  //       const messageGroups = formatConversationMessages(response.data);
  //       let updatedMessages = { ...conversationGroups };
  //       if (conversationId) {
  //         updatedMessages[conversationId] = messageGroups;
  //       }
  //       setConversationGroups(updatedMessages);
  //     } catch (error) {
  //       console.error("Error fetching conversation messages:", error);
  //     }
  //   };

  //   if (conversationId && !conversationGroups[conversationId])
  //     fetchConversationMessages();
  // }, [conversationId]);

  // const formatConversationMessages = (messages: any[]): ConversationGroups => {
  //   const groups: ConversationGroups = {};

  //   messages.forEach((message) => {
  //     const groupKey = getGroupTitleFromDate(message.timestamp);
  //     if (!groups[groupKey]) {
  //       groups[groupKey] = [];
  //     }

  //     groups[groupKey].push({
  //       id: `conversation-${message.messageId}`,
  //       isMe: message.isFromCurrentUser,
  //       imageURL: CONTACT_IMAGE,
  //       message: message.content,
  //       time: new Date(message.timestamp).toLocaleTimeString([], {
  //         hour: "2-digit",
  //         minute: "2-digit",
  //       }),
  //     });
  //   });

  //   return groups;
  // };
  let contactId, contactName;
  if (conversationId && Object.keys(recentChatGroups).length) {
    const conversation = Object.values(recentChatGroups)
      .flat()
      .find((x) => x.conversationId == conversationId);
    contactId = conversation?.contactId;
    contactName = conversation?.personName;
  }

  return (
    <div className="chat-content">
      <RecentChats
        recentChatGroups={recentChatGroups}
        OnSelectConversation={SetConversationId}
      />
      {/* Object.keys(conversationGroups).length > 0 ? (*/}
      {conversationId ? (
        <ConversationMain
          activeConversationId={conversationId}
          contactId={contactId}
          contactName={contactName}
          handleBackNavigation={SetConversationId}
          // contactId={}
          // handleMessageSend={setNewMessage}
          // conversationGroups={
          //   (conversationId && conversationGroups[conversationId]) || {}
          // }
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
