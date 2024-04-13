import React, { FC } from "react";
import ConversationDivider from "./ConversationDivider";
import ConversationItem from "./ConversationItem";
import { Conversation } from "../../types/Conversation";

const ConversationGroup: FC<{
  date: string;
  conversations: Conversation[];
}> = ({ date, conversations }) => {
  console.log(
    "    └────%cConversationGroup",
    "color: #dc3545; font-weight: bold"
  );
  const groupConsecutiveItems = (conversations: Conversation[]) => {
    const groupedConversations: Conversation[][] = [];
    let currentGroup: Conversation[] = [];

    conversations.forEach((conversation, index) => {
      if (index === 0 || conversation.isMe !== conversations[index - 1].isMe) {
        if (currentGroup.length > 0) {
          groupedConversations.push(currentGroup);
        }
        currentGroup = [conversation];
      } else {
        currentGroup.push(conversation);
      }
    });

    if (currentGroup.length > 0) {
      groupedConversations.push(currentGroup);
    }

    return groupedConversations;
  };

  const groupedConversations = groupConsecutiveItems(conversations);

  return (
    <ul className="conversation-wrapper">
      <ConversationDivider date={date} />
      {groupedConversations.map((group, index) => (
        <li
          key={index}
          className={`conversation-item ${
            group[0].isMe ? "" : "conversation-item-left"
          }`}
        >
          <div className="conversation-item-side">
            <img
              className="conversation-item-image"
              src={group[0].imageURL}
              alt=""
            />
          </div>
          <div className="conversation-item-content">
            {group.map((conversation, index) => (
              <ConversationItem
                key={index}
                message={conversation.message}
                time={conversation.time}
              />
            ))}
          </div>
        </li>
      ))}
    </ul>
  );
};

export default ConversationGroup;
