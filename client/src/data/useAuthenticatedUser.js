import fetchWithRetry from "auth/fetchWithRetry";
import getCidFromToken from "auth/getCidFromToken";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "queryKeys";
import { jwtDecode } from "jwt-decode";

/**
 * Wrapper for useQuery.
 * Needs a user in cache or id_token.
 * Gets the current user info if it is cached, otherwise it will try to get user from id_token and set this in the cache.
 * If both fail, it will return to login page.
 * 
 * Only call this function in components that need an authenticated user.
 */
export default async function useAuthenticatedUser(redirect = false) {

    const idToken = localStorage.getItem("id_token");

    const cid = redirect ? getCidFromToken() : (idToken ? jwtDecode(idToken).sub : null);

    return useQuery({
        enabled: !!cid, // Ensure the query runs only if a CID is available
        queryKey: QUERY_KEYS.CURRENT_USER,
        queryFn: async () => {
            const response = await fetchWithRetry(
                `${process.env.REACT_APP_API_BASE_URL}/users/${cid}`,
                {
                    method: "GET",
                    headers: { Authorization: `Bearer ${idToken}` },
                }
            );
            const data = await response.json();
            return data;
        },
    });


}

