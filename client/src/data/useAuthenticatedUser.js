// @ts-ignore
import fetchWithRetry from "auth/fetchWithRetry";
// @ts-ignore
import getCidFromToken from "auth/getCidFromToken";
import { useQuery } from "@tanstack/react-query";
// @ts-ignore
import { QUERY_KEYS } from "queryKeys";
import { useState, useEffect } from "react"

/**
 * Custom hook to fetch the authenticated user's data.
 * Gets use data from id_token.
 */
export default function useAuthenticatedUser() {

    const idToken = localStorage.getItem("id_token"); // why does this have to be outside of useeffect
    const [cid, setCid] = useState(null);

    useEffect(() => {
        // we have the id token 
        if (idToken) {
            console.log("must get authenticated user, trying to ezxtract cid.")
            setCid(getCidFromToken(idToken))
        }

    }, [idToken]);

    return useQuery({
        enabled: !!cid, //function closure
        queryKey: QUERY_KEYS.CURRENT_USER,
        queryFn: async () => {
            const response = await fetchWithRetry(
                `${import.meta.env.VITE_APP_API_BASE_URL}/users/${cid}`,
                {
                    method: "GET",
                    headers: { Authorization: `Bearer ${idToken}` },
                }
            );

            // we have a cid, but when trying to get the user from the database it does not exist.
            // this means that we have to create a new user, which will be handled elsewhere.
            // if (response.status == 404 || response.status == 400) {
            //     console.log("Could not find user")
            //     return { userDoesNotExist: true } //  instead of returning the user object, return this instead.
            // }
            const data = await response.json();
            return data;
        },
        staleTime: Infinity,
    });


}
