import React, { useEffect, useRef, useState } from "react";
import ConversationGroup from "./ConversationGroup";
import { ConversationGroups } from "../../types/Conversation";
import ConversationForm from "./ConversationForm";
import { getGroupTitleFromDate } from "../../util/datetime";
import axios from "axios";
import { getHubConnection, sendMessage } from "../../Services/SignalRService";
import ConversationHeader from "./ConversationHeader";
import TypingIndicator from "../TypingIndicator";
import { CP_API_URL_DEV } from "../../environment";

const CONTACT_IMAGE =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8cGVvcGxlfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60";

type ConversationMainProps = {
  activeConversationId: number | undefined;
  contactId: string;
  contactName: string;
  onlineStatus: boolean;
  lastSeenTimestamp: string;
  profileImage: string | null;
  handleBackNavigation: (p) => void;
  updateUnseenMessages: (p1: string, p2: boolean) => void;
  setLastMessageOfConversation: (
    message: string,
    isMessageReceived: boolean,
    senderUserId: string | null
  ) => void;
};

const ConversationMain: React.FC<ConversationMainProps> = ({
  activeConversationId,
  contactId,
  contactName,
  onlineStatus,
  lastSeenTimestamp,
  profileImage,
  handleBackNavigation,
  updateUnseenMessages,
  setLastMessageOfConversation,
}) => {
  console.log("%cConversationMain", "font-weight: bold; color: #dc3545; ");
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<ConversationGroups>({});
  const [toggleScroll, setToggleScroll] = useState<boolean>(false);
  const typeIndicatorRef = useRef<{ hideTypingIndicator: () => void } | null>(
    null
  );

  useEffect(() => {
    const fetchConversationMessages = async () => {
      try {
        const userId = sessionStorage.getItem("userId");
        const response = await axios.get(
          `${CP_API_URL_DEV}/api/conversation/${activeConversationId}/messages?userId=${userId}&skip=0&take=20`
        );
        const messageGroups = formatConversationMessages(response.data);
        setMessages(messageGroups);
        setToggleScroll((prev) => !prev);
      } catch (error) {
        console.error("Error fetching conversation messages:", error);
      }
    };

    if (activeConversationId) {
      fetchConversationMessages();
    }
  }, [activeConversationId]);

  useEffect(() => {
    const receiveMessageHandler = (senderUserId, message) => {
      if (senderUserId === contactId) {
        setNewMessage(message);
        updateMessageStatus();
        if (typeIndicatorRef.current) {
          typeIndicatorRef.current.hideTypingIndicator();
        }
      } else {
        updateUnseenMessages(senderUserId, true);
      }
      setLastMessageOfConversation(message, true, senderUserId);
    };

    const hubConnection = getHubConnection();
    hubConnection.on("ReceiveMessage", receiveMessageHandler);

    const updateMessageStatus = async () => {
      const userId = sessionStorage.getItem("userId");
      const response = await axios.put(
        `${CP_API_URL_DEV}/api/conversation/${activeConversationId}/messages/seen/${userId}`
      );
      updateUnseenMessages(contactId, false);
    };
    updateMessageStatus();

    return () => {
      hubConnection.off("ReceiveMessage", receiveMessageHandler);
    };
  }, [contactId]);

  const formatConversationMessages = (messages: any[]): ConversationGroups => {
    const groups: ConversationGroups = {};

    messages.forEach((message) => {
      const groupKey = getGroupTitleFromDate(message.timestamp);
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }

      groups[groupKey].push({
        id: `conversation-${message.messageId}`,
        isMe: message.isFromCurrentUser,
        imageURL: CONTACT_IMAGE,
        message: message.content,
        time: new Date(message.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
    });

    return groups;
  };

  const setNewMessage = (message, isMe = false) => {
    setMessages((currentState) => {
      const updatedMessages = { ...currentState };
      const msgObject = {
        id: `conversation-${123}`,
        isMe: isMe,
        imageURL: CONTACT_IMAGE,
        message: message,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      updatedMessages["Today"] = [
        ...(updatedMessages["Today"] || []),
        msgObject,
      ];
      return updatedMessages;
    });
  };

  const keys = messages && Object.keys(messages);
  const lastKey = keys && keys[keys.length - 1];
  const todayMessages = lastKey && lastKey === "Today" ? messages[lastKey] : [];

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [toggleScroll, activeConversationId, todayMessages?.length]);

  const handleSendMessage = (message) => {
    setNewMessage(message, true);
    sendMessage(contactId, message, activeConversationId);

    const userId = sessionStorage.getItem("userId");
    if (userId) setLastMessageOfConversation(message, false, null);
  };

  return (
    <div className="conversation active" id="conversation-1">
      <ConversationHeader
        contactName={contactName}
        onlineStatus={onlineStatus}
        lastSeenTimestamp={lastSeenTimestamp}
        profileImage={profileImage}
        handleBackNavigation={handleBackNavigation}
      />
      <div className="conversation-main" ref={chatWindowRef}>
        {messages &&
          Object.entries(messages).map(([date, conversations]) => (
            <ConversationGroup
              key={date}
              date={date}
              conversations={conversations}
            />
          ))}
        <TypingIndicator
          contactId={contactId}
          toggleScroll={() => {
            setToggleScroll((prev) => !prev);
          }}
          ref={typeIndicatorRef}
        />
      </div>
      <ConversationForm
        activeConversationId={activeConversationId}
        handleMessageSend={handleSendMessage}
      />
    </div>
  );
};

export default ConversationMain;
