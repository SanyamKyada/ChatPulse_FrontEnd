import React, { FC, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
import Loader from "../ui/Loader";
import CryptoJS from "crypto-js";
import { AccountApi } from "../axios";
import {
  LoginCredentials,
  LoginResponse,
  RegisterCredentials,
  RegisterResponse,
} from "../types/Account";
const aesKey = import.meta.env.VITE_AES_KEY;

const SignUp: FC = () => {
  const [userName, setUserName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  const proceedRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validate()) {
      setIsLoading(true);
      const userCred: RegisterCredentials = {
        userName: userName,
        email: email,
        password: password,
        firstName: firstName,
        lastName: lastName,
      };
      var response: RegisterResponse = await AccountApi.Register(userCred);
      // toast(response.message);

      setIsLoading(false);
      if (response.httpStatusCode === 200) navigate("/login");
    }
  };

  const validate = () => {
    let result = true;
    if (userName === "" || userName === null) {
      result = false;
      console.log("Please Enter UserName");
    }
    if (email === "" || email === null) {
      result = false;
      console.log("Please Enter Email");
    }
    if (password === "" || password === null) {
      result = false;
      console.log("Please Enter Password");
    }
    if (firstName === "" || firstName === null) {
      result = false;
      console.log("Please Enter FirstName");
    }
    if (lastName === "" || lastName === null) {
      result = false;
      console.log("Please Enter LastName");
    }
    return result;
  };

  return (
    <div className="auth">
      <div className="container" style={{}}>
        <section id="content">
          <Loader isLoading={isLoading} />
          <form className="auth" onSubmit={proceedRegister}>
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
                type="email"
                placeholder="Email"
                required
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ boxSizing: "unset" }}
              />
              <i className="ri-mail-fill"></i>
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
            <div
              style={{
                position: "relative",
                display: "flex",
                gap: "10px",
                padding: "0px 9px",
              }}
            >
              <input
                type="text"
                placeholder="First Name"
                required
                id="fName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                style={{ padding: "15px" }}
              />
              <input
                type="text"
                placeholder="Last Name"
                required
                id="lName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                style={{ padding: "15px" }}
              />
            </div>
            <div>
              <input type="submit" value="Sign Up" />
            </div>
          </form>
          <div className="button">
            <span>Already a member?</span>
            <Link className="btn btn-success" to={"/login"}>
              Login with your chatpulse account
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SignUp;
