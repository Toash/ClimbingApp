import fetchWithRetry from "auth/fetchWithRetry";
import getCidFromToken from "auth/getCidFromToken";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "queryKeys";
import jwtDecode from "jwt-decode";


/**
 * Custom hook to fetch the authenticated user's data.
 *
 * @param {boolean} [redirect=false] - Determines if the user should be redirected.
 * @returns {object} - The result of the useQuery hook.
 *
 * @example
 * const { data, error, isLoading } = useAuthenticatedUser();
 *
 * @example
 * const { data, error, isLoading } = useAuthenticatedUser(true);
 */
export default function useAuthenticatedUser(redirect = false) {

    const idToken = localStorage.getItem("id_token");

    const cid = redirect ? getCidFromToken() : (idToken ? jwtDecode(idToken).sub : null);

    return useQuery({
        enabled: !!cid, //function closure
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
        staleTime: Infinity,
    });


}

