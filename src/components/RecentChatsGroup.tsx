import React from "react";
import { RecentChat } from "../types/RecentChats";

const RecentChatsGroup: React.FC<{
  chatGroupTitle: string;
  OnSelectConversation: (conversationId) => void;
  recentChats: RecentChat[];
}> = ({ chatGroupTitle, OnSelectConversation, recentChats }) => {
  return (
    <ul className="content-messages-list">
      <li className="content-message-title">
        <span>{chatGroupTitle}</span>
      </li>
      {recentChats.map((item, index) => (
        <li
          key={item.conversationId}
          onClick={() => OnSelectConversation(item.conversationId)}
        >
          <a href="#" id={`recentchat-${item.conversationId}`}>
            <img
              className="content-message-image"
              src={item.personImageURL}
              alt="Person image"
            />
            <span className="content-message-info">
              <span className="content-message-name">{item.personName}</span>
              <span className="content-message-text">{item.lastMessage}</span>
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
