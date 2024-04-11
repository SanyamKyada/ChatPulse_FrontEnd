import React from "react";
import Content from "./Content";
import Sidebar from "../ui/Sidebar";

const Chat: React.FC = () => {
  return (
    <section className="chat-section">
      <div className="chat-container">
        <Sidebar />
        <Content />
      </div>
    </section>
  );
};

export default Chat;
