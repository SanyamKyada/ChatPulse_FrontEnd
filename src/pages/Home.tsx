import React, { useState, useEffect } from "react";
import Content from "../components/Content";
import { useNavigate } from "react-router";
import { startConnection } from "../services/signalR/SignalRService";
import Sidebar from "../ui/Sidebar";
import {
  refreshAccessToken,
  decodeToken,
  getUser,
  isTokenExpired,
} from "../services/AuthService";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    debugger;
    const initAuth = async () => {
      const user = getUser();
      let accessToken = user?.accessToken;
      if (
        accessToken === "" ||
        accessToken === null ||
        accessToken === undefined
      ) {
        navigate("/login");
      } else if (isTokenExpired()) {
        const newAccessToken = await refreshAccessToken();
        if (
          newAccessToken === "" ||
          newAccessToken === null ||
          newAccessToken === undefined
        ) {
          navigate("/login");
        } else {
          accessToken = newAccessToken;
        }
      }

      setIsAuthenticated(true);
      startConnection();

      const tokenExp = decodeToken(accessToken).exp;
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
    };

    initAuth();
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
