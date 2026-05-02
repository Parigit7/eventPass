import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.8.182:5000/api';

const axiosInstance = axios.create({
    baseURL: API_URL,
});

// Add a request interceptor to add the auth token to headers
axiosInstance.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle token expiration
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response && error.response.status === 401) {
            // Token is invalid or expired
            await AsyncStorage.clear();
            // Optional: You could trigger a global event here to redirect to login
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
