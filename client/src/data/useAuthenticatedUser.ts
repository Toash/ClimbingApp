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
import { useState, useEffect, useMemo } from "react"
import { UserData } from "./interfaces.js";
import { useQueryClient } from "@tanstack/react-query"

/**
 * Custom hook to fetch the authenticated user's data.
 * Gets use data from id_token.
 */
export default function useAuthenticatedUser(): UseQueryResult<UserData, Error> {

    const idToken = localStorage.getItem("id_token"); // why does this have to be outside of useeffect
    const [cid, setCid] = useState<string | null | undefined>(null);

    useEffect(() => {
        // we have the id token 
        if (idToken) {
            console.log("must get authenticated user, trying to ezxtract cid.")
            setCid(getCidFromToken(idToken))
        }

    }, [idToken]);

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
