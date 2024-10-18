import { useQuery } from "@tanstack/react-query";
import goToLogin from "goToLogin";
import { QUERY_KEYS } from "queryKeys";

/**
 * Gets the current user info if it is cached, otherwise it will redirect to login page.
 * 
 * Only call this function in components that need an authenticated user.
 * 
 * 
 */
export default function getAuthenticatedUser(queryClient) {

    const user = queryClient.getQueryData(QUERY_KEYS.CURRENT_USER)

    // no user go to login.
    if (!user) {
        goToLogin();
        return null;
    }


    return useQuery({
        queryKey: [QUERY_KEYS.CURRENT_USER],
        queryFn: () => user,
        staleTime: Infinity
    });
}