/**
 * Doctor Profile Page JavaScript
 * Handles doctor profile display and appointment booking functionality
 */

let availableSlotsByDate = {};
let workingDays = [];
let doctorProfileDTO = null;

/**
 * Load doctor profile data and initialize the page
 */
async function loadDoctorProfile() {
    const urlParams = new URLSearchParams(window.location.search);
    const doctorId = urlParams.get('id');
    if (!doctorId) return;
    
    document.getElementById('bookDoctorId').value = doctorId;
    
    try {
        const response = await api.get(`/api/doctor/${doctorId}`);
        const doctor = response.data;
        doctorProfileDTO = doctor.doctorProfileDTO;
        
        // Update doctor information in the UI
        document.getElementById('doctorAvatar').src = doctor.profilePictureUrl ? doctor.profilePictureUrl : '/assets/images/default-avatar.png';
        document.getElementById('doctorSpecialty').textContent = doctor.doctorProfileDTO?.specialty || 'General';
        document.getElementById('doctorName').textContent = `Dr. ${doctor.firstName || ''} ${doctor.lastName || ''}`.trim();
        document.getElementById('doctorCity').textContent = doctor.city || '-';
        document.getElementById('doctorBio').textContent = doctor.doctorProfileDTO?.bio || 'No bio available.';
        document.getElementById('doctorExperience').textContent = doctor.doctorProfileDTO?.experience || '-';
        document.getElementById('doctorQualifications').textContent = doctor.doctorProfileDTO?.qualifications || '-';
        document.getElementById('doctorClinic').textContent = doctor.doctorProfileDTO?.clinicAddress || '-';
        document.getElementById('doctorWorkingDays').textContent = doctor.doctorProfileDTO?.workingDays || '-';
        document.getElementById('doctorDuration').textContent = doctor.doctorProfileDTO?.appointmentDuration || '-';
        
        // Parse working days
        workingDays = (doctor.doctorProfileDTO?.workingDays || '').split(',').map(d => d.trim().toLowerCase());
        
        // Use availableSlotsByDate from backend
        availableSlotsByDate = doctor.availableSlotsByDate || {};
        
        generateWeekTabs(doctorId);
    } catch (e) {
        notificationService.error('Failed to load doctor profile');
    }
}

/**
 * Check if a given date is a working day for the doctor
 */
function isWorkingDay(date) {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    return workingDays.includes(dayName);
}

/**
 * Generate week tabs for appointment booking
 */
