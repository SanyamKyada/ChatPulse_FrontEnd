const devApiUrl = import.meta.env.VITE_DEV_API_URL;

export const isLoggedIn = (): boolean =>
  sessionStorage.getItem("access_token") !== null;

export const isTokenExpired = (): boolean => {
  const token = sessionStorage.getItem("access_token");
  if (!token) return true; // Token not found
  const decodedToken = JSON.parse(atob(token.split(".")[1]));
  const currentTime = Date.now() / 1000;
  return decodedToken.exp < currentTime;
};

// Function to refresh the token
export const refreshAccessToken = async () => {
  try {
    const refreshToken = sessionStorage.getItem("refreshToken");
    const jwtToken = sessionStorage.getItem("access_token");
    const response = await fetch(`${devApiUrl}/account/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ jwtToken, refreshToken }),
    });
    if (!response.ok) {
      throw new Error("Failed to refresh token");
    }
    const { jwttoken, refreshtoken } = await response.json();

    sessionStorage.setItem("access_token", jwttoken);
    sessionStorage.setItem("refreshToken", refreshtoken);

    console.warn("token refreshed at:" + new Date().toLocaleTimeString());
    return jwttoken;
  } catch (error) {
    console.error("Error refreshing token:", error);
    // Handle error
  }
};

export const decodeToken = (token: string) => {
  const payload = token.split(".")[1];
  return JSON.parse(atob(payload));
};
