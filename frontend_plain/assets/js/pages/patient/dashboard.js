/**
 * Dashboard Page JavaScript
 * Handles dashboard statistics, user info, quick actions, and logout
 */

document.addEventListener('DOMContentLoaded', async () => {
    // Get user info from localStorage or backend
    let user = null;
    try {
        user = authService.getUser();
        if (!user) {
            // Try to fetch from backend if not in localStorage
            const response = await api.get('/api/user');
            user = response.data;
        }
    } catch (e) {
        // fallback: redirect to login if not authenticated
        window.location.href = '../../pages/auth/login.html';
        return;
    }

    // Set welcome name (prefer full name, fallback to email)
    const nameSpan = document.getElementById('dashboardUserName');
    if (nameSpan && user) {
        let displayName = user.firstName ? user.firstName : '';
        if (user.lastName) displayName += ' ' + user.lastName;
        if (!displayName.trim()) displayName = user.email;
        nameSpan.textContent = displayName.trim();
    }

    // Load dashboard stats (numbers)
    loadDashboardStats(user);

    // Check for upcoming appointments and show/hide empty state
    try {
        const res = await api.get('/api/patient/appointment');
        const appointments = res.data.content || res.data || [];
        // Only show upcoming (PENDING or APPROVED, and in the future)
        const now = new Date();
        const upcoming = appointments.filter(app => {
            const status = app.status;
            let dateTime;
            if (app.appointmentDate) {
                dateTime = new Date(app.appointmentDate);
            } else if (app.date && app.time) {
                dateTime = new Date(app.date + 'T' + app.time);
            } else {
                return false;
            }
            return (status === 'PENDING' || status === 'APPROVED') && dateTime > now;
        });
        
        // Show/hide empty state based on whether there are upcoming appointments
        const emptyState = document.getElementById('dashboardEmptyState');
        if (emptyState) {
            if (upcoming.length > 0) {
                // Hide empty state if there are upcoming appointments
                emptyState.style.display = 'none';
            } else {
                // Show empty state if no upcoming appointments
                emptyState.style.display = '';
            }
        }
    } catch (e) {
        // On error, show empty state
        const emptyState = document.getElementById('dashboardEmptyState');
        if (emptyState) {
            emptyState.style.display = '';
        }
    }

    // Optionally, handle logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            authService.logout();
        });
    }

    // Dynamically show menu for role
    if (user && window.showMenuForRole) {
        try {
            const role = user.role;
            window.showMenuForRole(role);
        } catch (e) {
            console.log('Error showing menu for role:', e);
        }
    }
});

/**
 * Set active navigation link based on current page
 */
function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href && href.includes(currentPage)) {
            link.classList.add('active');
        }
    });
}

function loadDashboardStats(user) {
    if (!user) return;
    
    // Total Appointments (all statuses)
    const endpoint = user.role === 'DOCTOR' ? '/api/doctor/appointment' : '/api/patient/appointment';
    api.get(endpoint)
        .then(res => {
            const appointments = res.data.content || res.data;
            const total = Array.isArray(appointments) ? appointments.length : 0;
            document.getElementById('totalAppointmentsCount').textContent = total;
        })
        .catch(err => {
            console.log('Failed to load appointments:', err);
            document.getElementById('totalAppointmentsCount').textContent = '0';
            // Don't show error notification for dashboard stats
        });
    
    // Reports - This endpoint doesn't exist, so we'll skip it
    if (user.role === 'PATIENT') {
        // For now, set to 0 since the endpoint doesn't exist
        document.getElementById('reportsCount').textContent = '0';
        // TODO: Implement reports endpoint when available
        /*
        api.get('/api/patient/report')
            .then(res => {
                const reports = res.data.content || res.data;
                document.getElementById('reportsCount').textContent = Array.isArray(reports) ? reports.length : 0;
            })
            .catch(err => {
                console.log('Failed to load reports:', err);
                document.getElementById('reportsCount').textContent = '0';
            });
        */
    } else {
        document.getElementById('reportsCount').textContent = '-';
    }
} 