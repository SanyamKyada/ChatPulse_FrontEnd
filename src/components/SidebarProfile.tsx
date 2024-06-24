import React, { useState, useEffect } from "react";
import { getUser } from "../services/AuthService";
import { UserApi } from "../axios";
import { getUserId, updateAvailabilityStatus } from "../util/auth";
import { notifyAvailabilityStatusToContacts } from "../services/signalR/SignalRService";

const status = ["Active", "Away", "Do not disturb", "Invisible"];

interface SidebarProfileProps {
  handleLogout: () => void;
}

const SidebarProfile: React.FC<SidebarProfileProps> = ({ handleLogout }) => {
  const [isOpenSelectStatus, setIsOpenSelectStatus] = useState<boolean>(false);
  const [availabilityStatusId, setAvailabilityStatusId] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loaderIndex, setLoaderIndex] = useState<number | null>(null);

  const handleSelectAvailabilityStatus = async (statusId: number) => {
    setIsLoading(true);
    setLoaderIndex(statusId);
    const userId = getUserId();
    var response = await UserApi.SetAvailabilityStatus(userId, statusId);

    if (response.statusCode === 200) {
      updateAvailabilityStatus(statusId);
      setAvailabilityStatusId(statusId);
      notifyAvailabilityStatusToContacts(userId, statusId);
      setIsOpenSelectStatus(false);
    }
    setIsLoading(false);
    setLoaderIndex(null);
  };

  const { userName, email, availabilityStatus } = getUser();

  useEffect(() => {
    setAvailabilityStatusId(availabilityStatus);
  }, []);

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
              <div className="e">{email}</div>
            </div>
            <div className="sh">Share what you're upto</div>
          </li>
          <li>
            <button className="btn-profile-share">
              <i className="ri-share-forward-line"></i>
            </button>
          </li>
        </ul>
        <ul
          className={`availability-status ${
            isOpenSelectStatus ? "hidden" : ""
          }`}
          onClick={() => setIsOpenSelectStatus(true)}
        >
          <li className="icon status-item">
            <span className={`icon status-${availabilityStatusId}`}></span>
            <span className="text">{status[availabilityStatusId - 1]}</span>
            <span className="checkmark">
              <i className="ri-arrow-down-s-line"></i>
            </span>
          </li>
        </ul>
        <ul
          className={`availability-status ${
            isOpenSelectStatus ? "" : "hidden"
          }`}
        >
          <li
            className="status-item"
            onClick={() => handleSelectAvailabilityStatus(1)}
          >
            <span className="icon status-1"></span>
            <span className="text">Active</span>
            <span
              className={`checkmark ${
                availabilityStatusId === 1 ? "" : "hidden"
              }`}
            >
              <i className="ri-check-line"></i>
            </span>
            {isLoading && loaderIndex === 1 && (
              <span className="status-loader">
                <i className="ri-loader-4-line"></i>
              </span>
            )}
          </li>
          <li
            className="status-item"
            onClick={() => handleSelectAvailabilityStatus(2)}
          >
            <span className="icon status-2"></span>
            <span className="text">Away</span>
            <span
              className={`checkmark ${
                availabilityStatusId === 2 ? "" : "hidden"
              }`}
            >
              <i className="ri-check-line"></i>
            </span>
            {isLoading && loaderIndex === 2 && (
              <span className="status-loader">
                <i className="ri-loader-4-line"></i>
              </span>
            )}
          </li>
          <li
            className="status-item"
            onClick={() => handleSelectAvailabilityStatus(3)}
          >
            <span className="icon status-3"></span>
            <span className="text">Do not disturb</span>
            <span
              className={`checkmark ${
                availabilityStatusId === 3 ? "" : "hidden"
              }`}
            >
              <i className="ri-check-line"></i>
            </span>
            {isLoading && loaderIndex === 3 && (
              <span className="status-loader">
                <i className="ri-loader-4-line"></i>
              </span>
            )}
          </li>
          <li
            className="status-item"
            onClick={() => handleSelectAvailabilityStatus(4)}
          >
            <span className="icon status-4"></span>
            <span className="text">Invisible</span>
            <span
              className={`checkmark ${
                availabilityStatusId === 4 ? "" : "hidden"
              }`}
            >
              <i className="ri-check-line"></i>
            </span>
            {isLoading && loaderIndex === 4 && (
              <span className="status-loader">
                <i className="ri-loader-4-line"></i>
              </span>
            )}
          </li>
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
