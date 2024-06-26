import { AuthorizedAPIService } from "../axios-utils/AuthorizedAPIService";
import { RecentChatAPIResponse } from "../../types/Conversation";

export class Conversation {
  async GetRecentConversations(userId: string): Promise<RecentChatAPIResponse> {
    const url = `conversation/${userId}/recent`;
    const response: RecentChatAPIResponse = await AuthorizedAPIService.get(url);
    return response;
  }

  async GetConversationMessages(
    conversationId: number,
    userId: string,
    skip: number,
    take: number = 20
  ) {
    const url = `conversation/${conversationId}/messages?userId=${userId}&skip=${skip}&take=${take}`;
    const response: any[] = await AuthorizedAPIService.get(url);
    return response;
  }

  async UpdateMessageStatus(conversationId: number, userId: string) {
    const url = `conversation/${conversationId}/messages/seen/${userId}`;
    const response = await AuthorizedAPIService.put(url);
    return response;
  }
}
