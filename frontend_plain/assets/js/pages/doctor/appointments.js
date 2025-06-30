/**
 * Doctor Appointments Page JavaScript
 * Handles appointment management, status updates, and report creation
 */

// Global variables
let appointments = [];
let appointmentsCache = [];
let currentReportId = null;
let currentReportAppointmentId = null;

// DOM elements
let filterStatusEl, filterDateEl, clearFiltersEl;

document.addEventListener('DOMContentLoaded', async () => {
    // Auth check
    if (!(await authService.requireAuth())) return;
    const user = authService.getUser();
    if (!user || user.role !== 'DOCTOR') {
        authService.redirectByRole(user);
        return;
    }

    // Initialize page
    await initializePage();
    setupFormHandlers();
    setupFilterHandlers();
});

async function initializePage() {
    // Set doctor name
    const user = authService.getUser();
    document.getElementById('doctorName').textContent = `Dr. ${user.firstName || ''} ${user.lastName || ''}`.trim();

    // Get DOM elements
    filterStatusEl = document.getElementById('filterStatus');
    filterDateEl = document.getElementById('filterDate');
    clearFiltersEl = document.getElementById('clearFilters');

    // Load appointments
    await loadAppointments();

    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        authService.logout();
    });
}

function setupFormHandlers() {
    // Report form submission
    document.getElementById('reportForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const diagnosis = document.getElementById('reportDiagnosis').value.trim();
        const treatment = document.getElementById('reportTreatment').value.trim();
        const notes = document.getElementById('reportNotes').value.trim();
        
        if (!diagnosis || !treatment) {
            notificationService.error('Diagnosis and treatment are required.');
            return;
        }
        
        const saveBtn = document.getElementById('saveReportBtn');
        const originalText = saveBtn.innerHTML;
        
        try {
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<span class="spinner"></span>Saving...';
            
            const reportData = { diagnosis, treatment, notes };
            
            if (currentReportId) {
                // Edit report
                await api.put(`/api/doctor/report/${currentReportId}`, reportData);
                notificationService.success('Report updated successfully!');
            } else {
                // Create report
                await api.post(`/api/doctor/report/${currentReportAppointmentId}`, reportData);
                notificationService.success('Report created successfully!');
            }
            
            // Hide modal and reload appointments
            const modal = bootstrap.Modal.getInstance(document.getElementById('reportModal'));
            modal.hide();
            await loadAppointments();
            
        } catch (error) {
            notificationService.error(api.getErrorMessage(error) || 'Failed to save report.');
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = originalText;
        }
    });
}

function setupFilterHandlers() {
    // Filter change events
    filterStatusEl.addEventListener('change', filterAppointments);
    filterDateEl.addEventListener('change', filterAppointments);
    
    // Clear filters
    clearFiltersEl.addEventListener('click', () => {
        filterStatusEl.value = '';
        filterDateEl.value = '';
        filterAppointments();
    });
}

function filterAppointments() {
    let filtered = appointmentsCache;
    const status = filterStatusEl.value;
    const date = filterDateEl.value;
    
    if (status) {
        filtered = filtered.filter(a => a.status === status);
    }
    if (date) {
        filtered = filtered.filter(a => {
            const appointmentDate = a.appointmentDate || a.appointmentDateTime;
            return appointmentDate && appointmentDate.startsWith(date);
        });
    }
    
    renderAppointments(filtered);
}

async function fetchAppointments() {
    try {
        const res = await api.get('/api/doctor/appointment');
        return res.data.content || res.data || [];
    } catch {
        return [];
    }
}

function renderAppointments(appointments = []) {
    const grid = document.getElementById('appointmentsGrid');
    const noAppointments = document.getElementById('noAppointments');
    const loadingState = document.getElementById('loadingState');
    const content = document.getElementById('appointmentsContent');
    
    // Hide loading state
    loadingState.style.display = 'none';
    content.style.display = '';
    
    if (appointments.length === 0) {
        grid.innerHTML = '';
        noAppointments.style.display = '';
        return;
    }
    
    noAppointments.style.display = 'none';
    grid.innerHTML = appointments.map(app => createAppointmentCard(app)).join('');
}

