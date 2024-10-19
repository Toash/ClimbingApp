import { QueryClient } from "@tanstack/react-query";
import fetchWithRetry from "auth/fetchWithRetry";
import getCidFromToken from "auth/getCidFromToken";
import { QUERY_KEYS } from "queryKeys";

/**
 * Gets the current user info if it is cached, otherwise it will redirect to login page.
 * 
 * Only call this function in components that need an authenticated user.
 * 
 * 
 */
export default async function getAuthenticatedUser() {

    const queryClient = new QueryClient();
    const user = queryClient.getQueryData(QUERY_KEYS.CURRENT_USER)
    // no user go to login.
    if (!user) {
        const cid = getCidFromToken();
        const response = await fetchWithRetry(
            process.env.REACT_APP_API_BASE_URL + `/users/${cid}`,
            {
                method: "GET",
                headers: { Authorization: `Bearer ${localStorage.getItem("id_token")}` },
            }
        );
        return await response.json();
    } else {

    }


}

