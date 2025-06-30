/**
 * Appointments Page JavaScript
 * Handles appointment loading, filtering, cancellation, and billing
 */

// Global variables
let appointments = [];
let doctors = [];
let appointmentViewSelect, appointmentHistorySection, bookAppointmentSection;
let filterStatusEl, filterDateEl, searchDoctor;
let bookForm, bookDoctorId, bookDate, bookTime, saveBookBtn, logoutBtn;
let appointmentsGrid, noAppointments, doctorsGrid;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize DOM elements
    appointmentViewSelect = document.getElementById('appointmentViewSelect');
    appointmentHistorySection = document.getElementById('appointmentHistorySection');
    bookAppointmentSection = document.getElementById('bookAppointmentSection');
    filterStatusEl = document.getElementById('filterStatus');
    filterDateEl = document.getElementById('filterDate');
    searchDoctor = document.getElementById('searchDoctor');
    bookForm = document.getElementById('bookAppointmentForm');
    bookDoctorId = document.getElementById('bookDoctorId');
    bookDate = document.getElementById('bookDate');
    bookTime = document.getElementById('bookTime');
    saveBookBtn = document.getElementById('saveBookBtn');
    logoutBtn = document.getElementById('logoutBtn');
    appointmentsGrid = document.getElementById('appointmentsGrid');
    noAppointments = document.getElementById('noAppointments');
    doctorsGrid = document.getElementById('doctorsGrid');

    // Setup event listeners only if elements exist
    if (appointmentViewSelect) {
appointmentViewSelect.addEventListener('change', () => {
    if (appointmentViewSelect.value === 'book') {
        appointmentHistorySection.style.display = 'none';
        bookAppointmentSection.style.display = '';
        renderDoctorsGrid();
    } else {
        appointmentHistorySection.style.display = '';
        bookAppointmentSection.style.display = 'none';
    }
});
    }
    if (appointmentHistorySection) appointmentHistorySection.style.display = '';
    if (bookAppointmentSection) bookAppointmentSection.style.display = 'none';

    if (filterStatusEl) filterStatusEl.addEventListener('change', filterAppointments);
    if (filterDateEl) filterDateEl.addEventListener('change', filterAppointments);
    if (searchDoctor) {
        searchDoctor.addEventListener('input', helpers.debounce(() => {
            filterAndRender();
        }, 300));
    }

// Ensure showMenuForRole is available
if (typeof showMenuForRole === 'undefined' && typeof window !== 'undefined' && window.showMenuForRole) {
    var showMenuForRole = window.showMenuForRole;
    }

    // Initialize the page
    initializePage();
});

// Initialize page data
async function initializePage() {
    const user = authService.getUser();
    if (typeof showMenuForRole !== 'undefined') {
        showMenuForRole(user.role);
    }

    // Debug: Check token
    const token = localStorage.getItem('token');
    
    if (!token || !user.role) {
        window.location.href = '/auth/login.html';
        return;
    }

    // Test API call to verify token
    try {
        const testResponse = await api.get('/api/auth/validate');
    } catch (e) {
        window.location.href = '/auth/login.html';
        return;
    }

    // Load initial data
    await loadAppointments();
    await loadDoctors();

    // Setup form handlers
    setupFormHandlers();
}

