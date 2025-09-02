// Admin Dashboard JS
// Fetch and display total users, doctors, and patients count
// Wire up quick actions

document.addEventListener('DOMContentLoaded', async () => {
    // Auth check
    if (!(await authService.requireAuth())) return;
    const user = authService.getUser();
    if (!user || user.role !== 'ADMIN') {
        authService.redirectByRole(user);
        return;
    }
    // Set user name
    document.getElementById('dashboardUserName').textContent = user.firstName || 'Admin';

    // Fetch total users
    let totalUsers = 0, totalDoctors = 0, totalPatients = 0;
    try {
        // Fetch all users by role (paginated)
        const usersRes = await api.get('/api/all/ADMIN');
        const doctorsRes = await api.get('/api/all/DOCTOR');
        const patientsRes = await api.get('/api/all/PATIENT');
        if (usersRes.data && usersRes.data.content) totalUsers = usersRes.data.content.length;
        if (doctorsRes.data && doctorsRes.data.content) totalDoctors = doctorsRes.data.content.length;
        if (patientsRes.data && patientsRes.data.content) totalPatients = patientsRes.data.content.length;
    } catch (e) {
        // Handle error silently
    }
    document.getElementById('totalUsersCount').textContent = totalUsers;
    document.getElementById('totalDoctorsCount').textContent = totalDoctors;
    document.getElementById('totalPatientsCount').textContent = totalPatients;

    // Quick actions
    document.getElementById('viewAllUsersAction').onclick = () => {
        window.location.href = '/pages/admin/users.html';
    };
    document.getElementById('viewAllDoctorsAction').onclick = () => {
        window.location.href = '/pages/admin/users.html?role=DOCTOR';
    };
    document.getElementById('viewProfileAction').onclick = () => {
        window.location.href = '/pages/admin/profile.html';
    };

    // Logout button
    document.getElementById('logoutBtn').onclick = () => authService.logout();
}); 