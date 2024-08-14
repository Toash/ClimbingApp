import { useDispatch } from "react-redux";
import { setLogout } from "./state";

const LogoutButton = () => {
  const dispatch = useDispatch();

  const handleLogout = () => {
    // Clear localStorage or sessionStorage if you store data there
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Dispatch the logout action
    dispatch(setLogout());

    // Optionally redirect the user to the login page or home page
    window.location.href = "/login"; // or use history.push("/login") if using react-router
  };

  return <button onClick={handleLogout}>Logout</button>;
};

export default LogoutButton;