// Setup form handlers
function setupFormHandlers() {
    if (bookForm) {
        bookForm.onsubmit = async function(e) {
            e.preventDefault();
            const doctorId = bookDoctorId.value;
            const date = bookDate.value;
            const time = bookTime.value;
            if (!doctorId || !date || !time) {
                notificationService.error('Please fill all fields.');
                return;
            }
            const originalText = saveBookBtn.innerHTML;
            try {
                saveBookBtn.disabled = true;
                saveBookBtn.innerHTML = '<span class="spinner"></span>Booking...';
                await api.post('/api/patient/appointment', { doctorId, date, time });
                notificationService.success('Appointment booked successfully!');
                bootstrap.Modal.getInstance(document.getElementById('bookAppointmentModal')).hide();
                await loadAppointments();
                if (appointmentViewSelect) {
                    appointmentViewSelect.value = 'history';
                    appointmentHistorySection.style.display = '';
                    bookAppointmentSection.style.display = 'none';
                }
            } catch (error) {
                notificationService.error('Failed to book appointment.');
            } finally {
                saveBookBtn.disabled = false;
                saveBookBtn.innerHTML = originalText;
            }
        };
    }

    // Handle update form submission
    document.getElementById('updateAppointmentForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const appointmentId = document.getElementById('updateAppointmentId').value;
        const date = document.getElementById('updateDate').value;
        const time = document.getElementById('updateTime').value;
        
        if (!date || !time) {
            notificationService.error('Please select a date and time');
            return;
        }
        
        const saveBtn = document.getElementById('saveUpdateBtn');
        const originalText = saveBtn.textContent;
        saveBtn.textContent = 'Updating...';
        saveBtn.disabled = true;
        
        try {
            // Combine date and time
            const dateTime = `${date}T${time}:00`;
            
            // Extra frontend validation (same as doctor profile)
            const now = new Date();
            const selectedDateTime = new Date(dateTime);
            if (selectedDateTime < now) {
                notificationService.error('Cannot update appointments to past times.');
                return;
            }
            if ((selectedDateTime - now) / (60 * 1000) < 30) {
                notificationService.error('Appointment must be at least 30 minutes after the current time.');
                return;
            }
            if ((selectedDateTime - now) / (1000 * 60 * 60 * 24) > 15) {
                notificationService.error('Appointments can only be updated up to 15 days in advance.');
                return;
            }
            
            const response = await api.put(`/api/patient/${appointmentId}`, {
                appointmentDate: dateTime
            });
            
            notificationService.success('Appointment updated successfully');
            
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('updateAppointmentModal'));
            modal.hide();
            
            // Refresh appointments
            await loadAppointments();
            
        } catch (error) {
            // Handle error silently
        } finally {
            saveBtn.textContent = originalText;
            saveBtn.disabled = false;
        }
    });

    if (logoutBtn) {
        logoutBtn.onclick = (e) => {
            e.preventDefault();
            authService.logout();
        };
    }
}

// Fetch and render appointments and doctors
function filterAppointments() {
    const status = filterStatusEl ? filterStatusEl.value : '';
    const date = filterDateEl ? filterDateEl.value : '';
    let filtered = appointments;
    if (status) {
        filtered = filtered.filter(a => a.status === status);
    }
    if (date) {
        filtered = filtered.filter(a => (a.date || a.dateTime || a.appointmentDate || '').startsWith(date));
    }
    renderAppointments(filtered);
}

async function fetchAppointments() {
    try {
        const res = await api.get('/api/patient/appointment');
        return res.data.content || [];
    } catch {
        return [];
    }
}

async function fetchDoctors() {
    try {
        const res = await api.get('/api/doctors');
        return res.data.content || res.data || [];
    } catch {
        return [];
    }
}

function renderDoctorsGrid(doctors = []) {
    const grid = document.getElementById('doctorsGrid');
    if (!grid) return;
    if (!doctors.length) {
        grid.innerHTML = '<div class="text-center text-muted">No doctors found.</div>';
        return;
    }
    // Responsive 5 per row on large screens
    grid.innerHTML = doctors.map(doctor => createDoctorCard(doctor)).join('');
}