function createAppointmentCard(app) {
    const patientName = app.patientName || (app.patient && (app.patient.firstName + ' ' + app.patient.lastName)) || 'Unknown Patient';
    const patientEmail = app.patientEmail || (app.patient && app.patient.email) || '';
    
    // Parse appointment date
    let appointmentDateTime;
    try {
        if (app.appointmentDate) {
            appointmentDateTime = new Date(app.appointmentDate);
        } else if (app.appointmentDateTime) {
            appointmentDateTime = new Date(app.appointmentDateTime);
        } else {
            appointmentDateTime = new Date();
        }
    } catch (e) {
        appointmentDateTime = new Date();
    }
    
    const date = helpers.formatDate(appointmentDateTime, 'MM/DD/YYYY');
    const time = helpers.formatTime(appointmentDateTime, 'HH:mm');
    const status = helpers.formatStatus(app.status);
    
    // Determine available actions based on status
    const canUpdateStatus = app.status === 'PENDING';
    const canCreateReport = app.status === 'APPROVED' && !app.report;
    const canViewReport = app.report && app.report.id;
    const canEditReport = app.report && app.report.id;
    
    return `
    <div class="appointment-card mb-3">
        <div class="appointment-header d-flex justify-content-between align-items-center mb-2">
            <div>
                <div class="appointment-title"><strong>${patientName}</strong></div>
                <div class="appointment-patient text-muted">${patientEmail}</div>
            </div>
            <span class="appointment-status status-${(app.status || '').toLowerCase()}">${status}</span>
        </div>
        <div class="appointment-details mb-2">
            <div class="detail-item"><i class="fas fa-user me-1"></i>Patient: ${patientName}</div>
            <div class="detail-item"><i class="fas fa-calendar me-1"></i>Date: ${date}</div>
            <div class="detail-item"><i class="fas fa-clock me-1"></i>Time: ${time}</div>
            <div class="detail-item"><i class="fas fa-info-circle me-1"></i>Status: ${status}</div>
        </div>
        <div class="appointment-actions d-flex gap-2">
            ${canUpdateStatus ? `
                <button class="btn btn-success btn-sm btn-approve" data-id="${app.id}">
                    <i class="fas fa-check me-1"></i>Approve
                </button>
                <button class="btn btn-danger btn-sm btn-cancel" data-id="${app.id}">
                    <i class="fas fa-times me-1"></i>Cancel
                </button>
            ` : ''}
            ${canCreateReport ? `
                <button class="btn btn-primary btn-sm btn-report" data-id="${app.id}">
                    <i class="fas fa-file-medical me-1"></i>Create Report
                </button>
            ` : ''}
            ${canViewReport ? `
                <button class="btn btn-info btn-sm btn-view-report" data-id="${app.id}">
                    <i class="fas fa-eye me-1"></i>View Report
                </button>
            ` : ''}
            ${canEditReport ? `
                <button class="btn btn-warning btn-sm btn-edit-report" data-id="${app.id}">
                    <i class="fas fa-edit me-1"></i>Edit Report
                </button>
            ` : ''}
        </div>
    </div>`;
}

// Event delegation for appointment actions
document.addEventListener('click', async (e) => {
    const target = e.target.closest('button');
    if (!target) return;
    
    const appointmentId = target.dataset.id;
    if (!appointmentId) return;
    
    if (target.classList.contains('btn-approve')) {
        await updateAppointmentStatus(appointmentId, 'APPROVED');
    } else if (target.classList.contains('btn-cancel')) {
        await updateAppointmentStatus(appointmentId, 'CANCELLED');
    } else if (target.classList.contains('btn-report')) {
        openReportModal(appointmentId);
    } else if (target.classList.contains('btn-view-report')) {
        viewReport(appointmentId);
    } else if (target.classList.contains('btn-edit-report')) {
        editReport(appointmentId);
    }
});

async function updateAppointmentStatus(appointmentId, status) {
    if (!confirm(`Are you sure you want to ${status.toLowerCase()} this appointment?`)) return;
    
    try {
        await api.patch(`/api/doctor/appointment/${appointmentId}`, { status });
        notificationService.success(`Appointment ${status.toLowerCase()} successfully.`);
        await loadAppointments();
    } catch (error) {
        notificationService.error(api.getErrorMessage(error) || 'Failed to update appointment status.');
    }
}

function openReportModal(appointmentId) {
    currentReportId = null;
    currentReportAppointmentId = appointmentId;
    
    // Clear form
    document.getElementById('reportForm').reset();
    document.getElementById('reportModalLabel').textContent = 'Create Medical Report';
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('reportModal'));
    modal.show();
}

function viewReport(appointmentId) {
    const appointment = appointments.find(app => app.id === appointmentId);
    if (!appointment || !appointment.report) {
        notificationService.error('No report available for this appointment');
        return;
    }
    
    const reportContent = document.getElementById('viewReportContent');
    reportContent.innerHTML = `
        <div class="report-details">
            <h6>Report Details</h6>
            <p><strong>Diagnosis:</strong> ${appointment.report.diagnosis || 'Not specified'}</p>
            <p><strong>Treatment:</strong> ${appointment.report.treatment || 'Not specified'}</p>
            <p><strong>Notes:</strong> ${appointment.report.notes || 'No additional notes'}</p>
            <p><strong>Created:</strong> ${helpers.formatDate(appointment.report.createdAt, 'MM/DD/YYYY HH:mm')}</p>
        </div>
    `;
    
    // Set up edit button
    document.getElementById('editReportBtn').onclick = () => {
        bootstrap.Modal.getInstance(document.getElementById('viewReportModal')).hide();
        editReport(appointmentId);
    };
    
    const modal = new bootstrap.Modal(document.getElementById('viewReportModal'));
    modal.show();
}

function editReport(appointmentId) {
    const appointment = appointments.find(app => app.id === appointmentId);
    if (!appointment || !appointment.report) {
        notificationService.error('No report available for this appointment');
        return;
    }
    
    currentReportId = appointment.report.id;
    currentReportAppointmentId = appointmentId;
    
    // Populate form
    document.getElementById('reportDiagnosis').value = appointment.report.diagnosis || '';
    document.getElementById('reportTreatment').value = appointment.report.treatment || '';
    document.getElementById('reportNotes').value = appointment.report.notes || '';
    document.getElementById('reportModalLabel').textContent = 'Edit Medical Report';
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('reportModal'));
    modal.show();
}

async function loadAppointments() {
    try {
        appointments = await fetchAppointments();
        appointmentsCache = [...appointments];
        renderAppointments(appointments);
    } catch (e) {
        appointments = [];
        appointmentsCache = [];
        renderAppointments([]);
        notificationService.error('Failed to load appointments.');
    }
} 