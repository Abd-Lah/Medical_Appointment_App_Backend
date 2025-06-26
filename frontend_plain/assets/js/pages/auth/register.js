/**
 * Register Page JavaScript
 * Handles registration form functionality and validation
 */

class RegisterPage {
    constructor() {
        this.form = document.getElementById('registerForm');
        this.firstNameInput = document.getElementById('firstName');
        this.lastNameInput = document.getElementById('lastName');
        this.emailInput = document.getElementById('email');
        this.phoneInput = document.getElementById('phone');
        this.cityInput = document.getElementById('city');
        this.passwordInput = document.getElementById('password');
        this.confirmPasswordInput = document.getElementById('confirmPassword');
        this.roleInput = document.getElementById('role');
        this.submitBtn = document.getElementById('registerBtn');
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleRegister(e));
        }
        if (this.emailInput) {
            this.emailInput.addEventListener('blur', () => this.validateEmail());
            this.emailInput.addEventListener('input', () => this.clearEmailError());
        }
        if (this.passwordInput) {
            this.passwordInput.addEventListener('blur', () => this.validatePassword());
            this.passwordInput.addEventListener('input', () => this.clearPasswordError());
        }
        if (this.confirmPasswordInput) {
            this.confirmPasswordInput.addEventListener('blur', () => this.validateConfirmPassword());
            this.confirmPasswordInput.addEventListener('input', () => this.clearConfirmPasswordError());
        }
        if (this.firstNameInput) {
            this.firstNameInput.addEventListener('blur', () => this.validateFirstName());
            this.firstNameInput.addEventListener('input', () => this.clearFirstNameError());
        }
        if (this.lastNameInput) {
            this.lastNameInput.addEventListener('blur', () => this.validateLastName());
            this.lastNameInput.addEventListener('input', () => this.clearLastNameError());
        }
        if (this.roleInput) {
            this.roleInput.addEventListener('change', () => this.clearRoleError());
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        if (!this.validateForm()) {
            return;
        }
        this.setLoading(true);
        try {
            const userData = {
                firstName: this.firstNameInput.value.trim(),
                lastName: this.lastNameInput.value.trim(),
                email: this.emailInput.value.trim(),
                phoneNumber: this.phoneInput.value.trim(),
                city: this.cityInput.value.trim(),
                password: this.passwordInput.value,
                role: this.roleInput.value
            };
            const userResponse = await authService.register(userData);
            // Store token and user info for immediate access
            authService.setAuth(userResponse.token, userResponse);
            notificationService.success('Registration successful! Redirecting...', 2000);
            setTimeout(() => {
                authService.redirectByRole(userResponse);
            }, 1200);
        } catch (error) {
            let errorMessage = 'Registration failed. Please try again.';
            if (error.status === 409) {
                errorMessage = 'Email already exists.';
            } else if (error.status === 422) {
                errorMessage = 'Please check your input and try again.';
            } else if (error.message) {
                errorMessage = error.message;
            }
            notificationService.error(errorMessage);
        } finally {
            this.setLoading(false);
        }
    }

    validateForm() {
        const isFirstNameValid = this.validateFirstName();
        const isLastNameValid = this.validateLastName();
        const isEmailValid = this.validateEmail();
        const isPhoneValid = this.validatePhone();
        const isCityValid = this.validateCity();
        const isPasswordValid = this.validatePassword();
        const isConfirmPasswordValid = this.validateConfirmPassword();
        const isRoleValid = this.validateRole();
        return isFirstNameValid && isLastNameValid && isEmailValid && isPhoneValid && isCityValid && isPasswordValid && isConfirmPasswordValid && isRoleValid;
    }

    validateFirstName() {
        const firstName = this.firstNameInput.value.trim();
        if (!firstName) {
            this.showFirstNameError('First name is required');
            return false;
        }
        this.clearFirstNameError();
        return true;
    }
    showFirstNameError(message) {
        this.clearFirstNameError();
        const errorDiv = document.getElementById('firstNameError');
        if (errorDiv) {
            errorDiv.textContent = message;
            this.firstNameInput.classList.add('is-invalid');
        }
    }
    clearFirstNameError() {
        const errorDiv = document.getElementById('firstNameError');
        if (errorDiv) errorDiv.textContent = '';
        this.firstNameInput.classList.remove('is-invalid');
    }

    validateLastName() {
        const lastName = this.lastNameInput.value.trim();
        if (!lastName) {
            this.showLastNameError('Last name is required');
            return false;
        }
        this.clearLastNameError();
        return true;
    }
    showLastNameError(message) {
        this.clearLastNameError();
        const errorDiv = document.getElementById('lastNameError');
        if (errorDiv) {
            errorDiv.textContent = message;
            this.lastNameInput.classList.add('is-invalid');
        }
    }
    clearLastNameError() {
        const errorDiv = document.getElementById('lastNameError');
        if (errorDiv) errorDiv.textContent = '';
        this.lastNameInput.classList.remove('is-invalid');
    }

    validatePhone() {
        const phone = this.phoneInput.value.trim();
        if (!phone) {
            this.showPhoneError('Phone number is required');
            return false;
        }
        this.clearPhoneError();
        return true;
    }
    showPhoneError(message) {
        this.clearPhoneError();
        const errorDiv = document.getElementById('phoneError');
        if (errorDiv) {
            errorDiv.textContent = message;
            this.phoneInput.classList.add('is-invalid');
        }
    }
    clearPhoneError() {
        const errorDiv = document.getElementById('phoneError');
        if (errorDiv) errorDiv.textContent = '';
        this.phoneInput.classList.remove('is-invalid');
    }

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
    showEmailError(message) {
        this.clearEmailError();
        const errorDiv = document.createElement('div');
        errorDiv.className = 'form-error';
        errorDiv.id = 'emailError';
        errorDiv.textContent = message;
        this.emailInput.parentNode.appendChild(errorDiv);
        this.emailInput.classList.add('is-invalid');
    }
    clearEmailError() {
        const errorDiv = document.getElementById('emailError');
        if (errorDiv) errorDiv.remove();
        this.emailInput.classList.remove('is-invalid');
    }

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
    showPasswordError(message) {
        this.clearPasswordError();
        const errorDiv = document.createElement('div');
        errorDiv.className = 'form-error';
        errorDiv.id = 'passwordError';
        errorDiv.textContent = message;
        this.passwordInput.parentNode.appendChild(errorDiv);
        this.passwordInput.classList.add('is-invalid');
    }
    clearPasswordError() {
        const errorDiv = document.getElementById('passwordError');
        if (errorDiv) errorDiv.remove();
        this.passwordInput.classList.remove('is-invalid');
    }

    validateConfirmPassword() {
        const password = this.passwordInput.value;
        const confirmPassword = this.confirmPasswordInput.value;
        if (!confirmPassword) {
            this.showConfirmPasswordError('Please confirm your password');
            return false;
        }
        if (password !== confirmPassword) {
            this.showConfirmPasswordError('Passwords do not match');
            return false;
        }
        this.clearConfirmPasswordError();
        return true;
    }
    showConfirmPasswordError(message) {
        this.clearConfirmPasswordError();
        const errorDiv = document.createElement('div');
        errorDiv.className = 'form-error';
        errorDiv.id = 'confirmPasswordError';
        errorDiv.textContent = message;
        this.confirmPasswordInput.parentNode.appendChild(errorDiv);
        this.confirmPasswordInput.classList.add('is-invalid');
    }
    clearConfirmPasswordError() {
        const errorDiv = document.getElementById('confirmPasswordError');
        if (errorDiv) errorDiv.remove();
        this.confirmPasswordInput.classList.remove('is-invalid');
    }

    validateRole() {
        const role = this.roleInput.value;
        if (!role) {
            this.showRoleError('Please select a role');
            return false;
        }
        this.clearRoleError();
        return true;
    }
    showRoleError(message) {
        this.clearRoleError();
        const errorDiv = document.createElement('div');
        errorDiv.className = 'form-error';
        errorDiv.id = 'roleError';
        errorDiv.textContent = message;
        this.roleInput.parentNode.appendChild(errorDiv);
        this.roleInput.classList.add('is-invalid');
    }
    clearRoleError() {
        const errorDiv = document.getElementById('roleError');
        if (errorDiv) errorDiv.remove();
        this.roleInput.classList.remove('is-invalid');
    }

    validateCity() {
        const city = this.cityInput.value.trim();
        if (!city) {
            this.showCityError('City is required');
            return false;
        }
        this.clearCityError();
        return true;
    }
    showCityError(message) {
        this.clearCityError();
        const errorDiv = document.getElementById('cityError');
        if (errorDiv) {
            errorDiv.textContent = message;
            this.cityInput.classList.add('is-invalid');
        }
    }
    clearCityError() {
        const errorDiv = document.getElementById('cityError');
        if (errorDiv) errorDiv.textContent = '';
        this.cityInput.classList.remove('is-invalid');
    }

    setLoading(loading) {
        if (this.submitBtn) {
            this.submitBtn.disabled = loading;
            this.submitBtn.innerHTML = loading ?
                '<span class="spinner"></span> Signing up...' :
                '<i class="fas fa-user-plus me-2"></i>Sign Up';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new RegisterPage();
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = RegisterPage;
} 