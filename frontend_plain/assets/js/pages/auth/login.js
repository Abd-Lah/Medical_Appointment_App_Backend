/**
 * Login Page JavaScript
 * Handles login form functionality and validation
 */

class LoginPage {
    constructor() {
        this.form = document.getElementById('loginForm');
        this.emailInput = document.getElementById('email');
        this.passwordInput = document.getElementById('password');
        this.submitBtn = document.getElementById('loginBtn');
        this.loginText = document.getElementById('loginText');
        this.loginSpinner = document.getElementById('loginSpinner');
        
        this.init();
    }

    /**
     * Initialize login page
     */
    init() {
        this.setupEventListeners();
        this.checkAuthStatus();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Real-time validation
        if (this.emailInput) {
            this.emailInput.addEventListener('blur', () => this.validateEmail());
            this.emailInput.addEventListener('input', () => this.clearEmailError());
        }

        if (this.passwordInput) {
            this.passwordInput.addEventListener('blur', () => this.validatePassword());
            this.passwordInput.addEventListener('input', () => this.clearPasswordError());
        }
    }

    /**
     * Check if user is already authenticated
     */
    checkAuthStatus() {
        // Use synchronous check to avoid async issues
        if (authService.hasValidAuthData()) {
            const user = authService.getUser();
            authService.redirectByRole(user);
        }
    }

    /**
     * Handle login form submission
     * @param {Event} e - Form submit event
     */
    async handleLogin(e) {
        e.preventDefault();

        if (!this.validateForm()) {
            return;
        }

        this.setLoading(true);

        try {
            const credentials = {
                email: this.emailInput.value.trim(),
                password: this.passwordInput.value
            };

            const user = await authService.login(credentials);
            
            notificationService.success('Login successful! Redirecting...', 2000);
            
            // Redirect based on user role
            setTimeout(() => {
                authService.redirectByRole(user);
            }, 1000);

        } catch (error) {
            console.error('Login error:', error);
            
            let errorMessage = 'Login failed. Please try again.';
            
            if (error.response?.status === 401) {
                errorMessage = 'Invalid email or password.';
            } else if (error.response?.status === 422) {
                errorMessage = 'Please check your input and try again.';
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            notificationService.error(errorMessage);
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Validate entire form
     * @returns {boolean} True if form is valid
     */
    validateForm() {
        const isEmailValid = this.validateEmail();
        const isPasswordValid = this.validatePassword();
        
        return isEmailValid && isPasswordValid;
    }

    /**
     * Validate email field
     * @returns {boolean} True if email is valid
     */
    validateEmail() {
        const email = this.emailInput.value.trim();
        
        if (!email) {
            this.showEmailError('Email is required');
            return false;
        }
        
        if (!helpers.isValidEmail(email)) {
            this.showEmailError('Please enter a valid email address');
            return false;
        }
        
        this.clearEmailError();
        return true;
    }

    /**
     * Validate password field
     * @returns {boolean} True if password is valid
     */
    validatePassword() {
        const password = this.passwordInput.value;
        
        if (!password) {
            this.showPasswordError('Password is required');
            return false;
        }
        
        if (password.length < 6) {
            this.showPasswordError('Password must be at least 6 characters');
            return false;
        }
        
        this.clearPasswordError();
        return true;
    }

    /**
     * Show email error message
     * @param {string} message - Error message
     */
    showEmailError(message) {
        this.clearEmailError();
        const errorDiv = document.getElementById('emailError');
        errorDiv.textContent = message;
        this.emailInput.classList.add('is-invalid');
    }

    /**
     * Clear email error message
     */
    clearEmailError() {
        const errorDiv = document.getElementById('emailError');
        errorDiv.textContent = '';
        this.emailInput.classList.remove('is-invalid');
    }

    /**
     * Show password error message
     * @param {string} message - Error message
     */
    showPasswordError(message) {
        this.clearPasswordError();
        const errorDiv = document.getElementById('passwordError');
        errorDiv.textContent = message;
        this.passwordInput.classList.add('is-invalid');
    }

    /**
     * Clear password error message
     */
    clearPasswordError() {
        const errorDiv = document.getElementById('passwordError');
        errorDiv.textContent = '';
        this.passwordInput.classList.remove('is-invalid');
    }

    /**
     * Set loading state
     * @param {boolean} loading - Loading state
     */
    setLoading(loading) {
        if (loading) {
            this.submitBtn.disabled = true;
            this.loginText.classList.add('d-none');
            this.loginSpinner.classList.remove('d-none');
        } else {
            this.submitBtn.disabled = false;
            this.loginText.classList.remove('d-none');
            this.loginSpinner.classList.add('d-none');
        }
    }
}

// Initialize login page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LoginPage();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LoginPage;
}

// Prevent any global session/auth check from running on login or register page
const currentPath = window.location.pathname;
if (currentPath.includes('login.html') || currentPath.includes('register.html')) {
    // Do not run any session check or redirect logic here
    // Only run login form logic below
} else {
    // If you have any global session check, it should go here (not on login page)
} 