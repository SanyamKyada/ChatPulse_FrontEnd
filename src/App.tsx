import React, { FC } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  BrowserRouter,
} from "react-router-dom";
import Home from "./pages/Home";
const Login = React.lazy(() => import("./pages/Login"));
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import { toast } from "react-toastify";

// import Chat from "./components/Chat";

const App: FC = function App() {
  // toast.success("Hello");
  return (
    <>
      <ToastContainer />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />}></Route>
          <Route path="/login" element={<Login />}></Route>
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
