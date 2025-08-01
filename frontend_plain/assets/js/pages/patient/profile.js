/**
 * Profile Page JavaScript
 * Handles profile loading, updating, image upload with CropperJS, and form validation
 */

class ProfilePage {
    constructor() {
        this.user = authService.getUser();
        this.cropper = null;
        this.currentFile = null;
        this.citySelector = null;
        
        this.init();
    }

    async init() {
        // Require authentication
        const isAuth = await authService.requireAuth('../../pages/auth/login.html');
        if (!isAuth) return;
        
        this.setupEventListeners();
        this.setActiveNavLink();
        this.initializeCitySelector();
        this.loadUserData();
    }

    initializeCitySelector() {
        // Initialize city selector
        this.citySelector = new CitySelector('citySelectorContainer', {
            placeholder: 'Search for a city...',
            noResultsText: 'No cities found',
            minSearchLength: 1,
            maxResults: 10
        });
    }

    setupEventListeners() {
        // Form submission
        document.getElementById('profileForm').addEventListener('submit', (e) => this.handleProfileUpdate(e));
        
        // Avatar upload
        document.getElementById('avatarUpload').addEventListener('click', () => {
            document.getElementById('fileInput').click();
        });
        
        // File input change
        document.getElementById('fileInput').addEventListener('change', (e) => this.handleFileSelect(e));
        
        // Cropper actions
        document.getElementById('cancelCrop').addEventListener('click', () => this.cancelCrop());
        document.getElementById('cropImage').addEventListener('click', () => this.saveCrop());
        
        // Settings buttons
        document.getElementById('changePasswordBtn').addEventListener('click', () => this.showChangePasswordModal());
        document.getElementById('deleteAccountBtn').addEventListener('click', () => this.showDeleteAccountModal());
        
        // Modal forms
        document.getElementById('changePasswordForm').addEventListener('submit', (e) => this.handlePasswordChange(e));
        document.getElementById('deleteAccountForm').addEventListener('submit', (e) => this.handleAccountDeletion(e));
        
        // Modal close events for proper focus management
        document.getElementById('changePasswordModal').addEventListener('hidden.bs.modal', () => {
            document.getElementById('changePasswordBtn').focus();
        });
        
        document.getElementById('deleteAccountModal').addEventListener('hidden.bs.modal', () => {
            document.getElementById('deleteAccountBtn').focus();
        });
        
        // Logout
        document.getElementById('logoutBtn').addEventListener('click', (e) => {
            e.preventDefault();
            authService.logout();
        });
    }

    async loadUserData() {
        try {
            const response = await api.get('/api/user');
            const userData = response.data;
            this.populateForm(userData);
            this.updateProfileDisplay(userData);
        } catch (error) {
            // Handle error silently
        }
    }

    populateForm(userData) {
        document.getElementById('firstName').value = userData.firstName || '';
        document.getElementById('lastName').value = userData.lastName || '';
        document.getElementById('email').value = userData.email || '';
        document.getElementById('phone').value = userData.phoneNumber || '';
        
        // Set city value in the city selector with validation
        if (this.citySelector && userData.city) {
            // Wait for city selector to be fully initialized
            const checkReady = () => {
                if (this.citySelector.isReady) {
                    const success = this.citySelector.setValue(userData.city);
                    if (!success) {
                        // If the city from database is not in our list, clear it and show warning
                        this.citySelector.clear();
                    }
                } else {
                    // Check again in 50ms
                    setTimeout(checkReady, 50);
                }
            };
            checkReady();
        }
    }

    updateProfileDisplay(userData) {
        const fullName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Patient';
        document.getElementById('profileName').textContent = fullName;
        document.getElementById('profileRole').textContent = 'Patient';
        
        // Update profile image
        const profileImage = document.getElementById('profileImage');
        if (userData.profilePictureUrl && userData.profilePictureUrl !== '') {
            profileImage.src = userData.profilePictureUrl;
        } else {
            profileImage.src = '/assets/images/default-avatar.png';
        }
    }

