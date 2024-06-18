import { Account } from "./api/Account";
import { Conversation } from "./api/Conversation";
import { FriendRequest } from "./api/FriendRequest";
import { User } from "./api/User";

export const ConversationApi = new Conversation();
export const FriendRequestApi = new FriendRequest();
export const UserApi = new User();
export const AccountApi = new Account();
