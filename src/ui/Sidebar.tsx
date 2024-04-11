import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";

const Sidebar: React.FC = () => {
  const [isProfileActive, setProfileActive] = useState(false);

  const toggleProfile = () => {
    setProfileActive(!isProfileActive);
  };

  const handleOutsideClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const profileButton = document.querySelector(
      ".chat-sidebar-profile-toggle"
    );

    if (profileButton && !profileButton.contains(target)) {
      setProfileActive(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleOutsideClick);

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  const navigate = useNavigate();
  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <aside className="chat-sidebar">
      <a href="#" className="chat-sidebar-logo">
        <i className="ri-chat-1-fill"></i>
      </a>
      <ul className="chat-sidebar-menu">
        <li className="active">
          <a href="#" data-title="Chats">
            <i className="ri-chat-3-line"></i>
          </a>
        </li>
        <li>
          <a href="#" data-title="Contacts">
            <i className="ri-contacts-line"></i>
          </a>
        </li>
        <li>
          <a href="#" data-title="Documents">
            <i className="ri-folder-line"></i>
          </a>
        </li>
        <li>
          <a href="#" data-title="Settings">
            <i className="ri-settings-line"></i>
          </a>
        </li>
        <li
          className={`chat-sidebar-profile ${isProfileActive ? "active" : ""}`}
        >
          <button
            type="button"
            className="chat-sidebar-profile-toggle"
            onClick={toggleProfile}
          >
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8cGVvcGxlfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60"
              alt=""
            />
          </button>
          <ul className="chat-sidebar-profile-dropdown">
            <li>
              <a href="#">
                <i className="ri-user-line"></i> Profile
              </a>
            </li>
            <li onClick={handleLogout}>
              <a href="#">
                <i className="ri-logout-box-line"></i> Logout
              </a>
            </li>
          </ul>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