function createDoctorCard(doctor) {
    const fullName = `${doctor.firstName || ''} ${doctor.lastName || ''}`.trim();
    const avatarUrl = doctor.profilePictureUrl ?
        doctor.profilePictureUrl :
        '/assets/images/default-avatar.png';
    return `
    <div class="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2 mb-4 d-flex align-items-stretch">
        <div class="card w-100 doctor-card">
            <img src="${avatarUrl}" class="card-img-top" alt="${fullName}">
            <div class="card-body">
                <h5 class="card-title">Dr. ${fullName}</h5>
                <p class="card-text mb-1"><strong>Specialty:</strong> ${doctor.doctorProfileDTO?.specialty || 'General'}</p>
                <p class="card-text mb-1"><strong>City:</strong> ${doctor.city || '-'}</p>
                <p class="card-text mb-1"><strong>Experience:</strong> ${doctor.doctorProfileDTO?.experience || 0} years</p>
                <button class="btn btn-primary btn-sm w-100 mt-2" onclick="bookAppointmentWithDoctor('${doctor.id}')">
                    <i class="fas fa-calendar-plus me-1"></i>Book Appointment
                </button>
                <button class="btn btn-outline-info btn-sm w-100 mt-2" onclick="viewDoctorDetails('${doctor.id}')">
                    <i class="fas fa-eye me-1"></i>View Details
                </button>
            </div>
        </div>
    </div>
    `;
}

// Doctor details navigation (if any button or link)
window.viewDoctorDetails = function(doctorId) {
    window.location.href = `/pages/doctor/details.html?id=${doctorId}`;
};

function renderAppointments(appointments = []) {
    const grid = document.getElementById('appointmentsGrid');
    const noAppointments = document.getElementById('noAppointments');
    if (!grid || !noAppointments) return;

    if (!appointments.length) {
        grid.innerHTML = '';
        noAppointments.style.display = '';
        return;
    }
    noAppointments.style.display = 'none';
    grid.innerHTML = appointments.map(app => createAppointmentCard(app)).join('');
    // Add action listeners
    grid.querySelectorAll('.btn-update').forEach(btn => {
        btn.onclick = () => openUpdateModal(btn.dataset.id);
    });
    grid.querySelectorAll('.btn-cancel').forEach(btn => {
        btn.onclick = () => cancelAppointment(btn.dataset.id);
    });
    grid.querySelectorAll('.btn-bill').forEach(btn => {
        btn.onclick = () => downloadBilling(btn.dataset.id);
    });
    grid.querySelectorAll('.btn-report').forEach(btn => {
        btn.onclick = () => viewReport(btn.dataset.id);
    });
}

