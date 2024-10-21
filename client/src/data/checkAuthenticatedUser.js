import { QUERY_KEYS } from "queryKeys";
import { QueryClient } from "@tanstack/react-query";
import getAuthenticatedUser from "./getAuthenticatedUser";

/**
 * @returns true if authenticated user exists, false otherwise
 */
export default function checkAuthenticatedUser() {

    const queryClient = new QueryClient();

    if (!localStorage.get("id_token")) {
        return false
    }

    if (!queryClient.getQueryData(QUERY_KEYS.CURRENT_USER)) {
        // we have an id token but no current user.
        getAuthenticatedUser();
    }


    return true;
}