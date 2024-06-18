import {
  LoginCredentials,
  LoginResponse,
  RegisterCredentials,
  RegisterResponse,
} from "../../types/Account";
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
  async Register(userCred: RegisterCredentials): Promise<RegisterResponse> {
    const url = `account/register`;
    const response: RegisterResponse = await EncryptedAPIService.post(
      url,
      userCred
    );
    return response;
  }
}
