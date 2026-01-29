import axios from 'axios';


const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 seconds timeout
});

/*
    - If access token expired (404)
    - Call /auth/refresh-token
    - Retry original request
 */
API.interceptors.response.use(

    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url.includes("/auth/refresh-token") 
        ) {
            originalRequest._retry = true;

            try {
                await API.post('/auth/refresh-token');
                return API(originalRequest);
            } catch (error) {
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }

);

export default API;