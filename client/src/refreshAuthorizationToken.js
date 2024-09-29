//should be called when 401 requests happen on authorized endpoints, to try and get a valid access token again.
import { setLogin } from "state";

/**
 * Attempts to get token used for authorization (id token in this case) and store it in redux store
 * @param {*} dispatch
 * @returns true or false
 */
async function refreshAuthorizationToken(dispatch) {
  let token = null;

  try {
    const tokenResponse = await fetch(
      process.env.REACT_APP_API_BASE_URL + "/auth/refresh-token",
      {
        method: "POST",
        credentials: "include",
      }
    );

    if (tokenResponse.ok) {
      const data = await tokenResponse.json();
      console.log("Token successfully refreshed!");
      console.log("Here is the token data: ", data);

      if (data.id_token) {
        dispatch(setLogin({ token: data.id_token }));
      }
      token = data.id_token;
    } else {
      console.log("Failed to refresh token, non-ok response from server.");
    }
  } catch (error) {
    console.error("Error when trying to refresh access token:", error);
  }

  return token;
}

export default refreshAuthorizationToken;
