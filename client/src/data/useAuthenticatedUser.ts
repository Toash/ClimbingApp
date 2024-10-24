// @ts-ignore
import fetchWithRetry from "auth/fetchWithRetry";
// @ts-ignore
import getCidFromToken from "auth/getCidFromToken";
import { QueryKey, useQuery, UseQueryResult } from "@tanstack/react-query";
// @ts-ignore
import { QUERY_KEYS } from "queryKeys"; // this wont work with ts?
import { jwtDecode } from "jwt-decode";
// @ts-ignore
import goToLogin from "goToLogin";
import { useState, useEffect } from "react"
import { UserData } from "./interfaces";


/**
 * Custom hook to fetch the authenticated user's data.
 * Gets use data from id_token.
 *
 * @param {boolean} [redirect=false] - Determines if the user should be redirected to login if no id_token is avaliable.
 */
export default function useAuthenticatedUser(redirect = false): UseQueryResult<UserData, Error> {

    const idToken = localStorage.getItem("id_token");
    const [cid, setCid] = useState<string | null | undefined>(null);

    useEffect(() => {
        if (!idToken) {
            if (redirect) {
                goToLogin();
                return;
            }
        }

        if (redirect) {
            setCid(getCidFromToken());
        } else {
            try {
                if (idToken) {
                    const decodedToken = jwtDecode(idToken);
                    if (decodedToken && decodedToken.sub) {
                        setCid(decodedToken.sub);
                    } else {
                        throw new Error("Invalid token structure");
                    }
                }
            } catch (error) {
                console.error("Failed to decode token:", error);
                goToLogin();
            }
        }
    }, [idToken, redirect]);

    return useQuery<UserData, Error, UserData, [string]>({
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

