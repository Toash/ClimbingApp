import { useQuery } from "@tanstack/react-query";

/**
 * getHighestVGradePost
 * @param {string} userId - user to get hiscore post from
 * @returns post | null
 */
export const useHighestVGradePost = (userId) => {
    return useQuery({
        queryKey: ["hiscore", userId],
        queryFn: async () => {

            if (!userId) {
                throw new Error("User id is null!")
            }
            const response =
                await fetch(
                    import.meta.env.VITE_APP_API_BASE_URL + `/posts/user/${userId}/hiscore`,
                    {
                        method: "GET"
                    }
                )
            const data = await response.json();
            return data;

        }
    })
};

