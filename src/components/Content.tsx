import React, { useEffect, useState } from "react";
import RecentChats from "./RecentChats";
import ConversationMain from "./Conversation/ConversationMain";
import axios from "axios";
import {
  ConversationGroups,
  RecentChatAPIResponse,
} from "../types/Conversation";
import { RecentChatGroups } from "../types/RecentChats";
import { getGroupTitleFromDate } from "../util/datetime";
import {
  getHubConnection,
  handleContactStatusChange,
} from "../Services/SignalRService";
import { isLoggedIn } from "../Services/AuthService";
import { CP_API_URL_DEV } from "../environment";
import PersonInvitationBox from "./PersonInvitationBox";
import { PersonToInvite } from "../types/SearchPeople";

const CONTACT_IMAGE =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8cGVvcGxlfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60";

const groupConversationsByTimestamp = (
  conversations: RecentChatAPIResponse
) => {
  const sortedConversations = conversations.sort((a, b) => {
    const timestampA = new Date(a.lastMessage.timestamp);
    const timestampB = new Date(b.lastMessage.timestamp);
    return timestampB.getTime() - timestampA.getTime();
  });
  return sortedConversations.reduce(
    (groups: RecentChatGroups, conversation) => {
      const groupKey = getGroupTitleFromDate(
        conversation.lastMessage.timestamp
      );
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push({
        conversationId: conversation.conversationId,
        personImageURL: CONTACT_IMAGE,
        personName: conversation.contact.name,
        contactId: conversation.contact.contactId,
        lastMessage: conversation.lastMessage.content,
        lastMessageRecivedAt: new Date(
          conversation.lastMessage.timestamp
        ).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        noOfUnseenMessages: conversation.numberOfUnseenMessages,
        isOnline: conversation.contact.isOnline,
        lastSeenTimestamp: conversation.contact.lastSeenTimestamp,
      });
      return groups;
    },
    {}
  );
};

const Content: React.FC = () => {
  const [conversationId, setConversationId] = useState<number | undefined>(
    undefined
  );

  const [recentChats, setRecentChats] = useState<RecentChatAPIResponse>([]);

  const recentChatGroups = groupConversationsByTimestamp(recentChats);

  // const [personToInviteId, setPersonToInviteId] = useState<string | undefined>(
  //   undefined
  // );

  const [personToInviteDetails, setPersonToInviteDetails] = useState<
    PersonToInvite | undefined
  >(undefined);

  const SetConversationId = (conversationId) => {
    setConversationId(conversationId);
  };

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const userId = sessionStorage.getItem("userId");
        const response = await axios.get(
          `${CP_API_URL_DEV}/api/conversation/${userId}/recent`
        );
        setRecentChats(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchConversations();

    if (isLoggedIn()) {
      handleContactStatusChange((userId, isOnline) => {
        setRecentChats((prevChats: RecentChatAPIResponse) => {
          const conversationIndex = prevChats.findIndex(
            (x) => x.contact.contactId == userId
          );
          if (conversationIndex !== -1) {
            const updatedConversation = {
              ...prevChats[conversationIndex],
            };

            updatedConversation.contact.isOnline = isOnline;
            updatedConversation.contact.lastSeenTimestamp =
              new Date().toLocaleString();

            const updatedChats = [...prevChats];
            updatedChats[conversationIndex] = updatedConversation;
            return updatedChats;
          }

          return prevChats;
        });
      });
    }
  }, []);

  //This effect will run when no conversation is selected.
  useEffect(() => {
    if (isLoggedIn()) {
      const receiveMessageHandler = (senderUserId, message) => {
        updateUnseenMessages(senderUserId, true);
        setLastMessageOfConversation(message, true, senderUserId);
      };
      const hubConnection = getHubConnection();
      if (conversationId === undefined) {
        //Handle recive message when no conversation is selected
        hubConnection.on("ReceiveMessage", receiveMessageHandler);
      }
      return () => {
        hubConnection.off("ReceiveMessage", receiveMessageHandler);
      };
    }
  }, [conversationId === undefined]);

  let contactId,
    contactName,
    contactOnlineStatus,
    lastSeenTimestamp,
    profileImage;
  if (conversationId && recentChats.length) {
    const activeConversation = recentChats.find(
      (x) => x.conversationId == conversationId
    );
    contactId = activeConversation?.contact.contactId;
    contactName = activeConversation?.contact.name;
    contactOnlineStatus = activeConversation?.contact.isOnline;
    lastSeenTimestamp = activeConversation?.contact.lastSeenTimestamp;
    profileImage = activeConversation?.contact.profileImage;
  }

  const updateUnseenMessages = (
    senderUserId: string,
    shouldIncrease: boolean
  ) => {
    setRecentChats((prevChats: RecentChatAPIResponse) => {
      const conversationIndex = prevChats.findIndex(
        (x) => x.contact.contactId == senderUserId
      );
      if (conversationIndex !== -1) {
        const updatedConversation = {
          ...prevChats[conversationIndex],
        };

        updatedConversation.numberOfUnseenMessages = shouldIncrease
          ? updatedConversation?.numberOfUnseenMessages + 1
          : 0;

        const updatedChats = [...prevChats];
        updatedChats[conversationIndex] = updatedConversation;
        return updatedChats;
      }

      return prevChats;
    });
  };

  const setLastMessageOfConversation = (
    message: string,
    isMessageReceived: boolean = false, //To identify if the message is received from any contact or send by me
    senderUserId: string | null
  ): void => {
    setRecentChats((prevChats: RecentChatAPIResponse) => {
      const conversationIndex = isMessageReceived
        ? prevChats.findIndex((x) => x.contact.contactId == senderUserId)
        : prevChats.findIndex((x) => x.conversationId == conversationId);
      if (conversationIndex !== -1) {
        const updatedConversation = {
          ...prevChats[conversationIndex],
        };

        updatedConversation.lastMessage.content = message;
        updatedConversation.lastMessage.timestamp = new Date().toISOString();

        const updatedChats = [...prevChats];
        updatedChats[conversationIndex] = updatedConversation;
        return updatedChats;
      }

      return prevChats;
    });
  };

  const handleBackNavigationFromInviteBox = () => {
    setPersonToInviteDetails(undefined);
  };

  const OnSelectUnknownPerson = (person: PersonToInvite) => {
    setPersonToInviteDetails(person);
    setConversationId(undefined);
  };

  return (
    <div className="chat-content">
      <RecentChats
        recentChatGroups={recentChatGroups}
        OnSelectConversation={SetConversationId}
        OnSelectUnknownPerson={OnSelectUnknownPerson}
      />

      {conversationId && (
        <ConversationMain
          activeConversationId={conversationId}
          onlineStatus={contactOnlineStatus}
          contactId={contactId}
          contactName={contactName}
          lastSeenTimestamp={lastSeenTimestamp}
          profileImage={profileImage}
          handleBackNavigation={SetConversationId}
          updateUnseenMessages={updateUnseenMessages}
          setLastMessageOfConversation={setLastMessageOfConversation}
        />
      )}
      {!conversationId && personToInviteDetails !== undefined && (
        <PersonInvitationBox
          {...personToInviteDetails}
          handleBackNavigation={handleBackNavigationFromInviteBox}
        />
      )}
      {!conversationId && !personToInviteDetails && (
        <div className="conversation conversation-default active">
          <i className="ri-chat-3-line"></i>
          <p>
            {Object.values(recentChatGroups).length > 0
              ? "Select chat and view conversation!"
              : "Search people and start conversation!"}
          </p>
        </div>
      )}
    </div>
  );
};

export default Content;
