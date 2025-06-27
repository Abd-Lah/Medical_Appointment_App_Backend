/**
 * Authentication Module
 * Handles login, logout, and user session management
 */

class AuthService {
    constructor() {
        this.tokenKey = 'token';
        this.userKey = 'user';
    }

    /**
     * Get stored authentication token
     * @returns {string|null} The stored token or null
     */
    getToken() {
        return localStorage.getItem(this.tokenKey);
    }

    /**
     * Get stored user data
     * @returns {Object|null} The stored user object or null
     */
    getUser() {
        const userData = localStorage.getItem(this.userKey);
        return userData ? JSON.parse(userData) : null;
    }

    /**
     * Store authentication data
     * @param {string} token - JWT token
     * @param {Object} user - User data object
     */
    setAuth(token, user) {
        localStorage.setItem(this.tokenKey, token);
        localStorage.setItem(this.userKey, JSON.stringify(user));
    }

    /**
     * Clear authentication data
     */
    clearAuth() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
    }

    /**
     * Check if JWT is expired by decoding it
     * @returns {boolean} True if JWT is expired
     */
    isTokenExpired() {
        const token = this.getToken();
        if (!token) return true;
        
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (!payload.exp) return false;
            const now = Math.floor(Date.now() / 1000);
            return payload.exp < now;
        } catch (e) {
            // Error decoding token
            return true;
        }
    }

    /**
     * Validate token with backend
     * @returns {Promise<boolean>} True if token is valid
     */
    async validateTokenWithBackend() {
        const token = this.getToken();
        if (!token) {
            // No token to validate
            return false;
        }

        try {
            // Validating token with backend
            // Make a simple API call to validate token
            const response = await api.get('/api/user');
            // Token validation response
            return response.status === 200;
        } catch (error) {
            // Token validation failed
            // Don't clear auth on network errors, only on auth errors
            if (error.response && error.response.status === 401) {
                // Token is invalid (401), clearing auth
                this.clearAuth();
            }
            return false;
        }
    }

    /**
     * Check if user is authenticated (both token exists and is valid)
     * @returns {Promise<boolean>} True if user is properly authenticated
     */
    async isAuthenticated() {
        const token = this.getToken();
        const user = this.getUser();
        
        // Check if token and user exist
        if (!token || !user) {
            // No token or user data found
            return false;
        }

        // Check if token is expired
        if (this.isTokenExpired()) {
            // Token is expired, clearing auth
            this.clearAuth();
            return false;
        }

        // Only validate with backend if we're not already on login/register pages
        const currentPath = window.location.pathname;
        if (currentPath.includes('login.html') || currentPath.includes('register.html')) {
            // On auth page, skipping backend validation to prevent recursion
            return false; // Don't consider authenticated on auth pages to prevent recursion
        }

        // Validate token with backend
        // Validating token with backend
        const isValid = await this.validateTokenWithBackend();
        if (!isValid) {
            // Token validation failed, clearing auth
            this.clearAuth();
            return false;
        }

        // Token validation successful
        return true;
    }

    /**
     * Check if user is authenticated synchronously (for immediate checks)
     * @returns {boolean} True if user appears to be authenticated
     */
    isAuthenticatedSync() {
        const token = this.getToken();
        const user = this.getUser();
        
        if (!token || !user) {
            return false;
        }

        // Only check expiration synchronously
        if (this.isTokenExpired()) {
            this.clearAuth();
            return false;
        }

        return true;
    }

    /**
     * Check if user has valid auth data (for auth pages)
     * @returns {boolean} True if user has valid auth data
     */
    hasValidAuthData() {
        const token = this.getToken();
        const user = this.getUser();
        
        if (!token || !user) {
            console.log('No valid auth data found');
            return false;
        }

        // Only check expiration
        if (this.isTokenExpired()) {
            console.log('Token expired, clearing auth');
            this.clearAuth();
            return false;
        }

        console.log('Valid auth data found');
        return true;
    }

    /**
     * Handle user login
     * @param {Object} credentials - Login credentials
     * @returns {Promise} Promise that resolves with user data
     */
    async login(credentials) {
        try {
            console.log('Attempting login with credentials:', { email: credentials.email });
            
            const response = await api.post('/api/auth/login', credentials);
            console.log('Login response received:', response.data);
            
            const responseData = response.data;
            
            // Check if we have the required fields
            if (!responseData.token) {
                console.error('No token in response:', responseData);
                throw new Error('No token received from server');
            }

            // Create user object from response data
            const user = {
                email: responseData.email,
                firstName: responseData.firstName,
                lastName: responseData.lastName,
                phoneNumber: responseData.phoneNumber,
                role: responseData.role,
                name: `${responseData.firstName || ''} ${responseData.lastName || ''}`.trim() || responseData.email
            };

            console.log('Created user object:', user);
            this.setAuth(responseData.token, user);
            return user;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    }

    /**
     * Handle user registration
     * @param {Object} userData - Registration data
     * @returns {Promise} Promise that resolves with user data
     */
    async register(userData) {
        try {
            const response = await api.post('/api/auth/register', userData);
            return response.data;
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    }

    /**
     * Handle user logout
     */
    logout() {
        console.log('Logging out...');
        this.clearAuth();
        this.redirectToLogin();
    }

    /**
     * Force user logout
     */
    forceLogout() {
        console.log('Force logging out...');
        this.clearAuth();
        this.redirectToLogin();
    }

    /**
     * Redirect to login with proper path resolution
     */
    redirectToLogin() {
        // Debug path resolution
        this.debugPaths();
        
        // Get the current location to determine the correct path
        const currentPath = window.location.pathname;
        
        // Determine the correct path to login
        let loginPath;
        
        if (currentPath.includes('/pages/auth/')) {
            // Already in auth directory, just go to login
            loginPath = 'login.html';
        } else if (currentPath.includes('/pages/')) {
            // In pages subdirectory (like /pages/patient/), go to auth/login
            loginPath = '../auth/login.html';
        } else {
            // At root level, go to pages/auth/login
            loginPath = './pages/auth/login.html';
        }
        
        console.log('Redirecting to login:', loginPath);
        window.location.href = loginPath;
    }

    /**
     * Redirect user based on role
     * @param {Object} user - User object with role
     */
    redirectByRole(user) {
        if (!user || !user.role) {
            console.error('Invalid user data for role-based redirect');
            this.redirectToDashboard();
            return;
        }

        switch (user.role) {
            case 'DOCTOR':
                this.redirectToDoctorDashboard();
                break;
            case 'ADMIN':
                this.redirectToAdminDashboard();
                break;
            case 'PATIENT':
            default:
                this.redirectToDashboard();
                break;
        }
    }

    /**
     * Redirect to dashboard with proper path resolution
     */
    redirectToDashboard() {
        // Patient dashboard
        const currentPath = window.location.pathname;
        let dashboardPath;
        
        if (currentPath.includes('/pages/auth/')) {
            dashboardPath = '../../pages/patient/dashboard.html';
        } else if (currentPath.includes('/pages/')) {
            dashboardPath = '../pages/patient/dashboard.html';
        } else {
            dashboardPath = './pages/patient/dashboard.html';
        }
        
        console.log('Redirecting to patient dashboard:', dashboardPath);
        window.location.href = dashboardPath;
    }

    redirectToDoctorDashboard() {
        const currentPath = window.location.pathname;
        let dashboardPath;
        
        if (currentPath.includes('/pages/auth/')) {
            dashboardPath = '../../pages/doctor/dashboard.html';
        } else if (currentPath.includes('/pages/')) {
            dashboardPath = '../pages/doctor/dashboard.html';
        } else {
            dashboardPath = './pages/doctor/dashboard.html';
        }
        
        console.log('Redirecting to doctor dashboard:', dashboardPath);
        window.location.href = dashboardPath;
    }

    redirectToAdminDashboard() {
        const currentPath = window.location.pathname;
        let dashboardPath;
        
        if (currentPath.includes('/pages/auth/')) {
            dashboardPath = '../../pages/admin/dashboard.html';
        } else if (currentPath.includes('/pages/')) {
            dashboardPath = '../pages/admin/dashboard.html';
        } else {
            dashboardPath = './pages/admin/dashboard.html';
        }
        
        console.log('Redirecting to admin dashboard:', dashboardPath);
        window.location.href = dashboardPath;
    }

    /**
     * Check authentication and redirect if needed
     * @param {string} redirectTo - Where to redirect if not authenticated
     */
    async requireAuth(redirectTo = './pages/auth/login.html') {
        console.log('Checking authentication...');
        
        // Check if we have valid auth data (token and user)
        if (!this.isAuthenticatedSync()) {
            console.log('Not authenticated (sync check), redirecting to:', redirectTo);
            window.location.href = redirectTo;
            return false;
        }

        // For protected pages, we'll do a light backend validation
        // but be more lenient to prevent redirect loops
        const currentPath = window.location.pathname;
        if (!currentPath.includes('login.html') && !currentPath.includes('register.html')) {
            try {
                // Quick backend validation with timeout
                const isValid = await this.validateTokenWithBackend();
                if (!isValid) {
                    console.log('Backend validation failed, but continuing with local auth to prevent loops');
                    // Don't redirect immediately, let the user stay on the page
                    // The API calls will handle auth errors individually
                }
            } catch (error) {
                console.log('Backend validation error, but continuing with local auth:', error.message);
                // If backend validation fails, we'll still allow access based on local token
                // This prevents redirect loops when server is temporarily unavailable
            }
        }

        console.log('Authentication check passed');
        return true;
    }

    /**
     * Check if user has specific role
     * @param {string} role - Role to check
     * @returns {boolean} True if user has the role
     */
    hasRole(role) {
        const user = this.getUser();
        return user && user.role === role;
    }

    /**
     * Debug method to log current path and calculated redirect paths
     */
    debugPaths() {
        const currentPath = window.location.pathname;
        console.log('=== Path Debug Info ===');
        console.log('Current path:', currentPath);
        console.log('Current URL:', window.location.href);
        
        // Test login redirect
        let loginPath;
        if (currentPath.includes('/pages/auth/')) {
            loginPath = 'login.html';
        } else if (currentPath.includes('/pages/')) {
            loginPath = '../auth/login.html';
        } else {
            loginPath = './pages/auth/login.html';
        }
        console.log('Calculated login path:', loginPath);
        
        // Test dashboard redirects
        const user = this.getUser();
        if (user) {
            console.log('User role:', user.role);
            switch (user.role) {
                case 'PATIENT':
                    let patientPath;
                    if (currentPath.includes('/pages/auth/')) {
                        patientPath = '../../pages/patient/dashboard.html';
                    } else if (currentPath.includes('/pages/')) {
                        patientPath = '../pages/patient/dashboard.html';
                    } else {
                        patientPath = './pages/patient/dashboard.html';
                    }
                    console.log('Calculated patient dashboard path:', patientPath);
                    break;
                case 'DOCTOR':
                    let doctorPath;
                    if (currentPath.includes('/pages/auth/')) {
                        doctorPath = '../../pages/doctor/dashboard.html';
                    } else if (currentPath.includes('/pages/')) {
                        doctorPath = '../pages/doctor/dashboard.html';
                    } else {
                        doctorPath = './pages/doctor/dashboard.html';
                    }
                    console.log('Calculated doctor dashboard path:', doctorPath);
                    break;
                case 'ADMIN':
                    let adminPath;
                    if (currentPath.includes('/pages/auth/')) {
                        adminPath = '../../pages/admin/dashboard.html';
                    } else if (currentPath.includes('/pages/')) {
                        adminPath = '../pages/admin/dashboard.html';
                    } else {
                        adminPath = './pages/admin/dashboard.html';
                    }
                    console.log('Calculated admin dashboard path:', adminPath);
                    break;
            }
        }
        console.log('=== End Debug Info ===');
    }
}

// Create global instance
const authService = new AuthService();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthService;
} 