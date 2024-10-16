import { useQuery } from "@tanstack/react-query";

// we could make this more efficient by definining queries for each individual attribute for users. And using multiple keys for this.
/**
 * Gets the user, stores the query in the ["otherUser",userId] key. 
 * @param {string} userId the cognito id for the user
 * @returns 
 */
export default function getUser(userId) {
    return useQuery({
        queryKey: ["otherUser", userId], queryFn: async () => {
            try {
                const response = await fetch(process.env.REACT_APP_API_BASE_URL + `users/${userId}`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("id_token")}`
                        }
                    })
                const data = await response.json();
                return data;
            } catch (e) {
                throw new Error("Error trying to get user: " + e);
            }
        }
    })
}