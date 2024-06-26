// axios-helper-need-login.ts

import axios, {
  AxiosResponse,
  AxiosError,
  RawAxiosRequestHeaders,
  AxiosRequestConfig,
} from "axios";
import { toast } from "react-toastify";
import { getAuthToken } from "../../util/auth";

const baseApiUrl = import.meta.env.VITE_API_URL;

const getTenant = () => localStorage.getItem("tenant");
const getToken = () => {
  try {
    const access_token = getAuthToken();
    if (access_token) {
      return access_token;
    } else {
      console.log("Token not found");
    }
  } catch {
    console.log("Error while fetching token");
  }
};

const setHeaders = (headers?: RawAxiosRequestHeaders) => {
  if (headers) headers.Authorization = `Bearer ${getToken()}`;
  else headers = { Authorization: `Bearer ${getToken()}` };
};

const unAuthorized = () => {
  toast.error("Please Login");
  window.location.href = "/login";
  localStorage.removeItem("access_token");
};
const forbidden = () => {
  window.location.href = "/forbidden";
  localStorage.removeItem("access_token");
};
const networkError = (message) => {
  toast.error(message ?? "Network error");
};

export const AuthorizedAPIService = axios.create({
  baseURL: baseApiUrl,
  // timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
  responseType: "json",
});

AuthorizedAPIService.interceptors.request.use(
  (config) => {
    setHeaders(config.headers);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

AuthorizedAPIService.interceptors.response.use(
  (response) => {
    if (response.status === 200) {
      return response.data;
    } else {
      // show error in sweet alert
      return null;
    }
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      unAuthorized();
    }
    if (error.response && error.response.status === 403) {
      forbidden();
    }
    if (error.code === "ERR_NETWORK") {
      networkError(error.message);
    }
    console.error("Request error:", error.message);
    return Promise.reject(error);
  }
);

export default AuthorizedAPIService;