function createAppointmentCard(app) {
    const card = document.createElement('div');
    card.className = 'appointment-card';
    
    // Parse appointment date
    let appointmentDateTime;
    try {
        appointmentDateTime = new Date(app.appointmentDateTime);
    } catch (e) {
        appointmentDateTime = new Date();
    }
    
    const now = new Date();
    const isUpcoming = appointmentDateTime > now;
    const isCompleted = app.status === 'APPROVED' && !isUpcoming;
    
    // Determine available actions
    const canUpdate = app.status === 'PENDING' && isUpcoming;
    const canCancel = (app.status === 'PENDING' || app.status === 'APPROVED') && isUpcoming;
    const canDownloadBill = app.status === 'APPROVED' && !isUpcoming;
    const canViewReport = app.status === 'APPROVED' && !isUpcoming;
    
    const doctorName = app.doctorName || (app.doctor && (app.doctor.firstName + ' ' + app.doctor.lastName)) || '-';
    
    // Handle different date formats from backend
    let appointmentDate, appointmentTime;
    if (app.appointmentDate) {
        // Backend sends LocalDateTime as string
        const dateTime = new Date(app.appointmentDate);
        appointmentDate = dateTime.toISOString().split('T')[0];
        appointmentTime = dateTime.toTimeString().slice(0, 5);
    } else if (app.date) {
        appointmentDate = app.date;
        appointmentTime = app.time || '00:00';
    } else {
        appointmentDate = 'Unknown';
        appointmentTime = 'Unknown';
    }
    
    const date = helpers.formatDate(appointmentDate, 'MM/DD/YYYY');
    const time = helpers.formatTime(appointmentTime, true);
    const status = helpers.formatStatus(app.status);
    
    // Backend rules: Only PENDING appointments can be updated, and only if they're in the future and at least 8 hours away
    const eightHoursFromNow = new Date(now.getTime() + (8 * 60 * 60 * 1000));
    const canUpdate = app.status === 'PENDING' && appointmentDateTime > eightHoursFromNow;
    
    // Backend rules: Can cancel PENDING and APPROVED appointments if they're at least 8 hours away
    const canCancel = ['PENDING', 'APPROVED'].includes(app.status) && appointmentDateTime > eightHoursFromNow;
    
    // Backend rules: Bills available for PENDING and APPROVED appointments (not cancelled or past)
    const canDownloadBill = ['PENDING', 'APPROVED'].includes(app.status) && appointmentDateTime > now;
    
    // Reports available if appointment has a report
    const canViewReport = app.report && app.report.id;
    
    try {
        if (app.appointmentDate) {
            appointmentDateTime = new Date(app.appointmentDate);
        } else if (app.date && app.time) {
            appointmentDateTime = new Date(app.date + 'T' + app.time);
        } else {
            appointmentDateTime = new Date();
        }
    } catch (e) {
        // Handle error silently
    }
    
    const now = new Date();
    const isUpcoming = appointmentDateTime > now;
    const isCompleted = app.status === 'APPROVED' && !isUpcoming;
    
    // Determine available actions
    const canUpdate = app.status === 'PENDING' && isUpcoming;
    const canCancel = (app.status === 'PENDING' || app.status === 'APPROVED') && isUpcoming;
    const canDownloadBill = app.status === 'APPROVED' && !isUpcoming;
    const canViewReport = app.status === 'APPROVED' && !isUpcoming;
    
    return `
    <div class="appointment-card mb-3">
        <div class="appointment-header d-flex justify-content-between align-items-center mb-2">
            <div>
            <div class="appointment-title"><strong>${doctorName}</strong></div>
                <div class="appointment-doctor text-muted">${date} ${time}</div>
            </div>
            <span class="appointment-status status-${(app.status || '').toLowerCase()}">${status}</span>
        </div>
        <div class="appointment-details mb-2">
            <div class="detail-item"><i class="fas fa-user-md me-1"></i>Doctor: ${doctorName}</div>
            <div class="detail-item"><i class="fas fa-calendar me-1"></i>Date: ${date}</div>
            <div class="detail-item"><i class="fas fa-clock me-1"></i>Time: ${time}</div>
        <div class="detail-item"><i class="fas fa-info-circle me-1"></i>Status: ${status}</div>
        </div>
        <div class="appointment-actions d-flex gap-2">
        ${canUpdate ? `<button class="btn btn-warning btn-sm btn-update" data-id="${app.id}"><i class="fas fa-edit me-1"></i>Update</button>` : ''}
        ${canCancel ? `<button class="btn btn-danger btn-sm btn-cancel" data-id="${app.id}"><i class="fas fa-times me-1"></i>Cancel</button>` : ''}
        ${canDownloadBill ? `<button class="btn btn-success btn-sm btn-bill" data-id="${app.id}"><i class="fas fa-file-invoice-dollar me-1"></i>Download Bill</button>` : ''}
        ${canViewReport ? `<button class="btn btn-info btn-sm btn-report" data-id="${app.id}"><i class="fas fa-file-medical-alt me-1"></i>View Report</button>` : ''}
        </div>
</div>`;
}