    async handleProfileUpdate(e) {
        e.preventDefault();
        const saveBtn = document.getElementById('saveBtn');
        const originalText = saveBtn.innerHTML;
        try {
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<span class="spinner"></span>Saving...';
            
            // Validate city first
            if (this.citySelector) {
                const cityError = this.citySelector.getValidationError();
                if (cityError) {
                    this.citySelector.showValidationError(cityError);
                    return;
                }
                this.citySelector.clearValidation();
            }
            
            const formData = {
                firstName: document.getElementById('firstName').value.trim(),
                lastName: document.getElementById('lastName').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                city: this.citySelector ? this.citySelector.getValue() : ''
            };

            // Validate required fields
            const requiredFields = ['firstName', 'lastName', 'phone', 'city'];
            for (const field of requiredFields) {
                if (!formData[field]) {
                    notificationService.error(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
                    return;
                }
            }

            const response = await api.put('/api/user/update_profile', formData);
            authService.setAuth(localStorage.getItem('token'), response.data);
            notificationService.success('Profile updated successfully!');
            this.updateProfileDisplay(response.data);
        } catch (error) {
            notificationService.error(api.getErrorMessage(error));
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = originalText;
        }
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!helpers.isImageFile(file.name)) {
            notificationService.error('Please select a valid image file (JPG, PNG, GIF, etc.)');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            notificationService.error('File size must be less than 5MB');
            return;
        }

        this.currentFile = file;
        this.showCropper(file);
    }

