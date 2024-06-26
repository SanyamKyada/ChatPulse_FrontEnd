import React, { useEffect, useState } from "react";
import RecentChats from "./RecentChats";
import ConversationMain from "./Conversation/ConversationMain";
import {
  ConversationApiResponse,
  RecentChatAPIResponse,
} from "../types/Conversation";
import {
  getHubConnection,
  handleContactAvailabilityStatusChange,
  handleContactProfileImageChanged,
  handleContactStatusChange,
  handleReceiveFriendRequest,
} from "../services/signalR/SignalRService";
import { isLoggedIn } from "../services/AuthService";
import { PersonToInvite } from "../types/FriendRequest";
import {
  RECEIVE_FRIEND_REQUEST_MESSAGE,
  RECEIVE_MESSAGE,
} from "../services/signalR/constants";
import InvitationChatWindow from "./invitation/InvitationChatWindow";
import { ConversationApi } from "../axios";
import { getUserId } from "../util/auth";
import { conversationHelper } from "../util/conversation-helper";

const Content: React.FC = () => {
  const [conversationId, setConversationId] = useState<number | undefined>(
    undefined
  );
  const [recentChats, setRecentChats] = useState<RecentChatAPIResponse>([]);
  const recentChatGroups =
    conversationHelper.groupConversationsByTimestamp(recentChats);
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
          return conversationHelper.updateChatState(
            prevChats,
            userId,
            undefined,
            undefined,
            {
              contact: {
                isOnline,
                lastSeenTimestamp: new Date().toLocaleString(),
              },
            }
          );
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
            return conversationHelper.updateChatState(
              prevChats,
              userId,
              undefined,
              undefined,
              {
                contact: { availabilityStatus: status },
              }
            );
          });
        }
      );

      handleContactProfileImageChanged(
        (userId: string, profileImage: string) => {
          setRecentChats((prevChats: RecentChatAPIResponse) => {
            return conversationHelper.updateChatState(
              prevChats,
              userId,
              undefined,
              undefined,
              {
                contact: {
                  profileImage: profileImage,
                },
              }
            );
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
      return conversationHelper.updateChatState(
        prevChats,
        senderUserId,
        undefined,
        undefined,
        {
          numberOfUnseenMessages: shouldIncrease
            ? prevChats.find((chat) => chat.contact.contactId === senderUserId)
                ?.numberOfUnseenMessages + 1
            : 0,
        }
      );
    });
  };

  const setLastMessageOfConversation = (
    message: string,
    isMessageReceived: boolean = false, //To identify if the message is received from any contact or send by me
    senderUserId: string | null
  ): void => {
    setRecentChats((prevChats: RecentChatAPIResponse) => {
      return conversationHelper.updateChatState(
        prevChats,
        isMessageReceived && senderUserId,
        !isMessageReceived && conversationId,
        undefined,
        {
          lastMessage: {
            content: message,
            timestamp: new Date().toISOString(),
          },
        }
      );
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
      return conversationHelper.updateChatState(
        prevChats,
        undefined,
        undefined,
        friendReqId,
        {
          conversationId: convoId,
          friendRequestId: null,
        }
      );
    });
    if (
      isReqAcceptedByMe ||
      (!conversationId && friendRequestId == friendReqId)
    )
      setConversationId(convoId);
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

  const personDetails = conversationHelper.getPersonDetails(
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
