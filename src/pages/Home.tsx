import React, { useEffect } from "react";
import Content from "../components/Content";
import { useNavigate } from "react-router";
import { startConnection } from "../Services/SignalRService";
import Sidebar from "../UI/Sidebar";
import { refreshAccessToken, decodeToken } from "../Services/AuthService.js";

const Home: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    let email = sessionStorage.getItem("email");
    if (email === "" || email === null) {
      navigate("/login");
    } else {
      startConnection();
    }

    const token = sessionStorage.getItem("access_token");
    if (token) {
      const tokenExp = decodeToken(token).exp;
      const currentTime = Math.floor(Date.now() / 1000);
      const remainingTime = tokenExp - currentTime;
      const intervalTime = remainingTime - 30; // Refresh token 30 seconds before expiration
      if (intervalTime > 0) {
        const tokenRefreshInterval = setInterval(
          refreshAccessToken,
          intervalTime * 1000
        );
        return () => clearInterval(tokenRefreshInterval);
      }
    }
  }, []);

  return (
    <section className="chat-section">
      <div className="chat-container">
        <Sidebar />
        <Content />
      </div>
    </section>
  );
};

export default Home;
