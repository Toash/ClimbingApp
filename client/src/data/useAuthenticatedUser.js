import fetchWithRetry from "auth/fetchWithRetry";
import getCidFromToken from "auth/getCidFromToken";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "queryKeys";
import { jwtDecode } from "jwt-decode";
import goToLogin from "goToLogin";
import { useState, useEffect } from "react"


/**
 * Custom hook to fetch the authenticated user's data.
 * Gets use data from id_token.
 *
 * @param {boolean} [redirect=false] - Determines if the user should be redirected to login if no id_token is avaliable.
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
    const [cid, setCid] = useState(null);

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

