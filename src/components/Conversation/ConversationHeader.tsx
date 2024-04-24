import React, { useEffect, useState } from "react";
import { formatLastActivity } from "../../util/datetime";

const ConversationHeader: React.FC<{
  handleBackNavigation: (p) => void;
  contactName: string;
  onlineStatus: boolean;
  lastSeenTimestamp: string;
}> = ({
  contactName,
  onlineStatus,
  lastSeenTimestamp,
  handleBackNavigation,
}) => {
  console.log(
    "    └────%cConversationHeader",
    "color: #dc3545; font-weight: bold"
  );
  const [lastActivity, setLastActivity] = useState<string>(
    formatLastActivity(lastSeenTimestamp)
  );

  useEffect(() => {
    setLastActivity(formatLastActivity(lastSeenTimestamp));

    const now: Date = new Date();
    const activityDate: Date = new Date(lastSeenTimestamp);
    const diffInMilliseconds: number = now.getTime() - activityDate.getTime();

    if (diffInMilliseconds / 60000 < 60) {
      const activityUpdateInterval = setInterval(
        () => setLastActivity(formatLastActivity(lastSeenTimestamp)),
        60000
      );
      return () => clearInterval(activityUpdateInterval);
    }
  }, [lastSeenTimestamp]);

  return (
    <div className="conversation-top">
      <button
        type="button"
        className="conversation-back"
        onClick={() => handleBackNavigation(undefined)}
      >
        <i className="ri-arrow-left-line"></i>
      </button>
      <div className="conversation-user">
        <img
          className="conversation-user-image"
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8cGVvcGxlfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60"
          alt=""
        />
        <div>
          <div className="conversation-user-name">{contactName}</div>
          <div
            className={`conversation-user-status ${
              onlineStatus ? "online" : "offline"
            }`}
          >
            {onlineStatus ? "online" : lastActivity}
          </div>
        </div>
      </div>
      <div className="conversation-buttons">
        <button type="button">
          <i className="ri-phone-fill"></i>
        </button>
        <button type="button">
          <i className="ri-vidicon-line"></i>
        </button>
        <button type="button">
          <i className="ri-information-line"></i>
        </button>
      </div>
    </div>
  );
};

export default ConversationHeader;
