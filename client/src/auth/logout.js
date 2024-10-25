export default function logout() {
    localStorage.clear();
    window.location.href = import.meta.env.VITE_APP_BASE_URL;
}