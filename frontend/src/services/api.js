// API Client for BookNest Backend
// This is a centralized API service that handles all HTTP requests to the backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiError extends Error {
    constructor(message, status, data = null) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }
}

// Base fetch wrapper with credentials
async function request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const config = {
        ...options,
        credentials: 'include', // Important for session cookies
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...options.headers,
        },
    };

    try {
        const response = await fetch(url, config);

        // Handle empty responses
        const text = await response.text();
        const data = text ? JSON.parse(text) : null;

        if (!response.ok) {
            const errorMessage = data?.message || data?.error || 'An error occurred';
            throw new ApiError(errorMessage, response.status, data);
        }

        return data;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        // Network or other errors
        throw new ApiError(error.message || 'Network error', 0, null);
    }
}

// HTTP method helpers
export const api = {
    get: (endpoint) => request(endpoint, { method: 'GET' }),

    post: (endpoint, data) => request(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
    }),

    patch: (endpoint, data) => request(endpoint, {
        method: 'PATCH',
        body: JSON.stringify(data),
    }),

    put: (endpoint, data) => request(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),

    delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
};

// Auth API
export const authApi = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    signup: (name, email, password) => api.post('/auth/signup', { name, email, password }),
    logout: () => api.post('/auth/logout'),
    checkSession: () => api.get('/auth/session'),
    getProfile: () => api.get('/auth/profile'),
};

// Books API
export const booksApi = {
    getAll: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.search) searchParams.append('search', params.search);
        if (params.genre && params.genre !== 'All') searchParams.append('genre', params.genre);
        if (params.featured) searchParams.append('featured', 'true');
        if (params.newArrivals) searchParams.append('newArrivals', 'true');

        const queryString = searchParams.toString();
        return api.get(`/books${queryString ? `?${queryString}` : ''}`);
    },
    getById: (id) => api.get(`/books/${id}`),
    getCategories: () => api.get('/books/categories'),
    getFeatured: () => api.get('/books/featured'),
    getNewArrivals: () => api.get('/books/new-arrivals'),
    getReviews: (bookId) => api.get(`/books/${bookId}/reviews`),
    addReview: (bookId, review) => api.post(`/books/${bookId}/reviews`, review),
};

// Reservations API
export const reservationsApi = {
    getAll: () => api.get('/reservations'),
    getActive: () => api.get('/reservations/active'),
    getHistory: () => api.get('/reservations/history'),
    getStats: () => api.get('/reservations/stats'),
    getById: (id) => api.get(`/reservations/${id}`),
    create: (reservation) => api.post('/reservations', reservation),
    checkout: (items) => api.post('/reservations/checkout', { items }),
    pickup: (id) => api.patch(`/reservations/${id}/pickup`),
    return: (id) => api.patch(`/reservations/${id}/return`),
    extend: (id) => api.patch(`/reservations/${id}/extend`),
    cancel: (id) => api.delete(`/reservations/${id}`),
};

// Users API
export const usersApi = {
    getMe: () => api.get('/users/me'),
    getDashboard: () => api.get('/users/dashboard'),
    updateMe: (data) => api.patch('/users/me', data),
    getTheme: () => api.get('/users/theme'),
    updateTheme: (theme) => api.patch('/users/theme', { theme }),
    getWishlist: () => api.get('/users/wishlist'),
    addToWishlist: (bookId) => api.post('/users/wishlist', { bookId }),
    removeFromWishlist: (bookId) => api.delete(`/users/wishlist/${bookId}`),
};

// Cart API
export const cartApi = {
    get: () => api.get('/cart'),
    add: (data) => api.post('/cart', {
        bookId: data.bookId,
        pickupDate: data.pickupDate,
        duration: parseInt(data.duration),
    }),
    remove: (id) => api.delete(`/cart/${id}`),
    clear: () => api.delete('/cart'),
};

// Contact API
export const contactApi = {
    submit: (data) => api.post('/contact', data),
};

// Export error class for error handling
export { ApiError };

export default api;
