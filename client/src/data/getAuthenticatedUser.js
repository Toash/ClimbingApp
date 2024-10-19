import { QueryClient } from "@tanstack/react-query";
import fetchWithRetry from "auth/fetchWithRetry";
import getCidFromToken from "auth/getCidFromToken";
import { QUERY_KEYS } from "queryKeys";

/**
 * Needs a user in cache or id_token.
 * Gets the current user info if it is cached, otherwise it will try to get user from id_token and set this in the cache.
 * If both fail, it will return to login page.
 * 
 * Only call this function in components that need an authenticated user.
 */
export default async function getAuthenticatedUser() {

    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: Infinity, // so current user in cache does not become invalid through time.
            },
        }
    });
    const user = queryClient.getQueryData(QUERY_KEYS.CURRENT_USER)

    if (!user) {
        const cid = getCidFromToken();
        if (cid) {
            const response = await fetchWithRetry(
                process.env.REACT_APP_API_BASE_URL + `/users/${cid}`,
                {
                    method: "GET",
                    headers: { Authorization: `Bearer ${localStorage.getItem("id_token")}` },
                }
            );
            const data = await response.json();
            queryClient.setQueryData(QUERY_KEYS.CURRENT_USER, data);
        }

    } else {
        return user;
    }


}

