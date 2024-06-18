import { AuthorizedAPIService } from "../axios-utils/AuthorizedAPIService";
import { FriendRequest as FriendRequestResponse } from "../../types/FriendRequest";

export class FriendRequest {
  async GetFriendRequestWithMessages(
    friendRequestId: number
  ): Promise<FriendRequestResponse> {
    const url = `friend-request/${friendRequestId}/get-messages`;
    const response: FriendRequestResponse = await AuthorizedAPIService.get(url);
    return response;
  }

  async AcceptFriendRequest(friendRequestId: number): Promise<number> {
    const url = `friend-request/accept-friend-request`;
    const response: any = await AuthorizedAPIService.post(url, friendRequestId);
    return response.conversationId;
  }
}
