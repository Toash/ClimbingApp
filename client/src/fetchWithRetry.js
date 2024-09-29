import refreshAuthorizationToken from "./refreshAuthorizationToken.js";
import { useSelector } from "react-redux";

const fetchWithRetry = async (url, options, dispatch) => {
  try {
    let response = await fetch(url, options);

    if (response.status === 401) {
      console.log("Unauthorized request... attempting to refresh token");
      const token = await refreshAuthorizationToken(dispatch);
      if (token) {
        options.headers.Authorization = `Bearer ${token}`;
        response = await fetch(url, options);
      } else {
        throw new Error("Token refresh failed");
      }
    }

    return response;
  } catch (e) {
    console.error("Error in fetchWithRetry", e.message);
    throw e;
  }
};

export default fetchWithRetry;
