/**
 * Utility Helper Functions
 * Common utility functions used across the application
 */

class HelperUtils {
    /**
     * Format date to readable string
     * @param {string|Date} date - Date to format
     * @param {string} format - Format string (default: 'MM/DD/YYYY')
     * @returns {string} Formatted date string
     */
    static formatDate(date, format = 'MM/DD/YYYY') {
        if (!date) return '';
        
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';
        
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        
        switch (format) {
            case 'MM/DD/YYYY':
                return `${month}/${day}/${year}`;
            case 'YYYY-MM-DD':
                return `${year}-${month}-${day}`;
            case 'MM/DD/YYYY HH:mm':
                return `${month}/${day}/${year} ${hours}:${minutes}`;
            case 'DD/MM/YYYY':
                return `${day}/${month}/${year}`;
            default:
                return `${month}/${day}/${year}`;
        }
    }

    /**
     * Format time to readable string
     * @param {string} time - Time string (HH:mm format)
     * @param {boolean} use12Hour - Use 12-hour format
     * @returns {string} Formatted time string
     */
    static formatTime(time, use12Hour = true) {
        if (!time) return '';
        
        const [hours, minutes] = time.split(':').map(Number);
        
        if (use12Hour) {
            const period = hours >= 12 ? 'PM' : 'AM';
            const displayHours = hours % 12 || 12;
            return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
        } else {
            return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        }
    }

    /**
     * Capitalize first letter of string
     * @param {string} str - String to capitalize
     * @returns {string} Capitalized string
     */
    static capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    /**
     * Format role name for display
     * @param {string} role - Role string
     * @returns {string} Formatted role name
     */
    static formatRole(role) {
        if (!role) return '';
        
        const roleMap = {
            'PATIENT': 'Patient',
            'DOCTOR': 'Doctor',
            'ADMIN': 'Administrator'
        };
        
        return roleMap[role] || this.capitalize(role);
    }

    /**
     * Format appointment status for display
     * @param {string} status - Status string
     * @returns {string} Formatted status name
     */
    static formatStatus(status) {
        if (!status) return '';
        
        const statusMap = {
            'PENDING': 'Pending',
            'APPROVED': 'Approved',
            'CANCELLED': 'Cancelled',
            'COMPLETED': 'Completed'
        };
        
        return statusMap[status] || this.capitalize(status);
    }

    /**
     * Get status badge class
     * @param {string} status - Status string
     * @returns {string} Bootstrap badge class
     */
    static getStatusBadgeClass(status) {
        const badgeMap = {
            'PENDING': 'badge-warning',
            'APPROVED': 'badge-success',
            'CANCELLED': 'badge-danger',
            'COMPLETED': 'badge-info'
        };
        
        return badgeMap[status] || 'badge-secondary';
    }

    /**
     * Debounce function execution
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Throttle function execution
     * @param {Function} func - Function to throttle
     * @param {number} limit - Time limit in milliseconds
     * @returns {Function} Throttled function
     */
    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Generate random ID
     * @param {number} length - Length of ID
     * @returns {string} Random ID
     */
    static generateId(length = 8) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean} True if valid email
     */
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Validate phone number format
     * @param {string} phone - Phone number to validate
     * @returns {boolean} True if valid phone number
     */
    static isValidPhone(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
    }

    /**
     * Sanitize HTML string
     * @param {string} str - String to sanitize
     * @returns {string} Sanitized string
     */
    static sanitizeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    /**
     * Truncate text to specified length
     * @param {string} text - Text to truncate
     * @param {number} length - Maximum length
     * @param {string} suffix - Suffix to add (default: '...')
     * @returns {string} Truncated text
     */
    static truncateText(text, length, suffix = '...') {
        if (!text || text.length <= length) return text;
        return text.substring(0, length) + suffix;
    }

    /**
     * Convert bytes to human readable format
     * @param {number} bytes - Bytes to convert
     * @returns {string} Human readable size
     */
    static formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Get file extension from filename
     * @param {string} filename - Filename
     * @returns {string} File extension
     */
    static getFileExtension(filename) {
        return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
    }

    /**
     * Check if file is image
     * @param {string} filename - Filename
     * @returns {boolean} True if image file
     */
    static isImageFile(filename) {
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
        const extension = this.getFileExtension(filename).toLowerCase();
        return imageExtensions.includes(extension);
    }

    /**
     * Sleep for specified milliseconds
     * @param {number} ms - Milliseconds to sleep
     * @returns {Promise} Promise that resolves after sleep
     */
    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Deep clone object
     * @param {Object} obj - Object to clone
     * @returns {Object} Cloned object
     */
    static deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (typeof obj === 'object') {
            const clonedObj = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    clonedObj[key] = this.deepClone(obj[key]);
                }
            }
            return clonedObj;
        }
    }
}

// Create global instance
const helpers = HelperUtils;

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HelperUtils;
}

window.helpers = HelperUtils; 