// Update appointment modal
async function openUpdateModal(appointmentId) {
    const appointment = appointments.find(app => app.id === appointmentId);
    if (!appointment) {
        notificationService.error('Appointment not found');
        return;
    }
    
    // Get doctor ID from appointment
    const doctorId = appointment.doctor?.id || appointment.doctorId;
    if (!doctorId) {
        notificationService.error('Doctor information not found');
        return;
    }
    
    try {
        // Load doctor data and available slots
        const response = await api.get(`/api/doctor/${doctorId}`);
        const doctor = response.data;
        
        // Set doctor name in modal
        const doctorName = `${doctor.firstName || ''} ${doctor.lastName || ''}`.trim();
        document.getElementById('updateDoctorName').textContent = doctorName;
        
        // Store appointment ID
        document.getElementById('updateAppointmentId').value = appointmentId;
        
        // Reset modal state
        document.getElementById('updateAppointmentForm').style.display = 'none';
        document.getElementById('updateFormPlaceholder').style.display = '';
        
        // Get available slots and working days
        const availableSlotsByDate = doctor.availableSlotsByDate || {};
        const workingDays = (doctor.doctorProfileDTO?.workingDays || '').split(',').map(d => d.trim().toLowerCase());
        
        // Generate week tabs with available slots
        generateUpdateWeekTabs(availableSlotsByDate, workingDays);
        
        // Add manual tab switching for week tabs
        const thisWeekTab = document.getElementById('updateThisWeek-tab');
        const nextWeekTab = document.getElementById('updateNextWeek-tab');
        const thisWeekContent = document.getElementById('updateThisWeek');
        const nextWeekContent = document.getElementById('updateNextWeek');
        
        if (thisWeekTab && nextWeekTab) {
            // Make sure tabs are visible
            thisWeekTab.style.display = 'block';
            nextWeekTab.style.display = 'block';
            thisWeekTab.style.visibility = 'visible';
            nextWeekTab.style.visibility = 'visible';
            
            // Set initial state for consistent styling
            thisWeekContent.style.display = 'block';
            nextWeekContent.style.display = 'none';
            
            thisWeekTab.addEventListener('click', function() {
                // Remove active from both tabs
                thisWeekTab.classList.remove('active');
                nextWeekTab.classList.remove('active');
                thisWeekContent.classList.remove('show', 'active');
                nextWeekContent.classList.remove('show', 'active');
                
                // Add active to this week
                thisWeekTab.classList.add('active');
                thisWeekContent.classList.add('show', 'active');
                
                // Ensure consistent layout
                thisWeekContent.style.display = 'block';
                nextWeekContent.style.display = 'none';
            });
            
            nextWeekTab.addEventListener('click', function() {
                // Remove active from both tabs
                thisWeekTab.classList.remove('active');
                nextWeekTab.classList.remove('active');
                thisWeekContent.classList.remove('show', 'active');
                nextWeekContent.classList.remove('show', 'active');
                
                // Add active to next week
                nextWeekTab.classList.add('active');
                nextWeekContent.classList.add('show', 'active');
                
                // Ensure consistent layout
                thisWeekContent.style.display = 'none';
                nextWeekContent.style.display = 'block';
            });
        }
        
        // Show the modal
        const modal = new bootstrap.Modal(document.getElementById('updateAppointmentModal'));
        modal.show();
        
        // Handle modal close to prevent focus issues
        const modalElement = document.getElementById('updateAppointmentModal');
        
        // Remove any existing event listeners to prevent duplicates
        modalElement.removeEventListener('hidden.bs.modal', handleModalClose);
        modalElement.removeEventListener('shown.bs.modal', handleModalShow);
        
        // Add event listeners
        modalElement.addEventListener('hidden.bs.modal', handleModalClose);
        modalElement.addEventListener('shown.bs.modal', handleModalShow);
        
        function handleModalClose() {
            // Remove focus from any elements inside the modal
            const focusedElement = modalElement.querySelector(':focus');
            if (focusedElement) {
                focusedElement.blur();
            }
            
            // Reset modal state
            document.getElementById('updateAppointmentForm').style.display = 'none';
            document.getElementById('updateFormPlaceholder').style.display = '';
            
            // Clear any selected slots
            document.querySelectorAll('.slot-btn.selected').forEach(btn => {
                btn.classList.remove('selected');
            });
            
            // Focus back to the trigger element or body
            document.body.focus();
        }
        
        function handleModalShow() {
            // Ensure proper focus management when modal opens
            setTimeout(() => {
                const firstFocusableElement = modalElement.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                if (firstFocusableElement) {
                    firstFocusableElement.focus();
                }
            }, 100);
        }
        
    } catch (e) {
        // Handle error silently
    }
}

