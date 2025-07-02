/**
 * API Module
 * Handles all HTTP requests and API communication
 */

class ApiService {
    constructor() {
        this.baseURL = 'http://localhost:8080';
        this.defaultHeaders = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };
        this.setupInterceptors();
    }

    /**
     * Setup axios interceptors for request/response handling
     */
    setupInterceptors() {
        // Request interceptor
        axios.interceptors.request.use(
            (config) => {
                this.logRequest(config);
                
                // Add authorization header if token exists and endpoint is not public
                const token = localStorage.getItem('token');
                const isPublicEndpoint = this.isPublicEndpoint(config.url);
                
                if (token && !isPublicEndpoint) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                
                return config;
            },
            (error) => {
                // Request interceptor error
            }
        );

        // Response interceptor
        axios.interceptors.response.use(
            (response) => {
                this.logResponse(response);
                return response;
            },
            (error) => {
                if (error.response && error.response.status === 401) {
                    // Unauthorized request detected
                    // Only force logout if it's a critical endpoint (like /api/user)
                    const url = error.config?.url || '';
                    if (url.includes('/api/user') || url.includes('/api/auth')) {
                        // Critical endpoint 401, forcing logout
                        console.log('Critical endpoint 401, forcing logout');
                        if (typeof authService !== 'undefined' && authService.forceLogout) {
                            authService.forceLogout();
                        } else {
                            localStorage.removeItem('token');
                            localStorage.removeItem('user');
                            const currentPath = window.location.pathname;
                            if (!currentPath.includes('login.html') && !currentPath.includes('register.html')) {
                                if (currentPath.includes('/pages/')) {
                                    window.location.href = '/pages/auth/login.html';
                                } else {
                                    window.location.href = '/pages/auth/login.html';
                                }
                            }
                        }
                    } else {
                        // Non-critical endpoint 401, not forcing logout
                        console.log('Non-critical endpoint 401, not forcing logout:', url);
                        // For non-critical endpoints, just let the error propagate
                        // The calling code can handle it appropriately
                    }
                }
                // Do NOT call redirectToMaintenance here for 502/503/504 or error.request
                this.handleResponseError(error);
                return Promise.reject(error);
            }
        );
    }

    /**
     * Log request details for debugging
     * @param {Object} config - Axios request config
     */
    logRequest(config) {
        // === REQUEST INTERCEPTOR ===
        // Token from localStorage
        // Request URL
        // Request method
        // Request data type
        // Is FormData
        
        if (config.headers.Authorization) {
            // Authorization header set
            console.log('Authorization header set:', config.headers.Authorization.substring(0, 20) + '...');
        }
        
        console.log('All headers:', Object.keys(config.headers));
    }

    /**
     * Log response details for debugging
     * @param {Object} response - Axios response
     */
    logResponse(response) {
        // ✅ Response received
    }

    /**
     * Handle response errors
     * @param {Object} error - Axios error
     */
    handleResponseError(error) {
        // ❌ Response error
        if (error.response?.status === 401) {
            // 401 Unauthorized in handleResponseError
            console.log('401 Unauthorized in handleResponseError');
            // Only force logout for critical endpoints
            const url = error.config?.url || '';
            if (url.includes('/api/user') || url.includes('/api/auth')) {
                // Critical endpoint 401, forcing logout
                console.log('Critical endpoint 401, forcing logout');
                if (typeof authService !== 'undefined' && authService.forceLogout) {
                    authService.forceLogout();
                } else {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    const currentPath = window.location.pathname;
                    if (!currentPath.includes('login.html') && !currentPath.includes('register.html')) {
                        if (currentPath.includes('/pages/')) {
                            window.location.href = '/pages/auth/login.html';
                        } else {
                            window.location.href = '/pages/auth/login.html';
                        }
                    }
                }
            } else {
                // Non-critical endpoint 401, not forcing logout
                console.log('Non-critical endpoint 401, not forcing logout:', url);
            }
        }
    }

    /**
     * Make a GET request
     * @param {string} url - API endpoint
     * @param {Object} config - Additional axios config
     * @returns {Promise} Promise that resolves with response data
     */
    async get(url, config = {}) {
        try {
            const response = await axios.get(`${this.baseURL}${url}`, {
                headers: this.defaultHeaders,
                ...config
            });
            return response;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Make a POST request
     * @param {string} url - API endpoint
     * @param {Object} data - Request data
     * @param {Object} config - Additional axios config
     * @returns {Promise} Promise that resolves with response data
     */
    async post(url, data = {}, config = {}) {
        try {
            const response = await axios.post(`${this.baseURL}${url}`, data, {
                headers: this.defaultHeaders,
                ...config
            });
            return response;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Make a PUT request
     * @param {string} url - API endpoint
     * @param {Object} data - Request data
     * @param {Object} config - Additional axios config
     * @returns {Promise} Promise that resolves with response data
     */
    async put(url, data = {}, config = {}) {
        try {
            const response = await axios.put(`${this.baseURL}${url}`, data, {
                headers: this.defaultHeaders,
                ...config
            });
            return response;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Make a DELETE request
     * @param {string} url - API endpoint
     * @param {Object} config - Additional axios config
     * @returns {Promise} Promise that resolves with response data
     */
    async delete(url, config = {}) {
        try {
            const response = await axios.delete(`${this.baseURL}${url}`, {
                headers: this.defaultHeaders,
                ...config
            });
            return response;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Upload file with multipart/form-data
     * @param {string} url - API endpoint
     * @param {FormData} formData - Form data with file
     * @param {Object} config - Additional axios config
     * @returns {Promise} Promise that resolves with response data
     */
    async upload(url, formData, config = {}) {
        try {
            const response = await axios.post(`${this.baseURL}${url}`, formData, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                ...config
            });
            return response;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Download file as blob
     * @param {string} url - API endpoint
     * @param {Object} config - Additional axios config
     * @returns {Promise} Promise that resolves with blob data
     */
    async download(url, config = {}) {
        try {
            const response = await axios.get(`${this.baseURL}${url}`, {
                responseType: 'blob',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                ...config
            });
            return response;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Make a PATCH request
     * @param {string} url - API endpoint
     * @param {Object} data - Request data
     * @param {Object} config - Additional axios config
     * @returns {Promise} Promise that resolves with response data
     */
    async patch(url, data = {}, config = {}) {
        try {
            const response = await axios.patch(`${this.baseURL}${url}`, data, {
                headers: this.defaultHeaders,
                ...config
            });
            return response;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Handle API errors and provide meaningful messages
     * @param {Object} error - Axios error
     * @returns {Error} Enhanced error with user-friendly message
     */
    handleError(error) {
        let message = 'An unexpected error occurred';
        if (error.response) {
            // Server responded with error status
            const status = error.response.status;
            const data = error.response.data;
            switch (status) {
                case 400:
                    message = data?.message || 'Bad request. Please check your input.';
                    break;
                case 401:
                    message = 'Unauthorized. Please log in again.';
                    break;
                case 403:
                    message = 'Access denied. You don\'t have permission for this action.';
                    break;
                case 404:
                    message = 'Resource not found.';
                    break;
                case 409:
                    message = data?.message || 'Conflict. This resource already exists.';
                    break;
                case 422:
                    message = data?.message || 'Validation error. Please check your input.';
                    break;
                case 500:
                    message = 'Server error. Please try again later.';
                    break;
                case 502:
                case 503:
                case 504:
                    // Server maintenance or gateway errors - redirect to maintenance page
                    this.redirectToMaintenance();
                    message = 'Server is temporarily unavailable.';
                    break;
                default:
                    message = data?.message || `Server error (${status})`;
            }
        } else if (error.request) {
            // Network error - server is down or unreachable
            console.log('Network error detected, redirecting to maintenance page');
            this.redirectToMaintenance();
            message = 'Network error. Server is currently unavailable.';
        } else {
            // Other error
            message = error.message || 'An unexpected error occurred';
        }
        const enhancedError = new Error(message);
        enhancedError.originalError = error;
        enhancedError.status = error.response?.status;
        enhancedError.data = error.response?.data;
        return enhancedError;
    }

    /**
     * Redirect to maintenance page
     */
    redirectToMaintenance() {
        const currentPath = window.location.pathname;
        
        // Don't redirect if already on maintenance page
        if (currentPath.includes('maintenance.html')) {
            return;
        }
        
        // Don't redirect if on auth pages (login/register)
        if (currentPath.includes('login.html') || currentPath.includes('register.html')) {
            return;
        }
        
        console.log('Redirecting to maintenance page due to server issues');
        
        // Determine the correct path to maintenance page
        let maintenancePath;
        if (currentPath.includes('/pages/')) {
            // We're in pages/, maintenance.html is in the same directory
            maintenancePath = 'maintenance.html';
        } else {
            // We're at the root, go to pages/maintenance.html
            maintenancePath = './pages/maintenance.html';
        }
        
        // Store current page for back button functionality
        sessionStorage.setItem('previousPage', window.location.href);
        
        // Redirect to maintenance page
        window.location.href = maintenancePath.startsWith('/') ? maintenancePath : '/' + maintenancePath.replace(/^\.*\/?/, '');
    }

    /**
     * Get error message from error object
     * @param {Error} error - Error object
     * @returns {string} User-friendly error message
     */
    getErrorMessage(error) {
        if (error.message) {
            return error.message;
        }
        
        if (error.originalError?.response?.data?.message) {
            return error.originalError.response.data.message;
        }
        
        return 'An unexpected error occurred';
    }

    /**
     * Check if server is healthy
     * @returns {Promise<boolean>} True if server is healthy
     */
    async checkHealth() {
        try {
            const response = await axios.get(`${this.baseURL}/api/health`, {
                timeout: 5000,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            return response.status === 200;
        } catch (error) {
            console.log('Health check failed:', error.message);
            return false;
        }
    }

    /**
     * Start periodic health monitoring
     * @param {number} interval - Check interval in milliseconds (default: 30 seconds)
     */
    startHealthMonitoring(interval = 30000) {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
        }
        
        this.healthCheckInterval = setInterval(async () => {
            const isHealthy = await this.checkHealth();
            if (!isHealthy) {
                console.log('Periodic health check failed, redirecting to maintenance');
                this.redirectToMaintenance();
            }
        }, interval);
        
        console.log(`Health monitoring started with ${interval}ms interval`);
    }

    /**
     * Stop periodic health monitoring
     */
    stopHealthMonitoring() {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = null;
            console.log('Health monitoring stopped');
        }
    }

    /**
     * Check if an endpoint is public
     * @param {string} url - API endpoint
     * @returns {boolean} True if the endpoint is public
     */
    isPublicEndpoint(url) {
        const publicEndpoints = [
            '/api/health', 
            '/api/ping',
            '/api/auth/login',
            '/api/auth/register'
        ];
        return publicEndpoints.some(endpoint => url.includes(endpoint));
    }
}

// Create global instance
const api = new ApiService();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ApiService;
}

// Make API service globally available
window.api = new ApiService(); 