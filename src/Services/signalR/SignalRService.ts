import * as signalR from "@microsoft/signalr";
import { getAuthToken } from "../../util/auth";
import { isTokenExpired, refreshAccessToken } from "./../AuthService";
import { CP_API_URL_DEV } from "../../environment";
import {
  NOTIFY_TYPING,
  RECEIVE_FRIEND_REQUEST,
  RECEIVE_FRIEND_REQUEST_MESSAGE,
  SEND_FRIEND_REQUEST,
  SEND_FRIEND_REQUEST_MESSAGE,
  SEND_MESSAGE,
  USER_STATUS_CHANGED,
} from "./constants";

let hubCon;

export const getHubConnection = () => {
  const token = getAuthToken();
  // if (!hubCon && token) {
  if (token && (!hubCon || (hubCon && isTokenExpired()))) {
    hubCon = new signalR.HubConnectionBuilder()
      // .withUrl(`${CP_API_URL_DEV}/chat?access_token=${token}`)
      .withUrl(`${CP_API_URL_DEV}/chat`, {
        accessTokenFactory: () => {
          return token;
        },
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();
  }
  return hubCon;
};

export const startConnection = async () => {
  try {
    const hubConnection = getHubConnection();
    await hubConnection?.start().catch(function (e) {
      debugger;
    });
    console.log(
      "%cSignalR Connected!",
      "line-height: 1.5; font-weight: bold; color: #28a745;"
    );
  } catch (err) {
    debugger;
    console.error("Error while establishing SignalR connection:", err);
    if (err.includes("401") || isTokenExpired()) {
      await refreshAccessToken();
    }
    await startConnection();
  }
};

export const sendMessage = async (
  receiverUserId: string,
  message: string,
  activeConversationId: number
) => {
  try {
    const hubConnection = getHubConnection();
    await hubConnection.invoke(
      SEND_MESSAGE,
      receiverUserId,
      message,
      activeConversationId
    );
  } catch (err) {
    debugger;
    console.error("Error while sending message:", err);
    if (isTokenExpired()) {
      await refreshAccessToken();
    }
    await startConnection();
  }
};

export const handleContactStatusChange = (
  callback: (p1: string, p2: boolean) => void
) => {
  const hubConnection = getHubConnection();
  hubConnection.on(USER_STATUS_CHANGED, (userId, isOnline) => {
    callback(userId, isOnline);
  });
};

export const NotifyTypingToContacts = async () => {
  try {
    const hubConnection = getHubConnection();
    await hubConnection.invoke(NOTIFY_TYPING);
  } catch (error) {}
};

export const sendFriendRequest = async (
  receiverUserId: string,
  HasWaved: boolean,
  message: string | null,
  callback: (p1: number) => void
) => {
  try {
    const hubConnection = getHubConnection();
    const friendRequestId = await hubConnection.invoke(SEND_FRIEND_REQUEST, {
      receiverUserId,
      HasWaved,
      message,
    });
    callback(friendRequestId);
  } catch (err) {
    debugger;
    console.error(
      `Error while sending friend request to user ${receiverUserId}:`,
      err
    );
  }
};

export const handleReceiveFriendRequest = (
  callback: (p1: number, p2: any) => void
) => {
  const hubConnection = getHubConnection();
  hubConnection.on(RECEIVE_FRIEND_REQUEST, (friendRequestId, senderUser) => {
    callback(friendRequestId, senderUser);
  });
};

export const sendFriendRequestMessage = async (
  friendRequestId: number,
  receiverUserId: string,
  message: string
) => {
  try {
    const hubConnection = getHubConnection();
    await hubConnection.invoke(
      SEND_FRIEND_REQUEST_MESSAGE,
      friendRequestId,
      receiverUserId,
      message
    );
  } catch (err) {
    debugger;
    console.error(
      `Error while sending friend request message to user ${receiverUserId}:`,
      err
    );
  }
};

export const handleReceiveFriendRequestMessage = (
  callback: (p1: number, p2: string) => void
) => {
  const hubConnection = getHubConnection();
  hubConnection.on(
    RECEIVE_FRIEND_REQUEST_MESSAGE,
    (friendRequestId, message) => {
      callback(friendRequestId, message);
    }
  );
};
