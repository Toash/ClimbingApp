export default function goToLogin() {
    localStorage.clear();
    window.location.href = process.env.REACT_APP_LOGIN_URL;
}