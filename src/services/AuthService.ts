const devApiUrl = import.meta.env.VITE_DEV_API_URL;

export const getUser = () => {
  return JSON.parse(localStorage.getItem("user"));
};

export const isLoggedIn = (): boolean => {
  const { accessToken } = getUser();
  return accessToken !== null;
};

export const isTokenExpired = (): boolean => {
  const { accessToken } = getUser();
  if (!accessToken) return true; // Token not found
  const decodedToken = JSON.parse(atob(accessToken.split(".")[1]));
  const currentTime = Date.now() / 1000;
  return decodedToken.exp < currentTime;
};

// Function to refresh the token
export const refreshAccessToken = async () => {
  try {
    const user = getUser();
    const { accessToken, refreshToken } = user;
    const response = await fetch(`${devApiUrl}/account/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ accessToken, refreshToken }),
    });
    if (!response.ok) {
      throw new Error("Failed to refresh token");
    }
    const { accessToken: token, refreshToken: refToken } =
      await response.json();

    localStorage.setItem(
      "user",
      JSON.stringify({
        ...user,
        accessToken: token,
        refreshToken: refToken,
      })
    );

    console.warn("token refreshed at:" + new Date().toLocaleTimeString());
    return token;
  } catch (error) {
    console.error("Error refreshing token:", error);
    // Handle error
  }
};

export const decodeToken = (token: string) => {
  const payload = token.split(".")[1];
  return JSON.parse(atob(payload));
};
