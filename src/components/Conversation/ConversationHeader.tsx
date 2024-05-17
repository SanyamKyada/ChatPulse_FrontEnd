import React, { useEffect, useState } from "react";
import { formatLastActivity } from "../../util/datetime";

const ConversationHeader: React.FC<{
  handleBackNavigation: (p) => void;
  contactName: string;
  onlineStatus: boolean;
  lastSeenTimestamp: string;
  profileImage: string | null;
}> = ({
  contactName,
  onlineStatus,
  lastSeenTimestamp,
  profileImage,
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
        {profileImage === null ? (
          <div className="conversation-user-image image-text">
            {contactName.split(" ").reduce((a, b, c, d) => a[0] + b[0])}
          </div>
        ) : (
          <img className="conversation-user-image" src={profileImage} alt="" />
        )}
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
