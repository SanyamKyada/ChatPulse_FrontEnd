import * as signalR from "@microsoft/signalr";
import { getAuthToken } from "../util/auth";
import { isTokenExpired, refreshAccessToken } from "./AuthService";

// const hubConnection = new signalR.HubConnectionBuilder()
//     // .withUrl('https://localhost:7003/chat')
//     .withUrl('https://localhost:7003/chat', { accessTokenFactory: () => {
//         const token = localStorage.getItem('token');
//         console.log('Retrieved token:', token);
//         return 'Bearer ' + token;
//     } })
//     .configureLogging(signalR.LogLevel.Information)
//     .build();

let hubCon;

const getHubConnection = () => {
  const token = getAuthToken();
  // if (!hubCon && token) {
  if (token && (!hubCon || (hubCon && isTokenExpired()))) {
    hubCon = new signalR.HubConnectionBuilder()
      // .withUrl('https://localhost:7003/chat')
      .withUrl("https://localhost:7003/chat?access_token=" + token)
      .configureLogging(signalR.LogLevel.Information)
      .build();

    hubCon.onclose(async (error) => {
      debugger;
      if (error && error.statusCode === 401) {
        try {
          // Call your function to refresh the auth token
          const refreshedToken = await refreshAuthToken();

          // Reconnect with the refreshed token
          await startConnection();
        } catch (err) {
          console.error("Error while refreshing token and reconnecting:", err);
        }
      }
    });
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

export const sendMessage = async (receiverUserId, message) => {
  try {
    const hubConnection = getHubConnection();
    await hubConnection.invoke("SendMessage", receiverUserId, message);
  } catch (err) {
    debugger;
    console.error("Error while sending message:", err);
    if (isTokenExpired()) {
      await refreshAccessToken();
    }
    await startConnection();
  }
};

export const receiveMessage = (callback) => {
  const hubConnection = getHubConnection();
  hubConnection.on("ReceiveMessage", (senderUserId, message) => {
    callback(senderUserId, message);
  });
};
