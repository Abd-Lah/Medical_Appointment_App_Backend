/**
 * Doctor Profile Page JavaScript
 * Handles profile loading, updating, image upload with CropperJS, and form validation
 */

class DoctorProfilePage {
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
        document.getElementById('professionalForm').addEventListener('submit', (e) => this.handleProfessionalUpdate(e));
        
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
        
        // Time validation events
        document.getElementById('startTime').addEventListener('change', () => this.validateTimeFields());
        document.getElementById('endTime').addEventListener('change', () => this.validateTimeFields());
        document.getElementById('breakTimeStart').addEventListener('change', () => this.validateTimeFields());
        document.getElementById('breakTimeEnd').addEventListener('change', () => this.validateTimeFields());
        
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
        // Personal Information
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

        // Professional Information
        if (userData.doctorProfileDTO) {
            document.getElementById('specialty').value = userData.doctorProfileDTO.specialty || '';
            document.getElementById('experience').value = userData.doctorProfileDTO.experience || '';
            document.getElementById('qualifications').value = userData.doctorProfileDTO.qualifications || '';
            document.getElementById('clinicAddress').value = userData.doctorProfileDTO.clinicAddress || '';
            document.getElementById('appointmentDuration').value = userData.doctorProfileDTO.appointmentDuration || 30;
            document.getElementById('bio').value = userData.doctorProfileDTO.bio || '';
            
            // Set working days
            if (userData.doctorProfileDTO.workingDays) {
                const workingDays = userData.doctorProfileDTO.workingDays.toLowerCase().split(', ');
                workingDays.forEach(day => {
                    const checkbox = document.getElementById(day);
                    if (checkbox) {
                        checkbox.checked = true;
                    }
                });
            }
            
            // Set working hours
            document.getElementById('startTime').value = userData.doctorProfileDTO.startTime || '09:00';
            document.getElementById('breakTimeStart').value = userData.doctorProfileDTO.breakTimeStart || '13:00';
            document.getElementById('breakTimeEnd').value = userData.doctorProfileDTO.breakTimeEnd || '14:00';
            document.getElementById('endTime').value = userData.doctorProfileDTO.endTime || '22:00';
        }
    }

    updateProfileDisplay(userData) {
        const fullName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Doctor';
        document.getElementById('profileName').textContent = fullName;
        document.getElementById('profileRole').textContent = 'Doctor';
        
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
            notificationService.success('Personal information updated successfully!');
            this.updateProfileDisplay(response.data);
        } catch (error) {
            notificationService.error(api.getErrorMessage(error));
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = originalText;
        }
    }

    async handleProfessionalUpdate(e) {
        e.preventDefault();
        const saveBtn = document.getElementById('saveProfessionalBtn');
        const originalText = saveBtn.innerHTML;
        try {
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<span class="spinner"></span>Saving...';
            
            // Validate time fields first
            if (!this.validateTimeFields()) {
                notificationService.error('Please fix the time validation errors before saving');
                return;
            }
            
            // Collect working days
            const workingDays = [];
            const dayCheckboxes = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
            dayCheckboxes.forEach(day => {
                const checkbox = document.getElementById(day);
                if (checkbox && checkbox.checked) {
                    workingDays.push(day.charAt(0).toUpperCase() + day.slice(1));
                }
            });
            
            const formData = {
                specialty: document.getElementById('specialty').value.trim(),
                experience: document.getElementById('experience').value.trim(),
                qualifications: document.getElementById('qualifications').value.trim(),
                clinicAddress: document.getElementById('clinicAddress').value.trim(),
                appointmentDuration: parseInt(document.getElementById('appointmentDuration').value),
                bio: document.getElementById('bio').value.trim(),
                workingDays: workingDays.join(', '),
                startTime: document.getElementById('startTime').value,
                breakTimeStart: document.getElementById('breakTimeStart').value,
                breakTimeEnd: document.getElementById('breakTimeEnd').value,
                endTime: document.getElementById('endTime').value
            };

            // Validate required fields
            const requiredFields = ['specialty', 'experience', 'appointmentDuration'];
            for (const field of requiredFields) {
                if (!formData[field]) {
                    notificationService.error(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
                    return;
                }
            }
            
            // Validate working days
            if (workingDays.length === 0) {
                notificationService.error('Please select at least one working day');
                return;
            }

            const response = await api.put('/api/user/update_doctor_profile', formData);
            notificationService.success('Professional information updated successfully!');
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
            const image = document.createElement('img');
            image.src = e.target.result;
            image.style.maxWidth = '100%';
            image.style.maxHeight = '400px';
            image.style.display = 'block';
            image.style.margin = '0 auto';
            cropperArea.appendChild(image);
            
            // Show cropper modal
            const cropperModal = new bootstrap.Modal(document.getElementById('cropperModal'));
            cropperModal.show();
            
            // Initialize cropper after modal is shown
            setTimeout(() => {
                this.initializeCropper(image);
            }, 100);
        };
        reader.readAsDataURL(file);
    }

    initializeCropper(image) {
        if (this.cropper) {
            this.cropper.destroy();
        }
        
        this.cropper = new Cropper(image, {
            aspectRatio: 1,
            viewMode: 1,
            dragMode: 'move',
            autoCropArea: 1,
            restore: false,
            guides: true,
            center: true,
            highlight: false,
            cropBoxMovable: true,
            cropBoxResizable: true,
            toggleDragModeOnDblclick: false,
        });
    }

    cancelCrop() {
        if (this.cropper) {
            this.cropper.destroy();
            this.cropper = null;
        }
        this.hideCropper();
        this.currentFile = null;
    }

    async saveCrop() {
        if (!this.cropper || !this.currentFile) return;
        
        try {
            const canvas = this.cropper.getCroppedCanvas({
                width: 400,
                height: 400
            });
            
            canvas.toBlob(async (blob) => {
                const file = new File([blob], this.currentFile.name, { type: this.currentFile.type });
                await this.uploadProfilePicture(file);
            }, this.currentFile.type);
        } catch (error) {
            notificationService.error('Error processing image');
        }
    }

    async uploadProfilePicture(file) {
        try {
            const formData = new FormData();
            formData.append('file', file);
            
            const response = await api.upload('/api/upload/profile-picture', formData);
            authService.setAuth(localStorage.getItem('token'), response.data);
            notificationService.success('Profile picture updated successfully!');
            this.updateProfileDisplay(response.data);
            this.hideCropper();
        } catch (error) {
            notificationService.error(api.getErrorMessage(error));
        }
    }

    hideCropper() {
        const cropperModal = bootstrap.Modal.getInstance(document.getElementById('cropperModal'));
        if (cropperModal) {
            cropperModal.hide();
        }
        if (this.cropper) {
            this.cropper.destroy();
            this.cropper = null;
        }
        this.currentFile = null;
    }

    setActiveNavLink() {
        // Remove active class from all nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // Add active class to profile link
        const profileLink = document.querySelector('.nav-link[href*="profile.html"]');
        if (profileLink) {
            profileLink.classList.add('active');
        }
    }

    showChangePasswordModal() {
        const modal = new bootstrap.Modal(document.getElementById('changePasswordModal'));
        modal.show();
        
        // Clear form
        document.getElementById('changePasswordForm').reset();
        
        // Focus on first input
        setTimeout(() => {
            document.getElementById('currentPassword').focus();
        }, 100);
    }

    async handlePasswordChange(e) {
        e.preventDefault();
        const saveBtn = document.getElementById('savePasswordBtn');
        const originalText = saveBtn.innerHTML;
        
        try {
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<span class="spinner"></span>Changing...';
            
            const formData = {
                currentPassword: document.getElementById('currentPassword').value,
                newPassword: document.getElementById('newPassword').value,
                confirmPassword: document.getElementById('confirmPassword').value
            };

            // Validate passwords match
            if (formData.newPassword !== formData.confirmPassword) {
                notificationService.error('New passwords do not match');
                return;
            }

            // Validate password strength
            if (formData.newPassword.length < 8) {
                notificationService.error('Password must be at least 8 characters long');
                return;
            }

            await api.put('/api/user/change-password', formData);
            notificationService.success('Password changed successfully!');
            
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('changePasswordModal'));
            modal.hide();
        } catch (error) {
            notificationService.error(api.getErrorMessage(error));
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = originalText;
        }
    }

    showDeleteAccountModal() {
        const modal = new bootstrap.Modal(document.getElementById('deleteAccountModal'));
        modal.show();
        
        // Clear form
        document.getElementById('deleteAccountForm').reset();
        
        // Focus on first input
        setTimeout(() => {
            document.getElementById('deletePassword').focus();
        }, 100);
    }

    async handleAccountDeletion(e) {
        e.preventDefault();
        const deleteBtn = document.getElementById('deleteAccountBtn');
        const originalText = deleteBtn.innerHTML;
        
        try {
            deleteBtn.disabled = true;
            deleteBtn.innerHTML = '<span class="spinner"></span>Deleting...';
            
            const formData = {
                password: document.getElementById('deletePassword').value,
                confirmPassword: document.getElementById('deleteConfirmPassword').value
            };

            // Validate passwords match
            if (formData.password !== formData.confirmPassword) {
                notificationService.error('Passwords do not match');
                return;
            }

            await api.delete('/api/user', { data: formData });
            notificationService.success('Account deleted successfully!');
            
            // Logout and redirect
            setTimeout(() => {
                authService.logout();
            }, 1000);
        } catch (error) {
            notificationService.error(api.getErrorMessage(error));
        } finally {
            deleteBtn.disabled = false;
            deleteBtn.innerHTML = originalText;
        }
    }

    validateTimeFields() {
        const startTime = document.getElementById('startTime').value;
        const endTime = document.getElementById('endTime').value;
        const breakTimeStart = document.getElementById('breakTimeStart').value;
        const breakTimeEnd = document.getElementById('breakTimeEnd').value;
        
        let isValid = true;
        
        // Clear previous validation messages
        this.clearTimeValidation();
        
        // Validate start time
        if (startTime) {
            const startValidation = this.validateStartTime(startTime);
            if (!startValidation.isValid) {
                this.showTimeValidation('startTimeValidation', startValidation.message, 'error');
                isValid = false;
            } else {
                this.showTimeValidation('startTimeValidation', '✓ Valid start time', 'success');
            }
        }
        
        // Validate end time
        if (endTime) {
            const endValidation = this.validateEndTime(startTime, endTime);
            if (!endValidation.isValid) {
                this.showTimeValidation('endTimeValidation', endValidation.message, 'error');
                isValid = false;
            } else {
                this.showTimeValidation('endTimeValidation', '✓ Valid end time', 'success');
            }
        }
        
        // Validate break times if provided
        if (breakTimeStart || breakTimeEnd) {
            const breakValidation = this.validateBreakTime(startTime, endTime, breakTimeStart, breakTimeEnd);
            if (!breakValidation.isValid) {
                this.showTimeValidation('breakTimeStartValidation', breakValidation.message, 'error');
                this.showTimeValidation('breakTimeEndValidation', breakValidation.message, 'error');
                isValid = false;
            } else {
                this.showTimeValidation('breakTimeStartValidation', '✓ Valid break time', 'success');
                this.showTimeValidation('breakTimeEndValidation', '✓ Valid break time', 'success');
            }
        }
        
        return isValid;
    }
    
    validateStartTime(startTime) {
        const time = new Date(`2000-01-01T${startTime}`);
        const hour = time.getHours();
        
        if (hour < 6) {
            return { isValid: false, message: 'Start time should be after 6:00 AM' };
        }
        if (hour > 12) {
            return { isValid: false, message: 'Start time should be before 12:00 PM' };
        }
        
        return { isValid: true, message: 'Valid start time' };
    }
    
    validateEndTime(startTime, endTime) {
        if (!startTime || !endTime) {
            return { isValid: false, message: 'Both start and end times are required' };
        }
        
        const start = new Date(`2000-01-01T${startTime}`);
        const end = new Date(`2000-01-01T${endTime}`);
        
        if (end <= start) {
            return { isValid: false, message: 'End time must be after start time' };
        }
        
        const diffHours = (end - start) / (1000 * 60 * 60);
        if (diffHours < 2) {
            return { isValid: false, message: 'Working hours should be at least 2 hours' };
        }
        if (diffHours > 16) {
            return { isValid: false, message: 'Working hours cannot exceed 16 hours' };
        }
        
        return { isValid: true, message: 'Valid end time' };
    }
    
    validateBreakTime(startTime, endTime, breakTimeStart, breakTimeEnd) {
        if (!startTime || !endTime) {
            return { isValid: false, message: 'Start and end times are required for break validation' };
        }
        
        // If only one break time is provided, it's invalid
        if ((breakTimeStart && !breakTimeEnd) || (!breakTimeStart && breakTimeEnd)) {
            return { isValid: false, message: 'Both break start and end times are required' };
        }
        
        if (!breakTimeStart || !breakTimeEnd) {
            return { isValid: true, message: 'Break time is optional' };
        }
        
        const start = new Date(`2000-01-01T${startTime}`);
        const end = new Date(`2000-01-01T${endTime}`);
        const breakStart = new Date(`2000-01-01T${breakTimeStart}`);
        const breakEnd = new Date(`2000-01-01T${breakTimeEnd}`);
        
        // Break must be within working hours
        if (breakStart < start || breakEnd > end) {
            return { isValid: false, message: 'Break time must be within working hours' };
        }
        
        // Break end must be after break start
        if (breakEnd <= breakStart) {
            return { isValid: false, message: 'Break end time must be after break start time' };
        }
        
        // Break should be reasonable (not too long)
        const breakDuration = (breakEnd - breakStart) / (1000 * 60 * 60);
        if (breakDuration > 4) {
            return { isValid: false, message: 'Break time cannot exceed 4 hours' };
        }
        
        return { isValid: true, message: 'Valid break time' };
    }
    
    showTimeValidation(elementId, message, type) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = message;
            element.className = `doctor-time-validation ${type}`;
        }
    }
    
    clearTimeValidation() {
        const validationElements = [
            'startTimeValidation',
            'endTimeValidation', 
            'breakTimeStartValidation',
            'breakTimeEndValidation'
        ];
        
        validationElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = '';
                element.className = 'doctor-time-validation';
            }
        });
    }
}

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if required services are available
    if (typeof authService === 'undefined') {
        console.error('Auth service not available');
        return;
    }
    
    if (typeof api === 'undefined') {
        console.error('API service not available');
        return;
    }
    
    if (typeof notificationService === 'undefined') {
        console.error('Notification service not available');
        return;
    }
    
    if (typeof helpers === 'undefined') {
        console.error('Helpers not available');
        return;
    }
    
    if (typeof CitySelector === 'undefined') {
        console.error('CitySelector not available');
        return;
    }
    
    if (typeof Cropper === 'undefined') {
        console.error('Cropper not available');
        return;
    }
    
    if (typeof bootstrap === 'undefined') {
        console.error('Bootstrap not available');
        return;
    }
    
    try {
        new DoctorProfilePage();
    } catch (error) {
        console.error('Error initializing doctor profile page:', error);
    }
});
