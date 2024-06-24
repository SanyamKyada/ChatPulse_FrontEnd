import React, { useEffect, useState } from "react";
import RecentChats from "./RecentChats";
import ConversationMain from "./Conversation/ConversationMain";
import axios from "axios";
import {
  ConversationApiResponse,
  RecentChatAPIResponse,
} from "../types/Conversation";
import { RecentChatGroups } from "../types/RecentChats";
import { getGroupTitleFromDate } from "../util/datetime";
import {
  getHubConnection,
  handleContactAvailabilityStatusChange,
  handleContactStatusChange,
  handleReceiveFriendRequest,
} from "../services/signalR/SignalRService";
import { isLoggedIn } from "../services/AuthService";
import { PersonToInvite } from "../types/FriendRequest";
import {
  RECEIVE_AVAILABILITY_STATUS_CHANGED,
  RECEIVE_FRIEND_REQUEST_MESSAGE,
  RECEIVE_MESSAGE,
} from "../services/signalR/constants";
import InvitationChatWindow from "./invitation/InvitationChatWindow";
import { ConversationApi } from "../axios";
import { getUserId } from "../util/auth";

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
        friendRequestId: conversation.friendRequestId,
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
        isWave: conversation.lastMessage.isWave,
        availabilityStatus: conversation.contact.availabilityStatus,
      });
      return groups;
    },
    {}
  );
};

const getPersonDetails = (
  recentChats: RecentChatAPIResponse,
  conversationId: number | undefined,
  friendRequestId: number | undefined,
  personToInviteDetails: PersonToInvite
) => {
  const activeConversation = recentChats.find(
    (chat) =>
      chat.conversationId === conversationId ||
      chat.friendRequestId === friendRequestId
  );
  return activeConversation
    ? {
        contactId: activeConversation.contact.contactId,
        contactName: activeConversation.contact.name,
        contactOnlineStatus: activeConversation.contact.isOnline,
        lastSeenTimestamp: activeConversation.contact.lastSeenTimestamp,
        profileImage: activeConversation.contact.profileImage,
        availabilityStatus: activeConversation.contact.availabilityStatus,
      }
    : {
        contactId: personToInviteDetails.userId,
        contactName: personToInviteDetails.name,
        contactOnlineStatus: personToInviteDetails.isOnline,
        lastSeenTimestamp: personToInviteDetails.lastSeenTimestamp,
        profileImage: personToInviteDetails.profileImage,
        availabilityStatus: personToInviteDetails.availabilityStatus,
      };
};

