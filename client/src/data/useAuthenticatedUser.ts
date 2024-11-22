// @ts-ignore
import fetchWithRetry from "auth/fetchWithRetry";
// @ts-ignore
import getCidFromToken from "auth/getCidFromToken";
import { QueryKey, useQuery, UseQueryResult } from "@tanstack/react-query";
// @ts-ignore
import { QUERY_KEYS } from "queryKeys";
import { jwtDecode } from "jwt-decode";
// @ts-ignore
import goToLogin from "goToLogin";
import { useState, useEffect } from "react"
import { UserData } from "./interfaces.js";


/**
 * Custom hook to fetch the authenticated user's data.
 * Gets use data from id_token.
 *
 * @param {boolean} [redirect=false] - Determines if the user should be redirected to login if no id_token is avaliable.
 * @param {boolean} [required=true] - Will throw an error if the id_token is not set.
 */
export default function useAuthenticatedUser({ redirect = false, required = false } = {}): UseQueryResult<UserData, Error> {

    const idToken = localStorage.getItem("id_token");
    const [cid, setCid] = useState<string | null | undefined>(null);

    useEffect(() => {

        // no id token, just go to the login page
        if (!idToken && redirect) {
            goToLogin();
            return;
        }

        // we have the id token 
        if (idToken) {
            console.log("must get authenticated user, trying to ezxtract cid.")
            setCid(getCidFromToken())
        }

        if (required) {
            if (!idToken) {
                throw new Error("id token must be defined because the required attribute was set to true")
            }
        }

    }, []);

    return useQuery<UserData, Error, UserData, [string]>({
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
            const data = await response.json();
            return data;
        },
        staleTime: Infinity,
    });


}