function generateWeekTabs(doctorId) {
    function getWeekDates(startOffset) {
        const today = new Date();
        const weekDates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + startOffset + i);
            weekDates.push(date);
        }
        return weekDates;
    }
    
    // This week
    const thisWeekDates = getWeekDates(0);
    const daysTabThisWeek = document.getElementById('daysTabThisWeek');
    const daysTabContentThisWeek = document.getElementById('daysTabContentThisWeek');
    daysTabThisWeek.innerHTML = '';
    daysTabContentThisWeek.innerHTML = '';
    
    // Only show working days with available slots and not in the past
    const filteredThisWeekDates = thisWeekDates.filter(date => {
        const dateStr = date.toISOString().slice(0, 10);
        return isWorkingDay(date) && availableSlotsByDate[dateStr] && availableSlotsByDate[dateStr].length > 0 && date >= new Date(new Date().toDateString());
    });
    
    filteredThisWeekDates.forEach((date, idx) => {
        const dateStr = date.toISOString().slice(0, 10);
        const tabId = `thisWeek-day-${dateStr}`;
        const active = idx === 0 ? 'active' : '';
        
        daysTabThisWeek.innerHTML += `<button class="days-tab-btn ${active}" id="${tabId}-tab" data-tab-id="${tabId}" data-date="${dateStr}">${date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</button>`;
        daysTabContentThisWeek.innerHTML += `<div class="tab-pane fade ${active ? 'show active' : ''}" id="${tabId}" role="tabpanel" aria-labelledby="${tabId}-tab">
            <div class="slots-list" id="slots-list-thisWeek-${dateStr}">Loading...</div>
        </div>`;
    });
    
    // Add click event listeners for this week tabs
    daysTabThisWeek.querySelectorAll('.days-tab-btn').forEach((btn, idx) => {
        btn.addEventListener('click', function() {
            daysTabThisWeek.querySelectorAll('.days-tab-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            daysTabContentThisWeek.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('show', 'active'));
            const tabId = this.getAttribute('data-tab-id');
            const pane = daysTabContentThisWeek.querySelector(`#${tabId}`);
            if (pane) { pane.classList.add('show', 'active'); }
        });
    });
    
    // Render slots for this week
    filteredThisWeekDates.forEach((date, idx) => {
        const dateStr = date.toISOString().slice(0, 10);
        renderSlots(doctorId, dateStr, `thisWeek`);
    });
    
    // Next week
    const nextWeekDates = getWeekDates(7);
    const daysTabNextWeek = document.getElementById('daysTabNextWeek');
    const daysTabContentNextWeek = document.getElementById('daysTabContentNextWeek');
    daysTabNextWeek.innerHTML = '';
    daysTabContentNextWeek.innerHTML = '';
    
    const filteredNextWeekDates = nextWeekDates.filter(date => {
        const dateStr = date.toISOString().slice(0, 10);
        return isWorkingDay(date) && availableSlotsByDate[dateStr] && availableSlotsByDate[dateStr].length > 0;
    });
    
    filteredNextWeekDates.forEach((date, idx) => {
        const dateStr = date.toISOString().slice(0, 10);
        const tabId = `nextWeek-day-${dateStr}`;
        const active = idx === 0 ? 'active' : '';
        
        daysTabNextWeek.innerHTML += `<button class="days-tab-btn ${active}" id="${tabId}-tab" data-tab-id="${tabId}" data-date="${dateStr}">${date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</button>`;
        daysTabContentNextWeek.innerHTML += `<div class="tab-pane fade ${active ? 'show active' : ''}" id="${tabId}" role="tabpanel" aria-labelledby="${tabId}-tab">
            <div class="slots-list" id="slots-list-nextWeek-${dateStr}">Loading...</div>
        </div>`;
    });
    
    // Add click event listeners for next week tabs
    daysTabNextWeek.querySelectorAll('.days-tab-btn').forEach((btn, idx) => {
        btn.addEventListener('click', function() {
            daysTabNextWeek.querySelectorAll('.days-tab-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            daysTabContentNextWeek.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('show', 'active'));
            const tabId = this.getAttribute('data-tab-id');
            const pane = daysTabContentNextWeek.querySelector(`#${tabId}`);
            if (pane) { pane.classList.add('show', 'active'); }
        });
    });
    
    // Render slots for next week
    filteredNextWeekDates.forEach((date, idx) => {
        const dateStr = date.toISOString().slice(0, 10);
        renderSlots(doctorId, dateStr, `nextWeek`);
    });
}

/**
 * Render available time slots for a specific date
 */
function renderSlots(doctorId, dateStr, weekType) {
    const slotsList = document.getElementById(`slots-list-${weekType}-${dateStr}`);
    const slots = availableSlotsByDate[dateStr] || [];
    
    if (!slots.length) {
        slotsList.innerHTML = '<div class="no-slots">No slots available</div>';
        return;
    }
    
    slotsList.innerHTML = slots.map(slot => 
        `<button type="button" class="btn btn-outline-primary slot-btn" data-date="${dateStr}" data-time="${slot}">${slot}</button>`
    ).join('');
    
    // Add click event listeners for slot buttons
    slotsList.querySelectorAll('.slot-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            document.getElementById('bookAppointmentForm').classList.remove('hidden-form');
            document.getElementById('bookDate').value = this.getAttribute('data-date');
            document.getElementById('bookTime').value = this.getAttribute('data-time');
        });
    });
}

/**
 * Handle appointment booking form submission
 */
async function handleAppointmentBooking(e) {
    e.preventDefault();
    
    const doctorId = document.getElementById('bookDoctorId').value;
    const date = document.getElementById('bookDate').value;
    const time = document.getElementById('bookTime').value;
    
    if (!doctorId || !date || !time) {
        notificationService.error('Please select a slot.');
        return;
    }
    
    // Extra frontend validation
    const now = new Date();
    const selectedDateTime = new Date(date + 'T' + time);
    
    if (selectedDateTime < now) {
        notificationService.error('Cannot book appointments in the past.');
        return;
    }
    
    if ((selectedDateTime - now) / (60 * 1000) < 30) {
        notificationService.error('Appointment must be at least 30 minutes after the current time.');
        return;
    }
    
    if ((selectedDateTime - now) / (1000 * 60 * 60 * 24) > 15) {
        notificationService.error('Appointments can only be booked up to 15 days in advance.');
        return;
    }
    
    try {
        await api.post('/api/patient/appointment', { 
            doctorId, 
            appointmentDate: date + 'T' + time 
        });
        
        notificationService.success('Appointment booked successfully!');
        
        // Reset form and UI
        e.target.reset();
        e.target.classList.add('hidden-form');
        document.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('selected'));
        
        // Refresh slots after booking
        await loadDoctorProfile();
        generateWeekTabs(doctorId);
        
    } catch (err) {
        // Show all backend error messages to the user
        let msg = 'Failed to book appointment.';
        if (err && (err.status === 400 || err.status === 401 || err.status === 403 || err.status === 404 || err.status === 409 || err.status === 422 || err.status === 500)) {
            msg = err.message || (err.data && err.data.message) || msg;
        }
        notificationService.error(msg);
        
        // If slot taken or validation error, refresh slots
        await loadDoctorProfile();
        generateWeekTabs(doctorId);
    }
}

/**
 * Initialize the page when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    loadDoctorProfile();
    
    // Add event listeners
    document.getElementById('bookAppointmentForm').addEventListener('submit', handleAppointmentBooking);
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            authService.logout();
        });
    }
}); 