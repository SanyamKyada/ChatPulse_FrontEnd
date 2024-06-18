import React, { FC } from "react";

interface InvitationStatusProps {
  isRequestAlreadySent: boolean;
  isRequestSentByMe: boolean;
  personName: string;
  handleSendFriendRequest: () => void;
  handleAcceptFriendRequest: () => void;
}

const InvitationStatus: FC<InvitationStatusProps> = ({
  isRequestAlreadySent,
  isRequestSentByMe,
  personName,
  handleSendFriendRequest,
  handleAcceptFriendRequest,
}) => {
  return (
    <div className="invitation-status">
      <i className="smiley ri-chat-smile-3-line"></i>
      <p className="invitation-text">
        {isRequestAlreadySent
          ? isRequestSentByMe
            ? `Waiting for ${personName} to accept invitation.`
            : `${
                personName.split(" ")[1] ?? personName
              } wants to connect with you`
          : `Request ${personName} for a chat`}
      </p>
      {!isRequestAlreadySent && (
        <button className="invitation-action" onClick={handleSendFriendRequest}>
          Send Request
        </button>
      )}
      {isRequestAlreadySent && !isRequestSentByMe && (
        <div className="invitation-actions">
          <button className="invitation-action">Decline</button>
          <button
            className="invitation-action"
            onClick={handleAcceptFriendRequest}
          >
            Accept
          </button>
        </div>
      )}
    </div>
  );
};

export default InvitationStatus;
