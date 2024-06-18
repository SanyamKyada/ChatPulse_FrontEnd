import React from "react";
import { RecentChat } from "../types/RecentChats";

const RecentChatsGroup: React.FC<{
  chatGroupTitle: string;
  OnSelectConversation: (conversationId) => void;
  recentChats: RecentChat[];
  OnSelectFriendRequest: (friendRequestId) => void;
}> = ({
  chatGroupTitle,
  OnSelectConversation,
  recentChats,
  OnSelectFriendRequest,
}) => {
  return (
    <ul className="content-messages-list">
      <li className="content-message-title">
        <span>{chatGroupTitle}</span>
      </li>
      {recentChats.map((item, index) => (
        <li
          key={item.conversationId}
          onClick={() => {
            if (item.conversationId) {
              OnSelectConversation(item.conversationId);
            } else {
              OnSelectFriendRequest(item.friendRequestId);
            }
          }}
        >
          <a href="#" id={`recentchat-${item.conversationId}`}>
            <img
              className="content-message-image"
              src={item.personImageURL}
              alt="Person image"
            />
            <span className="content-message-info">
              <span className="content-message-name">{item.personName}</span>
              {!item.isWave && (
                <span className="content-message-text">{item.lastMessage}</span>
              )}
              {item.isWave && (
                <span className="emoji-wrapper">
                  <span className="emoji" title="(wave)"></span>
                </span>
              )}
            </span>
            <span className="content-message-more">
              {item.noOfUnseenMessages > 0 && (
                <span className="content-message-unread">
                  {item.noOfUnseenMessages}
                </span>
              )}
              <span className="content-message-time">
                {item.lastMessageRecivedAt}
              </span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
};

export default RecentChatsGroup;
