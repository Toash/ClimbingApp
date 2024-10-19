import { jwtDecode } from "jwt-decode";
import goToLogin from "goToLogin";

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