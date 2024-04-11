import React from 'react';

const ConversationMessage: React.FC<{ isMe: boolean, children: React.ReactNode; }> = ({ isMe, children }) => {
  return (
    <li className={`conversation-item ${isMe ? 'me' : ''}`}>
      {children}
    </li>
  );
};

export default ConversationMessage;