import React, { useState } from "react";
import RecentChatsGroup from "./RecentChatsGroup";
import { RecentChatGroups } from "../types/RecentChats";

const RecentChats: React.FC<{
  recentChatGroups: RecentChatGroups;
  OnSelectConversation: (conversationId) => void;
}> = ({ recentChatGroups, OnSelectConversation }) => {
  const [searchQuery, setSearchQuery] = useState();
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };
  let chatsDictionary: RecentChatGroups = searchQuery
    ? filterChatsByName(recentChatGroups, searchQuery)
    : recentChatGroups;

  function filterChatsByName(data, name) {
    const filteredData = {};
    for (const dateKey in data) {
      const objectsArray = data[dateKey];
      const filteredObjects = objectsArray.filter((obj) =>
        obj.personName
          ?.split(" ")
          .some((x) => x.toLowerCase().startsWith(name.toLowerCase()))
      );
      if (filteredObjects.length > 0) {
        filteredData[dateKey] = filteredObjects;
      }
    }
    return filteredData;
  }

  return (
    <div className="content-sidebar">
      <div className="content-sidebar-title">Chats</div>
      <form action="" className="content-sidebar-form">
        <input
          type="search"
          className="content-sidebar-input"
          placeholder="Search..."
          onKeyUp={handleSearch}
        />
        <button type="submit" className="content-sidebar-submit">
          <i className="ri-search-line"></i>
        </button>
      </form>
      <div className="content-messages">
        {Object.entries(chatsDictionary).map(([title, recentChats]) => (
          <React.Fragment key={title}>
            <RecentChatsGroup
              chatGroupTitle={title}
              OnSelectConversation={OnSelectConversation}
              recentChats={recentChats}
            />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default RecentChats;
