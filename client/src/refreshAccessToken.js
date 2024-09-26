//should be called when 401 requests happen on authorized endpoints, to try and get a valid access token again.
import { setLogin } from "state";

// Attempts to get access token and store it in redux store
async function refreshAccessToken(dispatch) {
  try {
    const response = await fetch(
      process.env.REACT_APP_API_BASE_URL + "/auth/refresh-token",
      {
        method: "POST",
        credentials: "include",
      }
    );

    const data = await response.json();
    if (data.access_token) {
      dispatch(setLogin({ token: data.access_token }));
    }
  } catch (error) {
    console.error("Failed to refresh access token:", error);
  }
}

export default refreshAccessToken;
