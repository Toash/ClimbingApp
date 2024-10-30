import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "queryKeys";

// we could make this more efficient by definining queries for each individual attribute for users. And using multiple keys for this.
/**
 * Gets the user, stores the query in  key. 
 * @param {string} userId the cognito id for the user
 * @returns 
 */
export default function useUserById(userId) {
    if (!userId) {
        throw new Error("userId undefined in useUserById")
    }

    return useQuery({
        queryKey: [QUERY_KEYS.USER_BY_ID(userId)], queryFn: async () => {
            try {
                const response = await fetch(import.meta.env.VITE_APP_API_BASE_URL + `/users/${userId}`,
                    {
                        method: "GET"
                    })
                const data = await response.json();
                return data;
            } catch (e) {
                throw new Error("Error trying to get user: " + e);
            }
        }
    })
}