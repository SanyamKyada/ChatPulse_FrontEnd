import React, { useEffect, useRef, useState } from "react";
import ConversationGroup from "./ConversationGroup";
import { ConversationGroups } from "../../types/Conversation";
import ConversationForm from "./ConversationForm";
import { formatLastActivity, getGroupTitleFromDate } from "../../util/datetime";
import axios from "axios";
import { receiveMessage, sendMessage } from "../../Services/SignalRService";

const CONTACT_IMAGE =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8cGVvcGxlfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60";

type ConversationMainProps = {
  activeConversationId: number | undefined;
  contactId: string;
  contactName: string;
  onlineStatus: boolean;
  lastSeenTimestamp: string;
  handleBackNavigation: (p) => void;
};

const ConversationMain: React.FC<ConversationMainProps> = ({
  activeConversationId,
  contactId,
  contactName,
  onlineStatus,
  lastSeenTimestamp,
  handleBackNavigation,
}) => {
  console.log("%cConversationMain", "font-weight: bold; color: #dc3545; ");
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<ConversationGroups>({});
  const [isDataFetched, setIsDataFetched] = useState<boolean>(false);

  useEffect(() => {
    const fetchConversationMessages = async () => {
      try {
        const userId = sessionStorage.getItem("userId");
        const response = await axios.get(
          `https://localhost:7003/api/conversation/${activeConversationId}/messages?userId=${userId}&skip=0&take=20`
        );
        const messageGroups = formatConversationMessages(response.data);
        setMessages(messageGroups);
        setIsDataFetched(true);
      } catch (error) {
        console.error("Error fetching conversation messages:", error);
      }
    };

    if (activeConversationId) fetchConversationMessages();
  }, [activeConversationId]);

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
  }, [isDataFetched, activeConversationId, todayMessages?.length]);

  const handleSendMessage = (message) => {
    setNewMessage(message, true);
    sendMessage(contactId, message);
  };

  useEffect(() => {
    receiveMessage((senderUserId, message) => {
      setNewMessage(message);
    });
  }, []);

  return (
    <div className="conversation active" id="conversation-1">
      <div className="conversation-top">
        <button
          type="button"
          className="conversation-back"
          onClick={() => handleBackNavigation(undefined)}
        >
          <i className="ri-arrow-left-line"></i>
        </button>
        <div className="conversation-user">
          <img
            className="conversation-user-image"
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8cGVvcGxlfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60"
            alt=""
          />
          <div>
            <div className="conversation-user-name">{contactName}</div>
            <div
              className={`conversation-user-status ${
                onlineStatus ? "online" : "offline"
              }`}
            >
              {onlineStatus ? "online" : formatLastActivity(lastSeenTimestamp)}
            </div>
          </div>
        </div>
        <div className="conversation-buttons">
          <button type="button">
            <i className="ri-phone-fill"></i>
          </button>
          <button type="button">
            <i className="ri-vidicon-line"></i>
          </button>
          <button type="button">
            <i className="ri-information-line"></i>
          </button>
        </div>
      </div>
      <div className="conversation-main" ref={chatWindowRef}>
        {messages &&
          Object.entries(messages).map(([date, conversations]) => (
            <ConversationGroup
              key={date}
              date={date}
              conversations={conversations}
            />
          ))}
      </div>
      <ConversationForm
        activeConversationId={activeConversationId}
        handleMessageSend={handleSendMessage}
      />
    </div>
  );
};

export default ConversationMain;
