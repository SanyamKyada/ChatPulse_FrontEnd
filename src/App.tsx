import React, { FC } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import Home from "./pages/Home";
const Login = React.lazy(() => import("./pages/Login"));
import { ToastContainer } from "react-toastify";
import SignUp from "./pages/SignUp";

const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <SignUp /> },
]);

const App: FC = function App() {
  return (
    <>
      <ToastContainer />
      <RouterProvider router={router} />
    </>
  );
};

export default App;
