import React, { useState, useEffect } from "react";
import Content from "../components/Content";
import { useNavigate } from "react-router";
import { startConnection } from "../services/signalR/SignalRService";
import Sidebar from "../ui/Sidebar";
import { refreshAccessToken, decodeToken } from "../services/AuthService";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let email = sessionStorage.getItem("email");
    if (email === "" || email === null) {
      navigate("/login");
    } else {
      setIsAuthenticated(true);
      startConnection();
    }

    const token = sessionStorage.getItem("access_token");
    if (token) {
      const tokenExp = decodeToken(token).exp;
      const currentTime = Math.floor(Date.now() / 1000);
      const remainingTime = tokenExp - currentTime;
      const intervalTime = remainingTime - 30; // Refresh token 30 seconds before expiration
      console.log(
        `Refresh token interval time -> ${(intervalTime / 60).toFixed(2)} mins`
      );

      if (intervalTime > 0) {
        const tokenRefreshInterval = setInterval(
          refreshAccessToken,
          intervalTime * 1000
        );
        return () => clearInterval(tokenRefreshInterval);
      }
    }
  }, []);

  if (!isAuthenticated) {
    return null;
  }

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
