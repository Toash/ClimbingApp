import logout from "auth/logout";

const LogoutButton = () => {

  const handleLogout = () => {
    logout();
  };

  return <button onClick={handleLogout}>Logout</button>;
};

export default LogoutButton;
