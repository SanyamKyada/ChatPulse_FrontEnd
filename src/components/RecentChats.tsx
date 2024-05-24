import React, { useState, useRef, useEffect } from "react";
import RecentChatsGroup from "./RecentChatsGroup";
import { RecentChat, RecentChatGroups } from "../types/RecentChats";
import useDebounce from "../hooks/useDebounce";
import axios, { CancelTokenSource } from "axios";
import { CP_API_URL_DEV } from "../environment";
import { DirectorySearchResult, PersonToInvite } from "../types/FriendRequest";
import CPDirectorySearchResult from "../components/CPDirectorySearchResult";

const RecentChats: React.FC<{
  recentChatGroups: RecentChatGroups;
  OnSelectConversation: (conversationId) => void;
  OnSelectUnknownPerson: (Person: PersonToInvite) => void;
  OnSelectFriendRequest: (friendRequestId) => void;
}> = ({
  recentChatGroups,
  OnSelectConversation,
  OnSelectUnknownPerson,
  OnSelectFriendRequest,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const cancleTokenRef = useRef<CancelTokenSource>();
  const [chatPulseDirectory, setChatPulseDirectory] =
    useState<DirectorySearchResult>([]);

  let chatsDictionary: RecentChatGroups = searchQuery
    ? filterContactsByName(recentChatGroups, searchQuery)
    : recentChatGroups;

  const handleSearch = (e) => {
    cancleTokenRef.current?.cancel(); //Cancle any ongoing api calls
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length) {
      // setIsLoading(true);
    } else {
      setChatPulseDirectory([]);
    }
  };

  useEffect(() => {
    if (searchQuery.length > 0) searchPeople(searchQuery);
  }, [searchQuery]);

  const searchPeople = useDebounce(async (searchQuery) => {
    setIsLoading(true);
    const userId: string = sessionStorage.getItem("userId") ?? "";
    const data = await getNonContactsFromApi(userId, searchQuery);
    setChatPulseDirectory(data || []);
    setIsLoading(false);
  }, 500);

  function filterContactsByName(data, name): RecentChatGroups {
    let filteredData: RecentChat[] = [];
    for (const dateKey in data) {
      const objectsArray = data[dateKey];
      const filteredObjects = objectsArray.filter(
        (obj) => obj.personName.toLowerCase().includes(name.toLowerCase())
        // ?.split(" ")
        // .some((x) => x.toLowerCase().startsWith(name.toLowerCase()))
      );
      if (filteredObjects.length > 0) {
        filteredData = [...filteredData, ...filteredObjects];
      }
    }
    return filteredData.length > 0 ? { People: filteredData } : {};
  }

  const getNonContactsFromApi = async (
    userId: string,
    searchQuery: string
  ): Promise<DirectorySearchResult> => {
    console.log("Search query:", searchQuery);
    cancleTokenRef.current = axios.CancelToken.source();
    const response = await axios
      .get(
        `${CP_API_URL_DEV}/api/user/${userId}/search-people?query=${searchQuery}`,
        {
          cancelToken: cancleTokenRef.current.token,
        }
      )
      .catch((err) => {
        return err;
      });
    return response.data;
  };

  const searchForm = (
    <form action="" className="content-sidebar-form">
      <input
        type="search"
        className="content-sidebar-input"
        placeholder="Search..."
        onKeyUp={handleSearch}
      />
      <button
        type="button"
        className={`content-sidebar-submit ${
          isLoading ? "content-sidebar-loader" : ""
        }`}
      >
        <i className={isLoading ? "ri-loader-4-line" : "ri-search-line"}></i>
      </button>
    </form>
  );

  return (
    <div className="content-sidebar">
      <div className="mobile-content-sidebar-header">
        <div className="conversation-top">
          <div className="conversation-user">
            <img
              className="conversation-user-image"
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8cGVvcGxlfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60"
              alt=""
            />
            <div>
              <div className="conversation-user-name">
                {sessionStorage.getItem("userN")}
              </div>
              <div className="conversation-user-status online">
                Share what you're upto
              </div>
            </div>
          </div>
          <div className="conversation-buttons">
            <button type="button">
              <i className="ri-notification-2-line"></i>
            </button>
          </div>
        </div>
        {searchForm}
        <div style={{ padding: "7px" }}></div>
      </div>
      <div className="desktop-content-sidebar-header">
        <div className="content-sidebar-title">Chats</div>
        {searchForm}
      </div>
      <div className="content-messages">
        {Object.entries(chatsDictionary).map(([title, recentChats]) => (
          <React.Fragment key={title}>
            <RecentChatsGroup
              chatGroupTitle={title}
              OnSelectConversation={OnSelectConversation}
              OnSelectFriendRequest={OnSelectFriendRequest}
              recentChats={recentChats}
            />
          </React.Fragment>
        ))}
        {searchQuery.length > 0 && chatPulseDirectory.length > 0 && (
          <CPDirectorySearchResult
            OnSelectDirectoryPerson={OnSelectUnknownPerson}
            directoryPeople={chatPulseDirectory}
          />
        )}
        {searchQuery.length === 0 &&
          Object.values(chatsDictionary).length === 0 && (
            <div className="mobile-welcome">
              <i className="ri-chat-3-line" style={{ fontSize: "32px" }}></i>
              <p style={{ marginTop: "16px" }}>
                Search people and start conversation!
              </p>
            </div>
          )}
      </div>
    </div>
  );
};

export default RecentChats;
