import React from "react";

const ConversationDivider: React.FC<{ date: string }> = ({ date }) => {
  return (
    <div className="conversation-divider">
      <span>{date}</span>
    </div>
  );
};

export default ConversationDivider;
