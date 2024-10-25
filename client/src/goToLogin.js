export default function goToLogin() {
    localStorage.clear();
    window.location.href = import.meta.env.VITE_APP_LOGIN_URL;
}