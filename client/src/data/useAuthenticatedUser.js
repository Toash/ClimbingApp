import fetchWithRetry from "auth/fetchWithRetry";
import getCidFromToken from "auth/getCidFromToken";
import { QUERY_KEYS } from "queryKeys";

/**
 * Wrapper for useQuery.
 * Needs a user in cache or id_token.
 * Gets the current user info if it is cached, otherwise it will try to get user from id_token and set this in the cache.
 * If both fail, it will return to login page.
 * 
 * Only call this function in components that need an authenticated user.
 */
export default async function useAuthenticatedUser(redirect = false) {

    if (redirect) {

        return useQuery({
            queryKey: QUERY_KEYS.CURRENT_USER,
            queryFn: async () => {
                // Assumes that the user has a vlaid id token,
                // if not it redirects (from getCidFromToken)
                const cid = getCidFromToken();
                const response = await fetchWithRetry(
                    process.env.REACT_APP_API_BASE_URL + `/users/${cid}`,
                    {
                        method: "GET",
                        headers: { Authorization: `Bearer ${localStorage.getItem("id_token")}` },
                    }
                );
                const data = await response.json();
                return data;
            }
        })
    } else {
        return useQuery({
            enabled: !!localStorage.getItem("id_token"),
            queryKey: QUERY_KEYS.CURRENT_USER,
            queryFn: async () => {
                const cid = jwtDecode(localStorage.getItem("id_token")).sub
                const response = await fetchWithRetry(
                    process.env.REACT_APP_API_BASE_URL + `/users/${cid}`,
                    {
                        method: "GET",
                        headers: { Authorization: `Bearer ${localStorage.getItem("id_token")}` },
                    }
                );
                const data = await response.json();
                return data;
            }
        })
    }


}

