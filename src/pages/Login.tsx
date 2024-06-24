import React, { FC, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// import Loader from "../components/Loader";
import "./Login.css";
import Loader from "../ui/Loader";
import CryptoJS from "crypto-js";
import { AccountApi } from "../axios";
import { LoginCredentials, LoginResponse } from "../types/Account";
import { stopHubConnection } from "../services/signalR/SignalRService";
const aesKey = import.meta.env.VITE_AES_KEY;

const Login: FC = () => {
  const [userName, setUserName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  useEffect(() => {
    localStorage.clear();
    stopHubConnection();
  }, []);

  const proceedLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validate()) {
      setIsLoading(true);
      const userCred: LoginCredentials = {
        userName: userName,
        password: password,
      };
      var userDetails: LoginResponse = await AccountApi.Login(userCred);

      if (userDetails) {
        if (!userDetails.accessToken) {
          throw new Error("JWT token not found in response");
        }

        localStorage.setItem("user", JSON.stringify(userDetails));
        navigate("/");
      }
      setIsLoading(false);
    }
  };

  const validate = () => {
    let result = true;
    if (userName === "" || userName === null) {
      result = false;
      console.log("Please Enter Email");
    }
    if (password === "" || password === null) {
      result = false;
      console.log("Please Enter Password");
    }
    return result;
  };

  return (
    <div className="auth">
      <div className="container" style={{}}>
        <section id="content">
          <Loader isLoading={isLoading} />
          <form className="auth" onSubmit={proceedLogin}>
            <h1>ChatPulse</h1>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="Username"
                required
                id="username"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                style={{ boxSizing: "unset" }}
              />
              <i className="ri-user-fill"></i>
            </div>
            <div style={{ position: "relative" }}>
              <input
                type="password"
                placeholder="Password"
                required
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ boxSizing: "unset" }}
              />
              <i className="ri-lock-fill"></i>
            </div>
            <div>
              <input type="submit" value="Log in" />
            </div>
          </form>
          {/* form */}
          <div className="button">
            <span>New to Chatpulse?</span>
            <Link className="btn btn-success" to={"/register"}>
              Create your chatpulse account
            </Link>
          </div>
          {/* button */}
        </section>
        {/* content */}
      </div>
    </div>
  );
};

export default Login;
