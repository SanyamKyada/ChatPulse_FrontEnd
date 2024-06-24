import React, { useEffect, useRef, useState, useCallback } from "react";
import ConversationGroup from "./ConversationGroup";
import { ConversationGroups } from "../../types/Conversation";
import ConversationForm from "./ConversationForm";
import { getGroupTitleFromDate } from "../../util/datetime";
import {
  getHubConnection,
  sendMessage,
} from "../../services/signalR/SignalRService";
import ConversationHeader from "./ConversationHeader";
import TypingIndicator from "../TypingIndicator";
import { RECEIVE_MESSAGE } from "../../services/signalR/constants";
import { getUserId } from "../../util/auth";
import { ConversationApi } from "../../axios";
import useDebounce from "../../hooks/useDebounce";

const CONTACT_IMAGE =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8cGVvcGxlfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60";

const formatConversationMessages = (
  existingGroups: ConversationGroups | null,
  messages: any[]
): ConversationGroups => {
  let groups = existingGroups
    ? new Map(Object.entries(existingGroups))
    : new Map<
        string,
        {
          id: string;
          isMe: boolean;
          imageURL: string;
          message: string;
          time: string;
        }[]
      >();

  messages.forEach((message) => {
    const groupKey = getGroupTitleFromDate(message.timestamp);
    const newMessage = {
      id: message.messageId,
      isMe: message.isFromCurrentUser,
      imageURL: CONTACT_IMAGE,
      message: message.content,
      time: new Date(message.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    if (!groups.has(groupKey)) {
      // If the group key doesn't exist, add it at the beginning
      groups = new Map([[groupKey, [newMessage]], ...groups]);
    } else {
      // Add the new message at the beginning of the existing group
      const groupMessages = groups.get(groupKey);
      groupMessages.unshift(newMessage);
      groups.set(groupKey, groupMessages);
    }
  });

  // Convert the Map back to an object
  return Object.fromEntries(groups);
};

type ConversationMainProps = {
  activeConversationId: number | undefined;
  contactId: string;
  contactName: string;
  onlineStatus: boolean;
  lastSeenTimestamp: string;
  profileImage: string | null;
  availabilityStatus: number;
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
  availabilityStatus,
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
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [skip, setSkip] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchConversationMessages = useCallback(async () => {
    if (loading || !hasMore) return; // Prevent fetch if already loading or no more messages

    setLoading(true);
    try {
      const userId = getUserId();
      const fetchedMessages = await ConversationApi.GetConversationMessages(
        activeConversationId,
        userId,
        skip
      );
      const messageGroups = formatConversationMessages(
        messages,
        fetchedMessages
      );
      setMessages(messageGroups);
      if (fetchedMessages.length < 20) {
        setHasMore(false);
      } else {
        setSkip((prev) => prev + 20);
      }
    } catch (error) {
      console.error("Error fetching conversation messages:", error);
    }
    setLoading(false);
  }, [activeConversationId, skip, hasMore]);

  useEffect(() => {
    const initFetchMessages = async () => {
      if (activeConversationId) {
        //To fetch initial messages when conversation changes
        setSkip(0);
        setMessages({});
        setHasMore(true);
        const userId = getUserId();
        const fetchedMessages = await ConversationApi.GetConversationMessages(
          activeConversationId,
          userId,
          0,
          40
        );
        const messageGroups = formatConversationMessages(null, fetchedMessages);
        setMessages(messageGroups);
        setToggleScroll((prev) => !prev);
        if (fetchedMessages.length < 40) {
          setHasMore(false);
        } else {
          setSkip(40);
        }
      }
    };
    initFetchMessages();
  }, [activeConversationId]);

  useEffect(() => {
    const updateMessageStatus = async () => {
      const userId = getUserId();
      await ConversationApi.UpdateMessageStatus(activeConversationId, userId);
      updateUnseenMessages(contactId, false);
    };
    updateMessageStatus();

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

    let hubConnection;

    const initializeHandlers = async () => {
      hubConnection = await getHubConnection();
      hubConnection.on(RECEIVE_MESSAGE, receiveMessageHandler);
    };

    initializeHandlers();

    updateMessageStatus();

    return () => {
      hubConnection.off(RECEIVE_MESSAGE, receiveMessageHandler);
    };
  }, [contactId]);

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

    setToggleScroll((prev) => !prev);
  };

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [toggleScroll, activeConversationId]);

  const handleSendMessage = (message) => {
    setNewMessage(message, true);
    if (activeConversationId)
      sendMessage(contactId, message, activeConversationId);

    const userId = getUserId();
    if (userId) setLastMessageOfConversation(message, false, null);
  };

  const debouncedFetchConversationMessages = useDebounce(
    fetchConversationMessages,
    300
  );
  const handleScroll = () => {
    if (chatWindowRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatWindowRef.current;
      const scrollPercent = (scrollTop * 100) / scrollHeight;
      if (scrollPercent < 30) {
        debouncedFetchConversationMessages();
      }
    }
  };

  return (
    <div className="conversation active" id="conversation-1">
      <ConversationHeader
        contactName={contactName}
        onlineStatus={onlineStatus}
        lastSeenTimestamp={lastSeenTimestamp}
        profileImage={profileImage}
        availabilityStatus={availabilityStatus}
        handleBackNavigation={handleBackNavigation}
      />
      <div
        className="conversation-main"
        ref={chatWindowRef}
        onScroll={handleScroll}
      >
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
