import React from "react";

interface SidebarProfileProps {
  userName: string;
  userEmail: string;
  handleLogout: () => void;
}

const SidebarProfile: React.FC<SidebarProfileProps> = ({
  userName,
  userEmail,
  handleLogout,
}) => {
  return (
    <div className="sidebar-user-profile">
      <div className="profile-header">
        <i className="ri-chat-1-fill"></i>
        <span>Chatpulse</span>
        <div className="btn-close">
          <i className="ri-close-line"></i>
        </div>
      </div>
      <hr></hr>
      <div className="profile-body">
        <ul className="user-details">
          <li>
            <button>
              <div>
                <i className="ri-camera-line"></i>
              </div>
            </button>
          </li>
          <li>
            <div>
              <div className="n">{userName}</div>
              <div className="e">{userEmail}</div>
            </div>
            <div className="sh">Share what you're upto</div>
          </li>
          <li>
            <button className="btn-profile-share">
              <i className="ri-share-forward-line"></i>
            </button>
          </li>
        </ul>
        <ul className="user-status">
          <li className="icon">
            <span></span>
          </li>
          <li className="text">Active</li>
        </ul>
        <ul className="share-and-invite">
          <li className="share">
            <div>
              <div className="icon">
                <i className="ri-megaphone-line"></i>
              </div>
              <div className="text">Share what you're upto</div>
            </div>
            <div>
              <i className="ri-pencil-line"></i>
            </div>
          </li>
          <li className="invite">
            <div className="icon">
              <i className="ri-team-fill"></i>
            </div>
            <div className="text">Invite Friends</div>
          </li>
        </ul>
        <div className="profile-section">
          <div className="profile-section-header">
            <div>Manage</div>
          </div>
          <ul className="profile-section-items">
            <li className="profile-section-item">
              <div className="icon">
                <i className="ri-settings-line"></i>
              </div>
              <div className="text">Settings</div>
            </li>
            <li className="profile-section-item" onClick={handleLogout}>
              <div className="icon">
                <i className="ri-logout-box-r-line"></i>
              </div>
              <div className="text">Sign Out</div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SidebarProfile;
