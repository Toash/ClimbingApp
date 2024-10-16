import { useQuery, useQueryClient } from "@tanstack/react-query";
import goToLogin from "goToLogin";

/**
 * Gets the current user info if it is cached, otherwise it will redirect to login page.
 * This function is different from the one tha tgets other user info because we need the current
 * User info to ensure that we are authenticated.
 */
export default function getCurrentUser() {
    const queryClient = useQueryClient();

    const user = queryClient.getQueryData(["currentUser"])

    // no user go to login.
    if (!user) {
        goToLogin();
        return null;
    }

    // get cached user.
    return useQuery({
        queryKey: ["currentUser"],
        queryFn: () => user,
        staleTime: Infinity
    });
}