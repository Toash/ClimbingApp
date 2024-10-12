

/**
 * getHighestVGradePost
 * @param {string} userId - user to get hiscore post from
 * @returns post | null
 */
export const getHighestVGradePost = async (userId) => {
    try {
        if (!userId) {
            throw new Error("User id is null!")
        }
        const response =
            await fetch(
                process.env.REACT_APP_API_BASE_URL + `/posts/user/${userId}/hiscore`,
                {
                    method: "GET"
                }
            )
        const data = await response.json();
        return data;
    } catch (e) {
        console.log("Cannot find user or post with hiscore");
        console.log(e.message);
        return null;
    }
};

