import React, { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import Picker from "emoji-picker-react";
import ConversationHeader from "../Conversation/ConversationHeader";
import { CP_API_URL_DEV } from "../../environment";
import {
  FriendRequest,
  FriendRequestMessage,
  PersonToInvite,
} from "../../types/FriendRequest";
import {
  getHubConnection,
  sendFriendRequest,
  sendFriendRequestMessage,
} from "../../services/signalR/SignalRService";
import { getGroupTitleFromDate } from "../../util/datetime";
import { ConversationGroups } from "../../types/Conversation";
import { RECEIVE_FRIEND_REQUEST_MESSAGE } from "../../services/signalR/constants";
import ConversationDivider from "./../Conversation/ConversationDivider";
import ConversationItem from "./../Conversation/ConversationItem";
import InvitationStatus from "./InvitationStatus";

interface InvitationChatWindowProps extends PersonToInvite {
  friendRequestId: number | undefined;
  handleBackNavigation: () => void;
  handleAfterSendFriendRequest: (friendRequestId) => void;
  updateUnseenMessages: (senderUserId, shouldIncrease) => void;
}

const CONTACT_IMAGE =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8cGVvcGxlfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60";

const formatConversationMessages = (
  messages: FriendRequestMessage[],
  isRequestSentByMe: boolean
): ConversationGroups => {
  const groups: ConversationGroups = {};

  messages.forEach((message) => {
    const groupKey = getGroupTitleFromDate(message.timestamp);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }

    groups[groupKey].push({
      id: `conversation-${message.id}`,
      isMe: isRequestSentByMe,
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

const InvitationChatWindow: React.FC<InvitationChatWindowProps> = ({
  name: personName,
  userId: personId,
  friendRequestId,
  profileImage,
  isOnline,
  lastSeenTimestamp,
  isRequestAlreadySent,
  handleBackNavigation,
  handleAfterSendFriendRequest,
  updateUnseenMessages,
}) => {
  console.log("%cInvitationChatWindow", "font-weight: bold; color: #dc3545; ");

  const [showPicker, setShowPicker] = useState(false);
  const [message, setMessage] = useState<string>("");
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const [friendRequest, setFriendRequest] = useState<FriendRequest | undefined>(
    undefined
  );

  const userId = sessionStorage.getItem("userId");
  const isRequestSentByMe = friendRequest?.senderUserId === userId;

  const onEmojiClick = (emojiObject, event) => {
    setMessage((prevInput) => prevInput + emojiObject.emoji);
  };

  const handleSendFriendRequest = () => {
    sendFriendRequest(personId, true, null, handleAfterSendFriendRequest);
  };

  const fetchFriendRequestMessages = useCallback(async () => {
    const response = await axios.get(
      `${CP_API_URL_DEV}/api/friend-request/${friendRequestId}/get-messages`
    );
    setFriendRequest(response.data);
  }, [friendRequestId]);

  useEffect(() => {
    if (friendRequestId) {
      fetchFriendRequestMessages();
    } else {
      setFriendRequest(undefined);
    }

    updateUnseenMessages(personId, false);

    const receiveMessageHandler = (senderUserId, friendRequestId, message) => {
      if (friendRequestId === friendRequest?.id) {
        setNewMessage(message);
      } else {
        updateUnseenMessages(senderUserId, true);
      }
      // setLastMessageOfConversation(message, true, senderUserId);
    };

    const hubConnection = getHubConnection();
    hubConnection.on(RECEIVE_FRIEND_REQUEST_MESSAGE, receiveMessageHandler);

    return () => {
      hubConnection.off(RECEIVE_FRIEND_REQUEST_MESSAGE, receiveMessageHandler);
    };
  }, [
    friendRequestId,
    friendRequest?.id,
    fetchFriendRequestMessages,
    personId,
  ]);

  const setNewMessage = useCallback((message: string) => {
    setFriendRequest((prevRequest) => {
      const updatedRequest: FriendRequest = JSON.parse(
        JSON.stringify(prevRequest)
      );
      const updatedMessages = updatedRequest.friendRequestMessages;
      updatedMessages.push({
        id: 0,
        content: message,
        timestamp: new Date().toISOString(),
      });

      updatedRequest.friendRequestMessages = updatedMessages;
      return updatedRequest;
    });
  }, []);

  const handleKeyDown = (event) => {
    if (!(event.key === "Enter" && message.length)) return;

    event.preventDefault();

    if (isRequestAlreadySent && friendRequestId) {
      sendFriendRequestMessage(friendRequestId, personId, message);
      setNewMessage(message);
    } else {
      sendFriendRequest(personId, false, message, handleAfterSendFriendRequest);
    }
    setMessage("");
  };

  const handleButtonClick = () => {
    if (!message.length) return;

    if (isRequestAlreadySent && friendRequestId) {
      sendFriendRequestMessage(friendRequestId, personId, message);
      setNewMessage(message);
    } else {
      sendFriendRequest(personId, false, message, handleAfterSendFriendRequest);
    }
    setMessage("");
  };

  console.log("isRequestSentByMe", isRequestSentByMe);

  return (
    <div className="conversation active" id="conversation-1">
      <ConversationHeader
        contactName={personName}
        onlineStatus={isOnline}
        lastSeenTimestamp={lastSeenTimestamp}
        profileImage={profileImage}
        handleBackNavigation={handleBackNavigation}
      />
      <div className="conversation-main" style={{ position: "relative" }}>
        <InvitationStatus
          isRequestAlreadySent={isRequestAlreadySent}
          isRequestSentByMe={isRequestSentByMe}
          personName={personName}
          handleSendFriendRequest={handleSendFriendRequest}
        />
        {friendRequest?.friendRequestMessages &&
          Object.entries(
            formatConversationMessages(
              friendRequest?.friendRequestMessages,
              isRequestSentByMe
            )
          ).map(([date, conversations], index) => (
            <ConversationGroup
              key={date}
              date={date}
              conversations={conversations}
              showWelcomeEmoji={friendRequest?.hasWaved && index === 0}
              isRequestSentByMe={isRequestSentByMe}
            />
          ))}
      </div>
      {!(friendRequest !== undefined && !isRequestSentByMe) && (
        <>
          {!friendRequestId ||
          (friendRequest?.friendRequestMessages &&
            friendRequest?.friendRequestMessages.length < 5) ? (
            <>
              {showPicker && (
                <Picker
                  style={{ width: "100%", height: "800px" }}
                  onEmojiClick={onEmojiClick}
                  previewConfig={{ showPreview: false }}
                  className="emoji-picker-root"
                />
              )}
              <ConversationInput
                message={message}
                showPicker={showPicker}
                setShowPicker={setShowPicker}
                setMessage={setMessage}
                handleKeyDown={handleKeyDown}
                handleButtonClick={handleButtonClick}
                messageRef={messageRef}
              />
            </>
          ) : (
            <div className="conversation-form-text">
              {`You need to wait for ${personName}'s reply to continue chatting.`}
            </div>
          )}
        </>
      )}
    </div>
  );
};

/*-----------------------------------------
|   Private component: ConversationGroup  |
-----------------------------------------*/
const ConversationGroup = ({
  date,
  conversations,
  showWelcomeEmoji,
  isRequestSentByMe,
}) => (
  <ul className="conversation-wrapper invitation-window">
    <ConversationDivider date={date} />
    {showWelcomeEmoji && (
      <div
        className={`welcome-emoji ${
          isRequestSentByMe ? "" : "welcome-emoji-left"
        }`}
      >
        <span>
          <span title="(wave)"></span>
        </span>
      </div>
    )}
    {conversations.map((conversation, index) => (
      <li
        key={conversation.id}
        className={`conversation-item ${
          !isRequestSentByMe ? "conversation-item-left" : ""
        }`}
      >
        <div className="conversation-item-side">
          <img className="conversation-item-image" src={CONTACT_IMAGE} alt="" />
        </div>
        <div className="conversation-item-content">
          <ConversationItem
            message={conversation.message}
            time={conversation.time}
          />
        </div>
      </li>
    ))}
  </ul>
);

/*-----------------------------------------
|   Private component: ConversationInput  |
-----------------------------------------*/
const ConversationInput = ({
  message,
  showPicker,
  setShowPicker,
  setMessage,
  handleKeyDown,
  handleButtonClick,
  messageRef,
}) => (
  <div className="conversation-form">
    <button
      type="button"
      className="conversation-form-button"
      onClick={() => setShowPicker((val) => !val)}
    >
      {showPicker ? (
        <i
          className="ri-arrow-down-s-line"
          onClick={() => messageRef.current?.focus()}
        ></i>
      ) : (
        <i className="ri-emotion-line"></i>
      )}
    </button>
    <div className="conversation-form-group">
      <textarea
        className="conversation-form-input"
        rows={1}
        placeholder="Type here..."
        value={message}
        ref={messageRef}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
      ></textarea>
      <button type="button" className="conversation-form-record">
        <i className="ri-mic-line"></i>
      </button>
    </div>
    <button
      type="button"
      className="conversation-form-button conversation-form-submit"
      onClick={handleButtonClick}
    >
      <i className="ri-send-plane-2-line"></i>
    </button>
  </div>
);

export default InvitationChatWindow;
