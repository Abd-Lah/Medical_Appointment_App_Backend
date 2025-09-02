/**
 * Notification Service
 * Handles all user notifications with modern, impressive styling
 */

class NotificationService {
    constructor() {
        this.notifications = [];
        this.container = null;
        this.init();
    }

    /**
     * Initialize notification container
     */
    init() {
        // Create notification container if it doesn't exist
        if (!document.getElementById('notification-container')) {
            this.container = document.createElement('div');
            this.container.id = 'notification-container';
            this.container.className = 'notification-container';
            document.body.appendChild(this.container);
        } else {
            this.container = document.getElementById('notification-container');
        }

        // Add CSS styles
        this.addStyles();
    }

    /**
     * Add notification styles
     */
    addStyles() {
        if (document.getElementById('notification-styles')) return;

        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                gap: 12px;
                max-width: 400px;
                pointer-events: none;
            }

            .notification {
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(10px);
                border-radius: 12px;
                padding: 16px 20px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
                border: 1px solid rgba(255, 255, 255, 0.2);
                transform: translateX(100%);
                opacity: 0;
                transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                pointer-events: auto;
                position: relative;
                overflow: hidden;
            }

            .notification.show {
                transform: translateX(0);
                opacity: 1;
            }

            .notification.hide {
                transform: translateX(100%);
                opacity: 0;
            }

            .notification::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 3px;
                background: linear-gradient(90deg, var(--notification-color), var(--notification-color-light));
            }

            .notification.success {
                --notification-color: #10b981;
                --notification-color-light: #34d399;
                border-left: 4px solid #10b981;
            }

            .notification.error {
                --notification-color: #ef4444;
                --notification-color-light: #f87171;
                border-left: 4px solid #ef4444;
            }

            .notification.warning {
                --notification-color: #f59e0b;
                --notification-color-light: #fbbf24;
                border-left: 4px solid #f59e0b;
            }

            .notification.info {
                --notification-color: #3b82f6;
                --notification-color-light: #60a5fa;
                border-left: 4px solid #3b82f6;
            }

            .notification-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 8px;
            }

            .notification-title {
                font-weight: 600;
                font-size: 14px;
                color: #1f2937;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .notification-icon {
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                background: var(--notification-color);
                color: white;
                font-size: 12px;
            }

            .notification-close {
                background: none;
                border: none;
                color: #9ca3af;
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
                transition: all 0.2s ease;
                font-size: 16px;
                line-height: 1;
            }

            .notification-close:hover {
                background: rgba(0, 0, 0, 0.05);
                color: #6b7280;
            }

            .notification-message {
                color: #4b5563;
                font-size: 13px;
                line-height: 1.4;
                margin: 0;
            }

            .notification-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                height: 2px;
                background: var(--notification-color);
                transition: width linear;
            }

            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }

            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }

            .notification.pulse {
                animation: pulse 2s infinite;
            }

            @media (max-width: 768px) {
                .notification-container {
                    top: 10px;
                    right: 10px;
                    left: 10px;
                    max-width: none;
                }
                
                .notification {
                    border-radius: 8px;
                    padding: 12px 16px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Show notification
     * @param {string} message - Notification message
     * @param {string} type - Notification type (success, error, warning, info)
     * @param {number} duration - Duration in milliseconds (0 for manual close)
     */
    show(message, type = 'info', duration = 5000) {
        const notification = this.createNotification(message, type);
        this.container.appendChild(notification);

        // Trigger animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        // Auto-remove if duration is set
        if (duration > 0) {
            this.startProgress(notification, duration);
            setTimeout(() => {
                this.remove(notification);
            }, duration);
        }

        // Add to notifications array
        this.notifications.push(notification);

        return notification;
    }

    /**
     * Create notification element
     * @param {string} message - Notification message
     * @param {string} type - Notification type
     * @returns {HTMLElement} Notification element
     */
    createNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;

        const icon = this.getIcon(type);
        const title = this.getTitle(type);

        notification.innerHTML = `
            <div class="notification-header">
                <div class="notification-title">
                    <div class="notification-icon">
                        <i class="${icon}"></i>
                    </div>
                    ${title}
                </div>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <p class="notification-message">${message}</p>
            <div class="notification-progress"></div>
        `;

        return notification;
    }

    /**
     * Get icon for notification type
     * @param {string} type - Notification type
     * @returns {string} Icon class
     */
    getIcon(type) {
        const icons = {
            success: 'fas fa-check',
            error: 'fas fa-exclamation-triangle',
            warning: 'fas fa-exclamation-circle',
            info: 'fas fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    /**
     * Get title for notification type
     * @param {string} type - Notification type
     * @returns {string} Title
     */
    getTitle(type) {
        const titles = {
            success: 'Success',
            error: 'Error',
            warning: 'Warning',
            info: 'Information'
        };
        return titles[type] || titles.info;
    }

    /**
     * Start progress bar
     * @param {HTMLElement} notification - Notification element
     * @param {number} duration - Duration in milliseconds
     */
    startProgress(notification, duration) {
        const progress = notification.querySelector('.notification-progress');
        if (progress) {
            progress.style.width = '100%';
            progress.style.transition = `width ${duration}ms linear`;
            setTimeout(() => {
                progress.style.width = '0%';
            }, 10);
        }
    }

    /**
     * Remove notification
     * @param {HTMLElement} notification - Notification element
     */
    remove(notification) {
        if (notification && notification.parentNode) {
            notification.classList.add('hide');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
                const index = this.notifications.indexOf(notification);
                if (index > -1) {
                    this.notifications.splice(index, 1);
                }
            }, 400);
        }
    }

    /**
     * Show success notification
     * @param {string} message - Notification message
     * @param {number} duration - Duration in milliseconds
     */
    success(message, duration = 5000) {
        return this.show(message, 'success', duration);
    }

    /**
     * Show error notification
     * @param {string} message - Notification message
     * @param {number} duration - Duration in milliseconds
     */
    error(message, duration = 7000) {
        return this.show(message, 'error', duration);
    }

    /**
     * Show warning notification
     * @param {string} message - Notification message
     * @param {number} duration - Duration in milliseconds
     */
    warning(message, duration = 6000) {
        return this.show(message, 'warning', duration);
    }

    /**
     * Show info notification
     * @param {string} message - Notification message
     * @param {number} duration - Duration in milliseconds
     */
    info(message, duration = 5000) {
        return this.show(message, 'info', duration);
    }

    /**
     * Clear all notifications
     */
    clear() {
        this.notifications.forEach(notification => {
            this.remove(notification);
        });
    }

    /**
     * Show loading notification
     * @param {string} message - Loading message
     * @returns {HTMLElement} Notification element
     */
    loading(message = 'Loading...') {
        const notification = this.createNotification(message, 'info');
        notification.classList.add('pulse');
        notification.querySelector('.notification-icon i').className = 'fas fa-spinner fa-spin';
        this.container.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        this.notifications.push(notification);
        return notification;
    }
}

// Initialize notification service when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.notificationService = new NotificationService();
});

// Global function for other modules to use
function showNotification(message, type = 'info', duration = 5000) {
    if (!window.notificationService) {
        window.notificationService = new NotificationService();
    }
    return window.notificationService.show(message, type, duration);
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationService;
} 