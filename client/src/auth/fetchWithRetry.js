import goToLogin from "goToLogin.js";
import refreshIdToken from "./refreshAuthorizationToken.js";

/**
 * Attempts to fetch, if the response status is unauthorized, will try to get a new token (assumed we have refresh token in cookies.)
 * If response is unauthorized and we dont have a refresh token, will direct user to the login page.
 * 
 * Same signature as fetch
 * @param {string} url 
 * @param {object} options 
 * @returns 
 */
const fetchWithRetry = async (url, options) => {
    try {
        let response = await fetch(url, options);

        if (response.status === 401) {
            console.log("Unauthorized request... attempting to refresh token");
            const refreshed = await refreshIdToken();
            if (refreshed) {
                options.headers.Authorization = `Bearer ${token}`;
                response = await fetch(url, options);
            } else {
                goToLogin(); // just start the whole process again
            }
        }

        return response;
    } catch (error) {
        throw new Error(`Error in fetchWithRetry: ${error}`);
    }
};

export default fetchWithRetry;