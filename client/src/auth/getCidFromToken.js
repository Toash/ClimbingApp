import { jwtDecode } from "jwt-decode";
import goToLogin from "goToLogin";


// extacts cid from the id_token
export default function getCidFromToken() {
    const id_token = localStorage.getItem("id_token")
    const decoded = jwtDecode(id_token);
    //console.log("Decoded id_token: ", decoded)
    const cid = decoded.sub;

    return cid;
}