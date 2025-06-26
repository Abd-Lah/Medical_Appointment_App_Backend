// Doctor Appointments Page JS

document.addEventListener('DOMContentLoaded', async () => {
    // Auth check
    if (!(await authService.requireAuth())) return;
    const user = authService.getUser();
    if (!user || user.role !== 'DOCTOR') {
        authService.redirectByRole(user);
        return;
    }
    document.getElementById('doctorName').textContent = `Dr. ${user.firstName || ''} ${user.lastName || ''}`.trim();

    // Fetch appointments
    let appointments = [];
    try {
        const res = await api.get('/api/doctor/appointment');
        if (res.data && res.data.content) {
            appointments = res.data.content;
        }
    } catch (e) {
        console.error('Failed to fetch appointments', e);
        notificationService.error('Failed to load appointments.');
    }

    renderAppointments(appointments);
    appointmentsCache = appointments;

    // Logout button
    document.getElementById('logoutBtn').onclick = () => authService.logout();
});

function renderAppointments(appointments) {
    const tableBody = document.querySelector('#appointmentsTable tbody');
    const noAppointments = document.getElementById('noAppointments');
    tableBody.innerHTML = '';
    if (!appointments.length) {
        noAppointments.classList.remove('d-none');
        return;
    }
    noAppointments.classList.add('d-none');
    appointments.forEach(app => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${app.patientName || app.patientEmail || '-'}</td>
            <td>${helpers.formatDateTime(app.dateTime || app.date || app.appointmentDate)}</td>
            <td><span class="badge bg-${getStatusColor(app.status)}">${app.status}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1" onclick="updateStatus('${app.id || app.appointmentId}')">Update Status</button>
                <button class="btn btn-sm btn-outline-success" onclick="viewReport('${app.id || app.appointmentId}')">Report</button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

function getStatusColor(status) {
    switch ((status || '').toUpperCase()) {
        case 'APPROVED': return 'success';
        case 'PENDING': return 'warning';
        case 'CANCELLED': return 'danger';
        case 'COMPLETED': return 'info';
        default: return 'secondary';
    }
}

window.updateStatus = async function(appointmentId) {
    // Show a prompt or modal for new status (for demo, just cycle status)
    const statuses = ['PENDING', 'APPROVED', 'COMPLETED', 'CANCELLED'];
    const newStatus = prompt('Enter new status (PENDING, APPROVED, COMPLETED, CANCELLED):');
    if (!newStatus || !statuses.includes(newStatus.toUpperCase())) {
        notificationService.error('Invalid status.');
        return;
    }
    try {
        await api.patch(`/api/doctor/appointment/${appointmentId}`, { status: newStatus.toUpperCase() });
        notificationService.success('Status updated!');
        location.reload();
    } catch (e) {
        notificationService.error('Failed to update status.');
    }
}

let currentReportAppointmentId = null;
let currentReportId = null;
let appointmentsCache = [];

window.viewReport = function(appointmentId) {
    // Find appointment
    const app = appointmentsCache.find(a => (a.id || a.appointmentId) === appointmentId);
    currentReportAppointmentId = appointmentId;
    currentReportId = app && app.reportId ? app.reportId : null;
    // Reset form
    document.getElementById('reportForm').reset();
    if (app && app.report) {
        document.getElementById('reportDiagnosis').value = app.report.diagnosis || '';
        document.getElementById('reportTreatment').value = app.report.treatment || '';
        document.getElementById('reportNotes').value = app.report.notes || '';
    } else {
        document.getElementById('reportDiagnosis').value = '';
        document.getElementById('reportTreatment').value = '';
        document.getElementById('reportNotes').value = '';
    }
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('reportModal'));
    modal.show();
}

document.getElementById('reportForm').onsubmit = async function(e) {
    e.preventDefault();
    const diagnosis = document.getElementById('reportDiagnosis').value.trim();
    const treatment = document.getElementById('reportTreatment').value.trim();
    const notes = document.getElementById('reportNotes').value.trim();
    if (!diagnosis || !treatment || !notes) {
        notificationService.error('All fields are required.');
        return;
    }
    try {
        if (currentReportId) {
            // Edit report
            await api.put(`/api/doctor/report/${currentReportId}`, { diagnosis, treatment, notes });
            notificationService.success('Report updated!');
        } else {
            // Create report
            await api.post(`/api/doctor/report/${currentReportAppointmentId}`, { diagnosis, treatment, notes });
            notificationService.success('Report created!');
        }
        // Hide modal
        bootstrap.Modal.getInstance(document.getElementById('reportModal')).hide();
        location.reload();
    } catch (e) {
        notificationService.error('Failed to save report.');
    }
} 