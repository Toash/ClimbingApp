/**
 * Gets refresh token from cookies and attempts to refresh. If successful sets the id_token in localStorage.
 * Returns true if token refresh is successful, false otherwise.
 * @returns {boolean}
 */
async function refreshIdToken() {
    let id_token = null;

    try {
        const tokenResponse = await fetch(
            process.env.REACT_APP_API_BASE_URL + "/auth/refresh-token",
            {
                method: "POST",
                credentials: "include", // include refresh token (in cookie)
            }
        );

        if (tokenResponse.ok) {
            const data = await tokenResponse.json();
            console.log("OK response from /auth/refresh-token, here is the data: ", data);
            id_token = data?.id_token;
            if (token) {
                localStorage.setItem("id_token", id_token)
            } else {
                return false;
            }

        } else {
            return false;
        }
    } catch (error) {
        return false
    }

    return true;

}

export default refreshIdToken;