    showCropper(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const cropperArea = document.getElementById('cropperArea');
            // Clear any existing content
            cropperArea.innerHTML = '';
            
            // Create and add the image with proper styling
            const img = document.createElement('img');
            img.id = 'cropperImage';
            img.src = e.target.result;
            img.style.maxWidth = '100%';
            img.style.maxHeight = '100%';
            img.style.display = 'block';
            img.style.opacity = '1';
            img.style.width = 'auto';
            img.style.height = 'auto';
            
            cropperArea.appendChild(img);
            
            // Show the modal
            document.getElementById('cropperModal').style.display = 'flex';
            
            // Wait a bit for the image to load, then initialize cropper
            setTimeout(() => {
                const image = document.getElementById('cropperImage');
                if (image && image.complete) {
                    this.initializeCropper(image);
                } else {
                    image.onload = () => this.initializeCropper(image);
                }
            }, 100);
        };
        reader.readAsDataURL(file);
    }

    initializeCropper(image) {
        // Destroy existing cropper if any
        if (this.cropper) {
            this.cropper.destroy();
        }
        
        // Initialize new cropper with better settings
        this.cropper = new Cropper(image, {
            aspectRatio: 1,
            viewMode: 2, // Changed to 2 for better visibility
            dragMode: 'move',
            autoCropArea: 0.8, // Show 80% of the image initially
            restore: false,
            guides: true,
            center: true,
            highlight: true, // Enable highlight for better visibility
            cropBoxMovable: true,
            cropBoxResizable: true,
            toggleDragModeOnDblclick: false,
            background: true, // Show background
            modal: true, // Show modal overlay
            zoomable: true, // Allow zooming
            zoomOnWheel: true, // Zoom on mouse wheel
            wheelZoomRatio: 0.1, // Zoom ratio
            ready: function() {
                // Cropper is ready
            }
        });
    }

    cancelCrop() {
        this.hideCropper();
        document.getElementById('fileInput').value = '';
        this.currentFile = null;
    }

    async saveCrop() {
        if (!this.cropper) return;

        try {
            const canvas = this.cropper.getCroppedCanvas({
                width: 400,
                height: 400,
                imageSmoothingEnabled: true,
                imageSmoothingQuality: 'high'
            });

            canvas.toBlob(async (blob) => {
                const file = new File([blob], 'profile-picture.jpg', { type: 'image/jpeg' });
                await this.uploadProfilePicture(file);
            }, 'image/jpeg', 0.9);
        } catch (error) {
            notificationService.error('Error processing image');
        }
    }

    async uploadProfilePicture(file) {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await api.post('/api/files/upload-profile-picture', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Update profile image display
            document.getElementById('profileImage').src = response.data.profilePictureUrl;
            notificationService.success('Profile picture updated successfully!');
            this.hideCropper();
        } catch (error) {
            // Handle error silently
        }
    }

    hideCropper() {
        if (this.cropper) {
            this.cropper.destroy();
            this.cropper = null;
        }
        document.getElementById('cropperModal').style.display = 'none';
        document.getElementById('fileInput').value = '';
    }

    setActiveNavLink() {
        const currentPage = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            if (link.getAttribute('href') && currentPage.includes(link.getAttribute('href'))) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // Password Change Methods
    showChangePasswordModal() {
        const modal = new bootstrap.Modal(document.getElementById('changePasswordModal'));
        modal.show();
        
        // Clear form
        document.getElementById('changePasswordForm').reset();
        
        // Focus on first input after modal is shown
        setTimeout(() => {
            document.getElementById('currentPassword').focus();
        }, 150);
    }

    async handlePasswordChange(e) {
        e.preventDefault();
        
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmNewPassword = document.getElementById('confirmNewPassword').value;
        
        // Validation
        if (!currentPassword || !newPassword || !confirmNewPassword) {
            notificationService.error('All fields are required');
            return;
        }
        
        if (newPassword.length < 6) {
            notificationService.error('New password must be at least 6 characters long');
            return;
        }
        
        if (newPassword !== confirmNewPassword) {
            notificationService.error('New passwords do not match');
            return;
        }
        
        const saveBtn = document.getElementById('savePasswordBtn');
        const originalText = saveBtn.innerHTML;
        
        try {
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<span class="spinner"></span>Changing Password...';
            
            const formData = {
                currentPassword: currentPassword,
                newPassword: newPassword
            };
            
            await api.put('/api/user/change-password', formData);
            
            notificationService.success('Password changed successfully!');
            
            // Close modal and return focus to trigger button
            const modal = bootstrap.Modal.getInstance(document.getElementById('changePasswordModal'));
            modal.hide();
            
            // Return focus to the change password button
            setTimeout(() => {
                document.getElementById('changePasswordBtn').focus();
            }, 150);
            
        } catch (error) {
            // Handle error silently
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = originalText;
        }
    }

    // Account Deletion Methods
    showDeleteAccountModal() {
        const modal = new bootstrap.Modal(document.getElementById('deleteAccountModal'));
        modal.show();
        
        // Clear form
        document.getElementById('deleteAccountForm').reset();
        
        // Focus on first input after modal is shown
        setTimeout(() => {
            document.getElementById('deleteConfirmPassword').focus();
        }, 150);
    }

    async handleAccountDeletion(e) {
        e.preventDefault();
        
        const password = document.getElementById('deleteConfirmPassword').value;
        const confirmText = document.getElementById('deleteConfirmText').value;
        
        // Validation
        if (!password || !confirmText) {
            notificationService.error('All fields are required');
            return;
        }
        
        if (confirmText !== 'DELETE') {
            notificationService.error('Please type "DELETE" to confirm');
            return;
        }
        
        const confirmBtn = document.getElementById('confirmDeleteBtn');
        const originalText = confirmBtn.innerHTML;
        
        try {
            confirmBtn.disabled = true;
            confirmBtn.innerHTML = '<span class="spinner"></span>Deleting Account...';
            
            const formData = {
                password: password
            };
            
            await api.delete('/api/user', { data: formData });
            
            notificationService.success('Account deleted successfully!');
            
            // Logout and redirect to login
            setTimeout(() => {
                authService.logout();
            }, 2000);
            
        } catch (error) {
            // Handle error silently
        } finally {
            confirmBtn.disabled = false;
            confirmBtn.innerHTML = originalText;
        }
    }
}

// Initialize the profile page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ProfilePage();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProfilePage;
} 