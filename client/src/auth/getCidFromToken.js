import goToLogin from "goToLogin.js";
import { jwtDecode } from "jwt-decode";


// extacts cid from the id_token
export default function getCidFromToken(id_token) {
    if (!id_token) {
        throw new Error("id_token must be specified when passing into getCidFromToken().")
    }

    const decoded = jwtDecode(id_token);
    const cid = decoded.sub;

    return cid;


}