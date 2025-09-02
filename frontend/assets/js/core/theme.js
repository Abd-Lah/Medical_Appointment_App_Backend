/**
 * Theme Toggle JavaScript
 * Handles switching between light and dark themes
 */

class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    init() {
        // Set initial theme
        this.setTheme(this.currentTheme);
        
        // Add event listeners
        this.addEventListeners();
    }

    setTheme(theme) {
        // Set data attribute on html element
        document.documentElement.setAttribute('data-theme', theme);
        
        // Store in localStorage
        localStorage.setItem('theme', theme);
        
        // Update current theme
        this.currentTheme = theme;
        
        // Update toggle button icon
        this.updateToggleButton();
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }

    updateToggleButton() {
        const toggleBtn = document.getElementById('themeToggleBtn');
        if (toggleBtn) {
            const icon = toggleBtn.querySelector('i');
            if (icon) {
                if (this.currentTheme === 'dark') {
                    icon.className = 'fas fa-sun';
                    icon.title = 'Switch to Light Mode';
                } else {
                    icon.className = 'fas fa-moon';
                    icon.title = 'Switch to Dark Mode';
                }
            }
        }
    }

    addEventListeners() {
        // Listen for theme toggle button clicks
        document.addEventListener('click', (e) => {
            if (e.target.closest('#themeToggleBtn')) {
                e.preventDefault();
                this.toggleTheme();
            }
        });

        // Listen for system theme changes
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addListener((e) => {
                // Only auto-switch if user hasn't manually set a preference
                if (!localStorage.getItem('theme')) {
                    this.setTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    }

    // Get current theme
    getCurrentTheme() {
        return this.currentTheme;
    }

    // Check if dark mode is active
    isDarkMode() {
        return this.currentTheme === 'dark';
    }
}

// Initialize theme manager when DOM is loaded
let themeManager;
document.addEventListener('DOMContentLoaded', () => {
    themeManager = new ThemeManager();
});

// Global function for other modules to use
function initializeTheme() {
    if (!themeManager) {
        themeManager = new ThemeManager();
    }
    return themeManager;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeManager;
} 