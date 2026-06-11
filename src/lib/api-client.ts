import axios from "axios";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const apiClient = axios.create({
  baseURL: BASE_URL,
  // ← NO global Content-Type here.
  // Axios sets it automatically:
  //   - JSON objects   → application/json
  //   - URLSearchParams → application/x-www-form-urlencoded
  // A global override breaks the login form POST.
});

// ── Request interceptor: attach latest token on every request ─────────────────
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: auto-refresh on 401 ────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        return Promise.reject(error);
      }

      try {
        // Use a plain axios call (not apiClient) to avoid interceptor loops
        const res = await axios.post(
          `${BASE_URL}/auth/refresh`,
          null,
          { params: { refresh_token: refreshToken } }
        );

        localStorage.setItem("access_token", res.data.access_token);
        localStorage.setItem("refresh_token", res.data.refresh_token);

        originalRequest.headers.Authorization = `Bearer ${res.data.access_token}`;
        return apiClient(originalRequest);
      } catch {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;