import { LoginCredentials, LoginResponse } from "../../types/Account";
import { EncryptedAPIService } from "../axios-utils/EncryptedAPIService";

export class Account {
  async Login(userCred: LoginCredentials): Promise<LoginResponse> {
    const url = `account/login`;
    const response: LoginResponse = await EncryptedAPIService.post(
      url,
      userCred
    );
    return response;
  }
}
