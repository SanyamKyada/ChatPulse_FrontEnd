import React from "react";
import { RecentChat } from "../types/RecentChats";
import { DirectorySearchResult, PersonToInvite } from "../types/SearchPeople";

const CONTACT_IMAGE =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8cGVvcGxlfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60";

const CPDirectorySearchResult: React.FC<{
  OnSelectDirectoryPerson: (Person: PersonToInvite) => void;
  directoryPeople: DirectorySearchResult;
}> = ({ OnSelectDirectoryPerson, directoryPeople }) => {
  console.log(directoryPeople);
  return (
    <ul className="content-messages-list">
      <li className="content-message-title">
        <span>Chatpulse Directory</span>
      </li>
      {directoryPeople.map((person, index) => (
        <li key={person.userId} onClick={() => OnSelectDirectoryPerson(person)}>
          <a href="#" id={`recentchat-${person.userId}`}>
            <img
              className="content-message-image"
              src={CONTACT_IMAGE}
              alt="Person image"
            />
            <span className="content-message-info">
              <span className="content-message-name">{person.name}</span>
              <span className="content-message-text"></span>
            </span>
            <span className="content-message-more">
              <span className="content-message-time"></span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
};

export default CPDirectorySearchResult;
