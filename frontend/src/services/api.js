/**
 * API Service - Axios instance with interceptors
 * Handles authentication headers and error responses
 */

import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Create axios instance
const api = axios.create({
    baseURL: `${BACKEND_URL}/api`,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor - Add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 Unauthorized - Token expired
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            // Optionally redirect to login
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;

// Export specific API functions for convenience
export const productsApi = {
    getAll: (params) => api.get('/products', { params }),
    getOne: (id) => api.get(`/products/${id}`),
    getCategories: () => api.get('/products/categories'),
    create: (data) => api.post('/products', data),
    update: (id, data) => api.put(`/products/${id}`, data),
    delete: (id) => api.delete(`/products/${id}`)
};

export const ordersApi = {
    create: (data) => api.post('/orders', data),
    getAll: () => api.get('/orders'),
    getOne: (id) => api.get(`/orders/${id}`),
    getAllAdmin: () => api.get('/admin/orders'),
    updateStatus: (id, status) => api.put(`/admin/orders/${id}/status`, { status })
};

export const adminApi = {
    getStats: () => api.get('/admin/stats'),
    getOrders: () => api.get('/admin/orders')
};
