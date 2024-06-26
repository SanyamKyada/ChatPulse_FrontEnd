import * as signalR from "@microsoft/signalr";
import { getAuthToken } from "../../util/auth";
import { isTokenExpired, refreshAccessToken } from "./../AuthService";
import {
  NOTIFY_TYPING,
  RECEIVE_FRIEND_REQUEST,
  RECEIVE_FRIEND_REQUEST_ACCEPTED,
  RECEIVE_FRIEND_REQUEST_MESSAGE,
  SEND_FRIEND_REQUEST,
  SEND_FRIEND_REQUEST_ACCEPTED,
  SEND_FRIEND_REQUEST_MESSAGE,
  SEND_MESSAGE,
  USER_STATUS_CHANGED,
  SEND_AVAILABILITY_STATUS_CHANGED,
  RECEIVE_AVAILABILITY_STATUS_CHANGED,
} from "./constants";

const hubEndpoint = import.meta.env.VITE_HUB_URL;

let hubCon: signalR.HubConnection | null = null;

const createHubConnection = (token: string) => {
  return new signalR.HubConnectionBuilder()
    .withUrl(hubEndpoint, {
      accessTokenFactory: () => token,
    })
    .configureLogging(signalR.LogLevel.Information)
    .build();
};

const getHubConnection = async (): Promise<signalR.HubConnection | null> => {
  const token = getAuthToken();
  if (!token) return null;

  if (!hubCon || (hubCon && isTokenExpired())) {
    hubCon = createHubConnection(token);
  }
  return hubCon;
};

const startConnection = async (): Promise<void> => {
  try {
    const hubConnection = await getHubConnection();
    if (hubConnection) {
      await hubConnection.start();
      console.log(
        "%cSignalR Connected!",
        "line-height: 1.5; font-weight: bold; color: #28a745;"
      );
    }
  } catch (err) {
    console.error("Error while establishing SignalR connection:", err);
    if (
      err.toString().includes("401") ||
      err.toString().includes("failed to complete negotiation") ||
      isTokenExpired()
    ) {
      await refreshAccessToken();
    }
    await startConnection();
  }
};

const stopHubConnection = async (): Promise<void> => {
  if (hubCon) {
    await hubCon.stop();
    hubCon = null;
    console.log(
      "%cSignalR Disconnected!",
      "line-height: 1.5; font-weight: bold; color: #dc3545;"
    );
  }
};

const invokeHubMethod = async (
  methodName: string,
  ...args: any[]
): Promise<void> => {
  try {
    const hubConnection = await getHubConnection();
    if (hubConnection) {
      await hubConnection.invoke(methodName, ...args);
    }
  } catch (err) {
    console.error(`Error while invoking ${methodName}:`, err);
    if (isTokenExpired()) {
      await refreshAccessToken();
    }
    await startConnection();
  }
};

const sendMessage = (
  receiverUserId: string,
  message: string,
  activeConversationId: number
) => {
  return invokeHubMethod(
    SEND_MESSAGE,
    receiverUserId,
    message,
    activeConversationId
  );
};

const notifyAvailabilityStatusToContacts = (userId: string, status: number) => {
  return invokeHubMethod(SEND_AVAILABILITY_STATUS_CHANGED, {
    userId,
    status,
  });
};

const handleContactAvailabilityStatusChange = async (
  callback: (userId: string, status: number) => void
) => {
  const hubConnection = await getHubConnection();
  hubConnection?.on(RECEIVE_AVAILABILITY_STATUS_CHANGED, callback);
};

const handleContactStatusChange = async (
  callback: (userId: string, isOnline: boolean) => void
) => {
  const hubConnection = await getHubConnection();
  hubConnection?.on(USER_STATUS_CHANGED, callback);
};

const notifyTypingToContacts = () => {
  return invokeHubMethod(NOTIFY_TYPING);
};

const sendFriendRequest = async (
  receiverUserId: string,
  hasWaved: boolean,
  message: string | null,
  callback: (friendRequestId: number) => void
): Promise<void> => {
  try {
    const hubConnection = await getHubConnection();
    if (hubConnection) {
      const friendRequestId = await hubConnection.invoke(SEND_FRIEND_REQUEST, {
        receiverUserId,
        hasWaved,
        message,
      });
      callback(friendRequestId);
    }
  } catch (err) {
    console.error(
      `Error while sending friend request to user ${receiverUserId}:`,
      err
    );
  }
};

const handleReceiveFriendRequest = async (
  callback: (friendRequestId: number, senderUser: any) => void
) => {
  const hubConnection = await getHubConnection();
  hubConnection?.on(RECEIVE_FRIEND_REQUEST, callback);
};

const sendFriendRequestMessage = (
  friendRequestId: number,
  receiverUserId: string,
  message: string
) => {
  return invokeHubMethod(
    SEND_FRIEND_REQUEST_MESSAGE,
    friendRequestId,
    receiverUserId,
    message
  );
};

const handleReceiveFriendRequestMessage = async (
  callback: (friendRequestId: number, message: string) => void
) => {
  const hubConnection = await getHubConnection();
  hubConnection?.on(RECEIVE_FRIEND_REQUEST_MESSAGE, callback);
};

const sendFriendRequestAccepted = (
  friendRequestId: number,
  conversationId: number,
  receiverUserId: string
) => {
  return invokeHubMethod(
    SEND_FRIEND_REQUEST_ACCEPTED,
    friendRequestId,
    conversationId,
    receiverUserId
  );
};

// export const handleReceiveFriendRequestAccepted = (callback: (friendRequestId: number, conversationId: number) => void) => {
//   const hubConnection = getHubConnection();
//   hubConnection?.on(RECEIVE_FRIEND_REQUEST_ACCEPTED, callback);
// };

export {
  getHubConnection,
  startConnection,
  stopHubConnection,
  sendMessage,
  notifyAvailabilityStatusToContacts,
  handleContactAvailabilityStatusChange,
  handleContactStatusChange,
  notifyTypingToContacts,
  sendFriendRequest,
  handleReceiveFriendRequest,
  handleReceiveFriendRequestMessage,
  sendFriendRequestMessage,
  sendFriendRequestAccepted,
};