const Content: React.FC = () => {
  const [conversationId, setConversationId] = useState<number | undefined>(
    undefined
  );

  const [recentChats, setRecentChats] = useState<RecentChatAPIResponse>([]);

  const recentChatGroups = groupConversationsByTimestamp(recentChats);

  const [friendRequestId, setFriendRequestId] = useState<number | undefined>(
    undefined
  );

  const [personToInviteDetails, setPersonToInviteDetails] =
    useState<PersonToInvite>({} as PersonToInvite);

  const SetConversationId = (conversationId) => {
    setConversationId(conversationId);
  };

  useEffect(() => {
    const fetchConversations = async () => {
      const userId = getUserId();
      const conversations: RecentChatAPIResponse =
        await ConversationApi.GetRecentConversations(userId);
      setRecentChats(conversations);
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

      handleReceiveFriendRequest((friendRequestId, senderUser) => {
        setRecentChats((prevChats: RecentChatAPIResponse) => {
          const updatedChats = [...prevChats];

          const newChat = {
            friendRequestId: friendRequestId,
            numberOfUnseenMessages: 1,
            contact: {
              contactId: senderUser?.userId,
              name: senderUser?.name,
              profileImage: senderUser?.profileImage,
              isOnline: senderUser?.isOnline,
              lastSeenTimestamp: senderUser?.lastSeenTimestamp,
            },
            conversationType: 0,
            lastMessage: {
              messageId: 0,
              content: "I'd like to add you on Chat",
              timestamp: new Date().toISOString(),
              isFromCurrentUser: true,
            },
          };
          updatedChats.push(newChat as ConversationApiResponse);

          return updatedChats;
        });
      });

      handleContactAvailabilityStatusChange(
        (userId: string, status: number) => {
          setRecentChats((prevChats: RecentChatAPIResponse) => {
            const conversationIndex = prevChats.findIndex(
              (x) => x.contact.contactId == userId
            );
            if (conversationIndex !== -1) {
              const updatedConversation = {
                ...prevChats[conversationIndex],
              };

              updatedConversation.contact.availabilityStatus = status;

              const updatedChats = [...prevChats];
              updatedChats[conversationIndex] = updatedConversation;
              return updatedChats;
            }

            return prevChats;
          });
        }
      );
    }
  }, []);

  //This effect will run when no conversation(with friend) is selected/ or you've selected a user which is not a friend.
  //In other words, we need to run this effect when ConversationMain is not rendred.
  useEffect(() => {
    if (isLoggedIn()) {
      const receiveMessageHandler = (senderUserId, message) => {
        updateUnseenMessages(senderUserId, true);
        setLastMessageOfConversation(message, true, senderUserId);
      };

      const receiveFriendReqMessageHandler = (
        senderUserId,
        friendRequestId,
        message
      ) => {
        updateUnseenMessages(senderUserId, true);
        setLastMessageOfConversation(message, true, senderUserId);
      };

      let hubConnection;

      const initializeHandlers = async () => {
        hubConnection = await getHubConnection();
        if (conversationId === undefined) {
          hubConnection.on(RECEIVE_MESSAGE, receiveMessageHandler); //Handle receive message when no conversation is selected
        } else if (friendRequestId === undefined) {
          //Handle receive friend request message when no friend request is selected
          hubConnection.on(
            RECEIVE_FRIEND_REQUEST_MESSAGE,
            receiveFriendReqMessageHandler
          );
        }
      };
      initializeHandlers();

      return () => {
        hubConnection.off(RECEIVE_MESSAGE, receiveMessageHandler);
        hubConnection.off(
          RECEIVE_FRIEND_REQUEST_MESSAGE,
          receiveFriendReqMessageHandler
        );
      };
    }
  }, [conversationId === undefined]);

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

  const handleAfterSendFriendRequest = (friendRequestId: number) => {
    setRecentChats((prevChats: RecentChatAPIResponse) => {
      const updatedChats = [...prevChats];

      const newChat = {
        // conversationId: undefined,
        friendRequestId: friendRequestId,
        numberOfUnseenMessages: 0,
        contact: {
          contactId: personToInviteDetails?.userId,
          name: personToInviteDetails?.name,
          profileImage: personToInviteDetails?.profileImage,
          isOnline: personToInviteDetails?.isOnline,
          lastSeenTimestamp: personToInviteDetails?.lastSeenTimestamp,
        },
        conversationType: 0,
        lastMessage: {
          messageId: 0,
          content: "I'd like to add you on Chat",
          timestamp: new Date().toISOString(),
          isFromCurrentUser: true,
        },
      };
      updatedChats.push(newChat as ConversationApiResponse);

      return updatedChats;
    });

    setPersonToInviteDetails({} as PersonToInvite);
    setFriendRequestId(friendRequestId);
  };

  const handleAfterAcceptFriendRequest = (
    friendReqId: number,
    convoId: number,
    isReqAcceptedByMe: boolean = false
  ) => {
    setRecentChats((prevChats: RecentChatAPIResponse) => {
      const conversationIndex = prevChats.findIndex(
        (x) => x.friendRequestId == friendReqId
      );
      if (conversationIndex !== -1) {
        const updatedConversation = {
          ...prevChats[conversationIndex],
        };

        updatedConversation.conversationId = convoId;
        updatedConversation.friendRequestId = null;
        const updatedChats = [...prevChats];
        updatedChats[conversationIndex] = updatedConversation;

        if (
          isReqAcceptedByMe ||
          (!conversationId && friendRequestId == friendReqId)
        )
          setConversationId(convoId);
        return updatedChats;
      }

      return prevChats;
    });
  };

  const handleBackNavigationFromInviteBox = () => {
    setPersonToInviteDetails({} as PersonToInvite);
    setFriendRequestId(undefined);
  };

  const OnSelectConversation = (conversationId: number) => {
    setFriendRequestId(undefined);
    setConversationId(conversationId);
  };

  const OnSelectUnknownPerson = (person: PersonToInvite) => {
    setPersonToInviteDetails(person);
    setFriendRequestId(undefined);
    setConversationId(undefined);
  };

  const OnSelectFriendRequest = (friendRequestId: number) => {
    setFriendRequestId(friendRequestId);
    setConversationId(undefined);
    setPersonToInviteDetails({} as PersonToInvite);
  };

  const personDetails = getPersonDetails(
    recentChats,
    conversationId,
    friendRequestId,
    personToInviteDetails
  );

  return (
    <div className="chat-content">
      <RecentChats
        recentChatGroups={recentChatGroups}
        OnSelectConversation={OnSelectConversation}
        OnSelectUnknownPerson={OnSelectUnknownPerson} //When you search and select non-friend person
        OnSelectFriendRequest={OnSelectFriendRequest} //When you select a person who's not a friend but you/him has sent a friend request
      />

      {conversationId && (
        <ConversationMain
          activeConversationId={conversationId}
          onlineStatus={personDetails.contactOnlineStatus}
          contactId={personDetails.contactId}
          contactName={personDetails.contactName}
          lastSeenTimestamp={personDetails.lastSeenTimestamp}
          profileImage={personDetails.profileImage}
          availabilityStatus={personDetails.availabilityStatus}
          handleBackNavigation={SetConversationId}
          updateUnseenMessages={updateUnseenMessages}
          setLastMessageOfConversation={setLastMessageOfConversation}
        />
      )}
      {!conversationId &&
        (friendRequestId || Object.keys(personToInviteDetails).length > 0) && (
          <InvitationChatWindow
            name={personDetails.contactName}
            userId={personDetails.contactId}
            friendRequestId={friendRequestId}
            profileImage={personDetails.profileImage}
            isOnline={personDetails.contactOnlineStatus}
            lastSeenTimestamp={personDetails.lastSeenTimestamp}
            availabilityStatus={personDetails.availabilityStatus}
            isRequestAlreadySent={
              !conversationId &&
              !!friendRequestId &&
              Object.keys(personToInviteDetails).length == 0
            }
            handleBackNavigation={handleBackNavigationFromInviteBox}
            handleAfterSendFriendRequest={handleAfterSendFriendRequest}
            handleAfterAcceptFriendRequest={handleAfterAcceptFriendRequest}
            updateUnseenMessages={updateUnseenMessages}
          />
        )}
      {!conversationId &&
        !friendRequestId &&
        Object.keys(personToInviteDetails).length == 0 && (
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
