import axios from "axios";
import CryptoJS from "crypto-js";
import { toast } from "react-toastify";

const aesKey = import.meta.env.VITE_AES_KEY;
const baseApiUrl = import.meta.env.VITE_API_URL;

const encryptData = (data) => {
  const key = CryptoJS.enc.Utf8.parse(aesKey);
  const iv = CryptoJS.lib.WordArray.random(16);

  const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(data), key, {
    iv: iv,
    padding: CryptoJS.pad.Pkcs7,
  }).ciphertext;

  const combinedData = iv.concat(encryptedData);
  return combinedData.toString(CryptoJS.enc.Base64);
};

const decryptData = (combinedData) => {
  const key = CryptoJS.enc.Utf8.parse(aesKey);
  const fullCipher = CryptoJS.enc.Base64.parse(combinedData);
  const iv = (fullCipher.clone().sigBytes = 16);

  const decryptedData = CryptoJS.AES.decrypt({ ciphertext: fullCipher }, key, {
    iv: iv,
  });

  return JSON.parse(decryptedData.toString(CryptoJS.enc.Utf8));
};

const EncryptedAPIService = axios.create({
  baseURL: baseApiUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add an interceptor for outgoing requests
EncryptedAPIService.interceptors.request.use(
  (config) => {
    if (config.data) {
      config.data = {
        data: encryptData(config.data),
      };
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

EncryptedAPIService.interceptors.response.use(
  (response) => {
    if (response.status === 200) {
      return response.data;
    } else {
      // show error in sweet alert
      return null;
    }
  },
  (error) => {
    if (error.code === "ERR_NETWORK") {
      toast.error(error.message || "Network error");
    }
    if (
      (error.response && error.response.status === 401) ||
      error.response.status === 400
    ) {
      toast.error(
        error.response?.data?.message || "Error while processing you request"
      );
    }
    console.error("Request error:", error.message);
    // return Promise.reject(error);
  }
);

export { EncryptedAPIService, decryptData };
