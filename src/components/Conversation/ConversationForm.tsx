import React, { useState, useRef, useEffect } from "react";

const ConversationForm: React.FC<{
  activeConversationId: number | undefined;
  handleMessageSend: (msg) => void;
}> = ({ activeConversationId, handleMessageSend }) => {
  console.log(
    "    └────%cConversationForm",
    "color: #dc3545; font-weight: bold"
  );
  const [message, setMessage] = useState<string>("");
  const messageRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messageRef.current?.focus();
  }, [activeConversationId]);

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (message.length) handleMessageSend(message);
      setMessage("");
    }
  };

  const handleButtonClick = () => {
    if (message.length) handleMessageSend(message);
    setMessage("");
  };
  return (
    <div className="conversation-form">
      <button type="button" className="conversation-form-button">
        <i className="ri-emotion-line"></i>
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
};

export default ConversationForm;
