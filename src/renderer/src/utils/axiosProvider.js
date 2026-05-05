import axios from 'axios'
import { sessionStorageGetItem, sessionStorageRemoveItem } from './GlobalFunction';

const isLive = true;

export const apiUrl = isLive ? 'https://dev-dwm.jamsara.com/api' : 'http://localhost:5800/api/';
export const socketApiUrl = isLive ? 'https://dev-dwm.jamsara.com/socket' : 'http://localhost:5800/socket';

// export const apiUrl = isLive ? 'https://dev-dwm.jamsara.com/api' : 'http://192.168.29.100:5800/api/';
// export const socketApiUrl = isLive ? 'https://dev-dwm.jamsara.com/api' : 'http://192.168.29.100:5800//socket';

const axiosPublic = axios.create({
    baseURL: apiUrl,
    headers: { "Content-Type": "application/json" },
});

axiosPublic.interceptors.response.use(
    (response) => response,
    (error) => {
        if (!error.response) {
            return Promise.reject({ message: "Network error. Please try again." });
        }
        switch (error.response.status) {
            case 500:
                return Promise.reject({ message: "Internal server error. Please try again later." });
            default:
                return Promise.reject(error.response.data);
        }
    }
);
const axiosPrivate = axios.create({
    baseURL: apiUrl,
    headers: { "Content-Type": "application/json" },
});

axiosPrivate.interceptors.request.use(
    (config) => {
        const returnData = sessionStorageGetItem();
        if (returnData?.token) {
            config.headers["Authorization"] = `Bearer ${returnData.token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

axiosPrivate.interceptors.response.use(
    (response) => {
        if (response?.data?.code === 3) {
            // sessionStorageRemoveItem();
            // window.location.href = "/login";
        }
        return response;
    },
    (error) => {
        console.log("=============error", error)
        if (!error.response) {
            return Promise.reject({ message: "Network error. Please try again." });
        }
        switch (error.response.status) {
            case 401:
                sessionStorageRemoveItem();
                window.location.href = "/login";
                break;
            case 403:


                console.log("error.response.status", error)
                return Promise.reject({ message: error?.response?.data?.message || "Access denied. Insufficient permissions." });
            case 500:
                return Promise.reject({ message: "Internal server error. Please try again later." });
            default:
                return Promise.reject(error.response.data);
        }
    }
);

const axiosImage = axios.create({
    baseURL: apiUrl,
    headers: { 'Content-Type': 'multipart/form-data' },
});

axiosImage.interceptors.request.use(
    (config) => {
        const returnData = sessionStorageGetItem();
        if (returnData?.token) {
            config.headers['Authorization'] = `Bearer ${returnData.token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

axiosImage.interceptors.response.use(
    (response) => {
        if (response?.data?.code === 3) {
            sessionStorageRemoveItem();
            window.location.href = "/login";
        }
        return response;
    },
    (error) => {
        if (!error.response) {
            return Promise.reject({ message: "Network error. Please try again." });
        }
        switch (error.response.status) {
            case 500:
                return Promise.reject({ message: "Internal server error. Please try again later." });
            default:
                return Promise.reject(error.response.data);
        }
    }
);



export { axiosPrivate, axiosPublic, axiosImage };