// Generate week tabs for update modal
function generateUpdateWeekTabs(availableSlotsByDate, workingDays) {
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
    
    function isWorkingDay(date) {
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        return workingDays.includes(dayName);
    }
    
    // This week - only show working days with available slots and not in the past
    const thisWeekDates = getWeekDates(0);
    const daysTabThisWeek = document.getElementById('updateDaysTabThisWeek');
    const daysTabContentThisWeek = document.getElementById('updateDaysTabContentThisWeek');
    daysTabThisWeek.innerHTML = '';
    daysTabContentThisWeek.innerHTML = '';
    
    const filteredThisWeekDates = thisWeekDates.filter(date => {
        const dateStr = date.toISOString().slice(0, 10);
        return isWorkingDay(date) && availableSlotsByDate[dateStr] && availableSlotsByDate[dateStr].length > 0 && date >= new Date(new Date().toDateString());
    });
    
    filteredThisWeekDates.forEach((date, idx) => {
        const dateStr = date.toISOString().slice(0, 10);
        const tabId = `updateThisWeek-day-${dateStr}`;
        const active = idx === 0 ? 'active' : '';
        daysTabThisWeek.innerHTML += `<button class="days-tab-btn ${active}" id="${tabId}-tab" data-tab-id="${tabId}" data-date="${dateStr}">${date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</button>`;
        daysTabContentThisWeek.innerHTML += `<div class="tab-pane fade ${active ? 'show active' : ''}" id="${tabId}" role="tabpanel" aria-labelledby="${tabId}-tab">
            <div class="slots-list" id="update-slots-list-thisWeek-${dateStr}">Loading...</div>
        </div>`;
    });
    
    // Add event listeners for day tabs
    daysTabThisWeek.querySelectorAll('.days-tab-btn').forEach((btn) => {
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
    filteredThisWeekDates.forEach((date) => {
        const dateStr = date.toISOString().slice(0, 10);
        renderUpdateSlots(dateStr, 'thisWeek', availableSlotsByDate);
    });
    
    // Next week - only show working days with available slots (no past date restriction)
    const nextWeekDates = getWeekDates(7);
    const daysTabNextWeek = document.getElementById('updateDaysTabNextWeek');
    const daysTabContentNextWeek = document.getElementById('updateDaysTabContentNextWeek');
    daysTabNextWeek.innerHTML = '';
    daysTabContentNextWeek.innerHTML = '';
    
    const filteredNextWeekDates = nextWeekDates.filter(date => {
        const dateStr = date.toISOString().slice(0, 10);
        return isWorkingDay(date) && availableSlotsByDate[dateStr] && availableSlotsByDate[dateStr].length > 0;
    });
    
    filteredNextWeekDates.forEach((date, idx) => {
        const dateStr = date.toISOString().slice(0, 10);
        const tabId = `updateNextWeek-day-${dateStr}`;
        const active = idx === 0 ? 'active' : '';
        daysTabNextWeek.innerHTML += `<button class="days-tab-btn ${active}" id="${tabId}-tab" data-tab-id="${tabId}" data-date="${dateStr}">${date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</button>`;
        daysTabContentNextWeek.innerHTML += `<div class="tab-pane fade ${active ? 'show active' : ''}" id="${tabId}" role="tabpanel" aria-labelledby="${tabId}-tab">
            <div class="slots-list" id="update-slots-list-nextWeek-${dateStr}">Loading...</div>
        </div>`;
    });
    
    // Add event listeners for day tabs
    daysTabNextWeek.querySelectorAll('.days-tab-btn').forEach((btn) => {
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
    filteredNextWeekDates.forEach((date) => {
        const dateStr = date.toISOString().slice(0, 10);
        renderUpdateSlots(dateStr, 'nextWeek', availableSlotsByDate);
    });
}

// Render slots for update modal
function renderUpdateSlots(dateStr, weekType, availableSlotsByDate) {
    const slotsList = document.getElementById(`update-slots-list-${weekType}-${dateStr}`);
    const slots = availableSlotsByDate[dateStr] || [];
    
    if (!slots.length) {
        slotsList.innerHTML = '<div class="no-slots">No slots available</div>';
        return;
    }
    
    slotsList.innerHTML = slots.map(slot => 
        `<button type="button" class="btn btn-outline-primary slot-btn" data-date="${dateStr}" data-time="${slot}">${slot}</button>`
    ).join('');
    
    // Add event listeners for slot buttons
    slotsList.querySelectorAll('.slot-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove selected class from all slot buttons
            document.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('selected'));
            // Add selected class to clicked button
            this.classList.add('selected');
            
            // Set the form values
            document.getElementById('updateDate').value = this.getAttribute('data-date');
            document.getElementById('updateTime').value = this.getAttribute('data-time');
            
            // Show the form and hide placeholder
            document.getElementById('updateAppointmentForm').style.display = '';
            document.getElementById('updateFormPlaceholder').style.display = 'none';
        });
    });
}

