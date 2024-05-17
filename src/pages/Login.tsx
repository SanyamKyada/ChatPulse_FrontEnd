import React, { FC, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// import Loader from "../components/Loader";
import "./Login.css";
import Loader from "../ui/Loader";

const Login: FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  useEffect(() => {
    sessionStorage.clear();
    sessionStorage.removeItem("access_token");
  }, []);

  const proceedLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validate()) {
      setIsLoading(true);

      const inputobj = {
        email: email,
        password: password,
      };
      fetch("https://localhost:7003/api/account/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputobj),
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Login failed, Status code : " + res.status);
          }
          return res.json();
        })
        .then((resp) => {
          console.log(resp);
          if (!resp.jwtToken) {
            debugger;
            throw new Error("JWT token not found in response");
          }
          sessionStorage.setItem("email", email);
          sessionStorage.setItem("userId", resp.userId);
          sessionStorage.setItem("userN", resp.userN);
          sessionStorage.setItem("access_token", resp.jwtToken);
          sessionStorage.setItem("refreshToken", resp.refreshToken);

          navigate("/");
        })
        .catch((err) => {
          console.error("Login Failed:", err.message);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  const validate = () => {
    let result = true;
    if (email === "" || email === null) {
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
            <div>
              <input
                type="text"
                placeholder="Username"
                required
                id="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ boxSizing: "unset" }}
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                required
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ boxSizing: "unset" }}
              />
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
