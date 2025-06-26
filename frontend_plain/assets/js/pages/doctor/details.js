/**
 * Doctor Details Page JavaScript
 * Handles doctor profile display, calendar view, time slot selection, and booking
 */

class DoctorDetailsPage {
    constructor() {
        this.doctor = null;
        this.currentDate = new Date();
        this.selectedDate = null;
        this.selectedTimeSlot = null;
        this.availableSlots = [];
        
        this.init();
    }

    async init() {
        // Require authentication
        const isAuth = await authService.requireAuth('../../pages/auth/login.html');
        if (!isAuth) return;
        
        this.setupEventListeners();
        this.loadDoctorDetails();
        this.initializeCalendar();
    }

    setupEventListeners() {
        // Calendar navigation
        document.getElementById('prevMonth').addEventListener('click', () => this.previousMonth());
        document.getElementById('nextMonth').addEventListener('click', () => this.nextMonth());
        
        // Booking form
        document.getElementById('bookingForm').addEventListener('submit', (e) => this.handleBookingSubmit(e));
        
        // Logout
        document.getElementById('logoutBtn').addEventListener('click', (e) => {
            e.preventDefault();
            authService.logout();
        });
    }

    async loadDoctorDetails() {
        const urlParams = new URLSearchParams(window.location.search);
        const doctorId = urlParams.get('id');
        
        if (!doctorId) {
            notificationService.error('Doctor ID not provided');
            window.location.href = '/pages/patient/book-appointment.html';
            return;
        }
        
        try {
            const response = await api.get(`/api/doctor/${doctorId}`);
            this.doctor = response.data;
            this.displayDoctorInfo();
        } catch (error) {
            console.error('Failed to load doctor details:', error);
            notificationService.error('Failed to load doctor details');
            window.location.href = '/pages/patient/book-appointment.html';
        }
    }

    displayDoctorInfo() {
        if (!this.doctor) return;
        
        const fullName = `${this.doctor.firstName || ''} ${this.doctor.lastName || ''}`.trim();
        const avatarUrl = this.doctor.profilePictureUrl ?
            this.doctor.profilePictureUrl :
            '/assets/images/default-avatar.png';
        
        // Update page title
        document.title = `Dr. ${fullName} - Book Appointment`;
        
        // Update doctor info
        document.getElementById('doctorName').textContent = fullName;
        document.getElementById('doctorSpecialty').textContent = this.doctor.doctorProfileDTO?.specialty || 'General';
        document.getElementById('doctorLocation').textContent = this.doctor.city || 'Location not specified';
        document.getElementById('doctorExperience').textContent = `${this.doctor.doctorProfileDTO?.experience || 0} years of experience`;
        document.getElementById('doctorBio').textContent = this.doctor.doctorProfileDTO?.bio || 'No bio available';
        document.getElementById('doctorAvatar').src = avatarUrl;
        document.getElementById('doctorAvatar').alt = fullName;
    }

    initializeCalendar() {
        this.renderCalendar();
        this.setupCalendarEventListeners();
    }

    renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // Update month/year display
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                           'July', 'August', 'September', 'October', 'November', 'December'];
        document.getElementById('currentMonth').textContent = `${monthNames[month]} ${year}`;
        
        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();
        
        // Generate calendar HTML
        let calendarHTML = '';
        
        // Add day headers
        const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        calendarHTML += '<div class="calendar-header">';
        dayHeaders.forEach(day => {
            calendarHTML += `<div class="calendar-day-header">${day}</div>`;
        });
        calendarHTML += '</div>';
        
        // Add calendar days
        calendarHTML += '<div class="calendar-body">';
        
        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDay; i++) {
            calendarHTML += '<div class="calendar-day empty"></div>';
        }
        
        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const isToday = this.isToday(date);
            const isPast = this.isPastDate(date);
            const isSelected = this.selectedDate && this.isSameDate(date, this.selectedDate);
            
            let dayClass = 'calendar-day';
            if (isToday) dayClass += ' today';
            if (isPast) dayClass += ' past';
            if (isSelected) dayClass += ' selected';
            
            calendarHTML += `
                <div class="${dayClass}" data-date="${date.toISOString().split('T')[0]}">
                    <span class="day-number">${day}</span>
                </div>
            `;
        }
        
        calendarHTML += '</div>';
        
        document.getElementById('calendar').innerHTML = calendarHTML;
    }

    setupCalendarEventListeners() {
        document.getElementById('calendar').addEventListener('click', (e) => {
            const dayElement = e.target.closest('.calendar-day');
            if (!dayElement || dayElement.classList.contains('empty') || dayElement.classList.contains('past')) {
                return;
            }
            
            const dateString = dayElement.dataset.date;
            this.selectDate(dateString);
        });
    }

    selectDate(dateString) {
        // Remove previous selection
        document.querySelectorAll('.calendar-day.selected').forEach(day => {
            day.classList.remove('selected');
        });
        
        // Add selection to clicked day
        const dayElement = document.querySelector(`[data-date="${dateString}"]`);
        if (dayElement) {
            dayElement.classList.add('selected');
        }
        
        this.selectedDate = new Date(dateString);
        this.loadTimeSlots(dateString);
    }

    async loadTimeSlots(dateString) {
        const timeSlotsContainer = document.getElementById('timeSlotsContainer');
        timeSlotsContainer.innerHTML = '<div class="text-center"><div class="spinner"></div>Loading time slots...</div>';
        
        try {
            const response = await api.get(`/api/doctor/${this.doctor.id}/available-slots?date=${dateString}`);
            this.availableSlots = response.data;
            
            if (this.availableSlots.length === 0) {
                timeSlotsContainer.innerHTML = '<div class="text-center text-muted">No available slots for this date</div>';
                return;
            }
            
            const slotsHTML = this.availableSlots.map(slot => `
                <button class="btn btn-outline-primary time-slot-btn" data-slot="${slot}">
                    ${slot}
                </button>
            `).join('');
            
            timeSlotsContainer.innerHTML = slotsHTML;
            
            // Add event listeners to time slot buttons
            document.querySelectorAll('.time-slot-btn').forEach(btn => {
                btn.addEventListener('click', (e) => this.selectTimeSlot(e.target.dataset.slot));
            });
            
        } catch (error) {
            console.error('Failed to load time slots:', error);
            timeSlotsContainer.innerHTML = '<div class="text-center text-danger">Failed to load time slots</div>';
        }
    }

    selectTimeSlot(timeSlot) {
        // Remove previous selection
        document.querySelectorAll('.time-slot-btn.selected').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        // Add selection to clicked button
        const btn = document.querySelector(`[data-slot="${timeSlot}"]`);
        if (btn) {
            btn.classList.add('selected');
        }
        
        this.selectedTimeSlot = timeSlot;
        document.getElementById('selectedTimeSlot').textContent = timeSlot;
        document.getElementById('bookingSection').style.display = 'block';
    }

    previousMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.renderCalendar();
        this.setupCalendarEventListeners();
    }

    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.renderCalendar();
        this.setupCalendarEventListeners();
    }

    isToday(date) {
        const today = new Date();
        return this.isSameDate(date, today);
    }

    isPastDate(date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    }

    isSameDate(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }

    async handleBookingSubmit(e) {
        e.preventDefault();
        
        if (!this.selectedDate || !this.selectedTimeSlot) {
            notificationService.error('Please select a date and time slot');
            return;
        }
        
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        try {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner"></span>Booking...';
            
            const formData = {
                doctorId: this.doctor.id,
                appointmentDate: this.selectedDate.toISOString().split('T')[0]
            };
            
            const response = await api.post('/api/patient/appointment', formData);
            
            notificationService.success('Appointment booked successfully!');
            
            // Redirect to appointments page
            setTimeout(() => {
                window.location.href = '/pages/doctor/appointments.html';
            }, 1500);
            
        } catch (error) {
            console.error('Failed to book appointment:', error);
            notificationService.error(api.getErrorMessage(error));
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }
}

// Initialize doctor details page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DoctorDetailsPage();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DoctorDetailsPage;
} 