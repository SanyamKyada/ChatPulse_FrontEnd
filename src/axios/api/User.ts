import { AuthorizedAPIService } from "../axios-utils/AuthorizedAPIService";
import { DirectorySearchResult } from "../../types/FriendRequest";
import axios, { CancelTokenSource } from "axios";

export class User {
  async GetNonContactPeople(
    userId: string,
    searchQuery: string,
    cancelToken: CancelTokenSource
  ): Promise<DirectorySearchResult> {
    try {
      const url = `user/${userId}/search-people?query=${searchQuery}`;
      const response: DirectorySearchResult = await AuthorizedAPIService.get(
        url,
        {
          cancelToken: cancelToken.token,
        }
      );
      return response;
    } catch (error) {
      console.error("Error searching non-contacts:", error);
      if (axios.isCancel(error)) {
        console.log("Request canceled:", error.message);
      } else {
        throw error;
      }
    }
  }

  async SetAvailabilityStatus(userId: string, Status: number): Promise<any> {
    const url = `user/set-availability-status`;
    const response: any = await AuthorizedAPIService.post(url, {
      userId,
      Status,
    });
    return response;
  }
}
