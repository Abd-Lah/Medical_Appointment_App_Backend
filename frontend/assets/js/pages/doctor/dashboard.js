// Doctor Dashboard JS
// Fetch and display doctor's appointments, reports, and patients count
// Wire up quick actions

document.addEventListener('DOMContentLoaded', async () => {
    // Auth check
    if (!(await authService.requireAuth())) return;
    const user = authService.getUser();
    if (!user || user.role !== 'DOCTOR') {
        authService.redirectByRole(user);
        return;
    }
    // Set user name
    document.getElementById('dashboardUserName').textContent = user.firstName || 'Doctor';

    // Fetch appointments
    let appointmentsCount = 0;
    let patientsSet = new Set();
    try {
        const res = await api.get('/api/doctor/appointment');
        if (res.data && res.data.content) {
            appointmentsCount = res.data.content.length;
            // Collect unique patient names/emails if available
            res.data.content.forEach(app => {
                if (app.patientEmail) patientsSet.add(app.patientEmail);
                else if (app.patientName) patientsSet.add(app.patientName);
            });
        }
    } catch (e) {
        // Handle error silently
    }
    document.getElementById('myAppointmentsCount').textContent = appointmentsCount;
    document.getElementById('patientsCount').textContent = patientsSet.size;

    // Fetch reports (if endpoint exists)
    let reportsCount = 0;
    try {
        // If you have a dedicated endpoint, use it. Otherwise, count from appointments.
        // const res = await api.get('/api/doctor/reports');
        // reportsCount = res.data.length;
        // For now, count reports from appointments:
        const res = await api.get('/api/doctor/appointment');
        if (res.data && res.data.content) {
            reportsCount = res.data.content.filter(app => app.reportId).length;
        }
    } catch (e) {
        // Handle error silently
    }
    document.getElementById('myReportsCount').textContent = reportsCount;

    // Quick actions
    document.getElementById('viewAppointmentsAction').onclick = () => {
        window.location.href = '/pages/doctor/appointments.html';
    };
    document.getElementById('viewReportsAction').onclick = () => {
        window.location.href = '/pages/doctor/appointments.html#reports';
    };
    document.getElementById('viewProfileAction').onclick = () => {
        window.location.href = '/pages/doctor/profile.html';
    };

    // Logout button
    document.getElementById('logoutBtn').onclick = () => authService.logout();
}); 