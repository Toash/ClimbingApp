import { jwtDecode } from "jwt-decode";
import goToLogin from "goToLogin";

/**
 * If an id_token is in local storage it will decode it to get the cid.
 * If no id_token, redirect to login page.
 * @returns cid or null
 */
export default function getCidFromToken() {
    const id_token = localStorage.getItem("id_token")
    if (!id_token) {
        goToLogin();
        return null;
    }

    const decoded = jwtDecode(id_token);
    console.log("Decoded id_token: ", decoded)
    const cid = decoded.sub;

    return cid;
}