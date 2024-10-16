import refreshAuthorizationToken from "./refreshAuthorizationToken.js";

const fetchWithRetry = async (url, options) => {
    try {
        let response = await fetch(url, options);

        if (response.status === 401) {
            console.log("Unauthorized request... attempting to refresh token");
            const refreshed = await refreshAuthorizationToken();
            if (refreshed) {
                options.headers.Authorization = `Bearer ${token}`;
                response = await fetch(url, options);
            } else {

            }
        }

        return response;
    } catch (e) {
        console.error("Error in fetchWithRetry", e.message);
        throw e;
    }
};

export default fetchWithRetry;