// Download billing
async function downloadBilling(appointmentId) {
    try {
        // Use the api service to get the file with proper authentication
        const response = await api.get(`/api/patient/billing_url/${appointmentId}`, {
            responseType: 'blob' // Important: specify blob response type
        });
        
        // Create object URL for the blob
        const url = window.URL.createObjectURL(response.data);
        
        // Create download link
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = `appointment-bill-${appointmentId}.pdf`;
        
        // Trigger download
        document.body.appendChild(downloadLink);
        downloadLink.click();
        
        // Clean up
        document.body.removeChild(downloadLink);
        window.URL.revokeObjectURL(url);
        
        notificationService.success('Bill downloaded successfully!');
        
    } catch (error) {
        // Handle error silently
    }
}

// View report
async function viewReport(appointmentId) {
    try {
        const appointment = appointments.find(app => app.id === appointmentId);
        if (!appointment || !appointment.report) {
            notificationService.error('No report available for this appointment');
            return;
        }
        
        const reportContent = document.getElementById('reportContent');
        reportContent.innerHTML = `
            <div class="report-details">
                <h6>Report Details</h6>
                <p><strong>Diagnosis:</strong> ${appointment.report.diagnosis || 'Not specified'}</p>
                <p><strong>Treatment:</strong> ${appointment.report.treatment || 'Not specified'}</p>
                <p><strong>Notes:</strong> ${appointment.report.notes || 'No additional notes'}</p>
                <p><strong>Created:</strong> ${helpers.formatDate(appointment.report.createdAt, 'MM/DD/YYYY HH:mm')}</p>
            </div>
        `;
        
        const modal = new bootstrap.Modal(document.getElementById('viewReportModal'));
        modal.show();
    } catch (e) {
        // Handle error silently
    }
}

// Cancel appointment
async function cancelAppointment(id) {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    try {
        await api.delete(`/api/patient/${id}`);
        notificationService.success('Appointment cancelled.');
        await loadAppointments();
    } catch (e) {
        notificationService.error('Failed to cancel appointment.');
    }
}

// Load appointments
async function loadAppointments() {
    try {
        appointments = await fetchAppointments();
        renderAppointments(appointments);
    } catch (e) {
        appointments = [];
        renderAppointments([]);
        notificationService.error('Failed to load appointments.');
    }
}

// Load doctors
async function loadDoctors() {
    try {
        doctors = await fetchDoctors();
        renderDoctorsGrid(doctors);
    } catch (e) {
        doctors = [];
        renderDoctorsGrid([]);
        notificationService.error('Failed to load doctors.');
    }
}

function filterAndRender() {
    let filtered = appointments;
    const status = filterStatusEl ? filterStatusEl.value : '';
    const date = filterDateEl ? filterDateEl.value : '';
    if (status) {
        filtered = filtered.filter(a => a.status === status);
    }
    if (date) {
        filtered = filtered.filter(a => (a.date || a.dateTime || a.appointmentDate || '').startsWith(date));
    }
    renderAppointments(filtered);
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { filterAppointments, fetchAppointments, fetchDoctors, renderAppointments, renderDoctorsGrid, createDoctorCard };
} 

// Dynamically show menu for role
document.addEventListener('DOMContentLoaded', function() {
    const user = localStorage.getItem('user');
    if (user && window.showMenuForRole) {
        try {
            const role = JSON.parse(user).role;
            window.showMenuForRole(role);
        } catch (e) {
            // Handle error silently
        }
    }
}); 