import React, { useEffect, useState } from "react";
import { formatLastActivity } from "../../util/datetime";

const ConversationHeader: React.FC<{
  handleBackNavigation: (p) => void;
  contactName: string;
  onlineStatus: boolean;
  lastSeenTimestamp: string;
  profileImage: string | null;
  availabilityStatus: number;
}> = ({
  contactName,
  onlineStatus,
  lastSeenTimestamp,
  profileImage,
  availabilityStatus,
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

  const AvailabilityStatusElement =
    availabilityStatus && availabilityStatus !== 4 ? (
      <div
        className={`conversation-user-status ${
          availabilityStatus === 1
            ? onlineStatus
              ? "online"
              : "offline"
            : availabilityStatus === 2
            ? "away"
            : "do-not-disturb"
        }`}
      >
        {availabilityStatus === 1
          ? onlineStatus
            ? "online"
            : lastActivity
          : availabilityStatus === 2
          ? "Away"
          : "Do not disturb"}
      </div>
    ) : null;

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
          {AvailabilityStatusElement}
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
