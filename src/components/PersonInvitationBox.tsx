import React, { useEffect, useRef, useState } from "react";
import ConversationForm from "./Conversation/ConversationForm";
import axios from "axios";
import Picker from "emoji-picker-react";
import ConversationHeader from "./Conversation/ConversationHeader";
import { CP_API_URL_DEV } from "../environment";
import { PersonToInvite } from "../types/SearchPeople";
import ConversationItem from "./Conversation/ConversationItem";

interface PersonInvitationBoxProps extends PersonToInvite {
  handleBackNavigation: () => void;
}

const CONTACT_IMAGE =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8cGVvcGxlfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60";

const PersonInvitationBox: React.FC<PersonInvitationBoxProps> = ({
  name: personName,
  userId: personId,
  profileImage,
  isOnline,
  lastSeenTimestamp,
  isRequestAlreadySent,
  handleBackNavigation,
}) => {
  console.log("%ContactInvitationBox", "font-weight: bold; color: #dc3545; ");

  const [showPicker, setShowPicker] = useState(false);
  const [message, setMessage] = useState<string>("");
  const messageRef = useRef<HTMLTextAreaElement>(null);

  const onEmojiClick = (emojiObject, event) => {
    setMessage((prevInput) => prevInput + emojiObject.emoji);
  };

  const handleKeyDown = (event) => {};

  const handleButtonClick = () => {};

  const handleSendFriendRequest = () => {
    const userId = sessionStorage.getItem("userId");
    if (userId) {
      axios
        .post(`${CP_API_URL_DEV}/api/user/send-friend-request`, {
          UserId: userId,
          ReceiverUserId: personId,
          HasWaved: true,
        })
        .then((response) => {
          console.log("Response:", response.data);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  };

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
        <div className="a">
          <i className="b ri-chat-smile-3-line"></i>
          <p className="c">
            {isRequestAlreadySent
              ? `Waiting for ${personName} to accept invitation.`
              : `Request ${personName} for a chat`}
          </p>
          {!isRequestAlreadySent && (
            <button className="d" onClick={handleSendFriendRequest}>
              Send Request
            </button>
          )}
        </div>
        {/* {messages &&
          Object.entries(messages).map(([date, conversations]) => (
            <ConversationGroup
              key={date}
              date={date}
              conversations={conversations}
            />
          ))} */}
        <ul className="conversation-wrapper invitation-window">
          <div className="conversation-divider">
            <span>Sun Apr 07 2024</span>
          </div>
          <div className="welcome-emoji">
            <span>
              <span title="(wave)"></span>
            </span>
          </div>
          <li className="conversation-item ">
            <div className="conversation-item-side">
              <img
                className="conversation-item-image"
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8cGVvcGxlfGVufDB8fDB8fHww&amp;auto=format&amp;fit=crop&amp;w=500&amp;q=60"
                alt=""
              />
            </div>
            <div className="conversation-item-content">
              <ConversationItem message={"Hello"} time={"02:20 PM"} />
            </div>
          </li>
        </ul>
      </div>
      {showPicker && (
        <Picker
          style={{ width: "100%", height: "800px" }}
          onEmojiClick={onEmojiClick}
          previewConfig={{ showPreview: false }}
          className="emoji-picker-root"
        />
      )}
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
    </div>
  );
};

export default PersonInvitationBox;
