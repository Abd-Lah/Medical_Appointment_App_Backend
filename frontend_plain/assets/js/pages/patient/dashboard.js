/**
 * Dashboard Page JavaScript
 * Handles dashboard statistics, user info, quick actions, and logout
 */

document.addEventListener('DOMContentLoaded', async () => {
    // Require authentication with proper path
    const isAuth = await authService.requireAuth('../../pages/auth/login.html');
    if (!isAuth) {
        console.log('Authentication failed, redirecting to login');
        return;
    }

    // Start health monitoring
    api.startHealthMonitoring(30000); // Check every 30 seconds

    // Set active link
    setActiveNavLink();

    // Load user info
    const user = authService.getUser();
    if (user) {
        document.getElementById('dashboardUserName').textContent = user.name || user.email || 'User';
        
        // Call menu function with proper error handling
        if (window.showMenuForRole && user.role) {
            console.log('Calling showMenuForRole with role:', user.role);
            try {
                showMenuForRole(user.role);
            } catch (error) {
                console.error('Error calling showMenuForRole:', error);
            }
        } else {
            console.warn('showMenuForRole not available or user role missing:', {
                showMenuForRole: !!window.showMenuForRole,
                userRole: user.role
            });
        }
    }

    // Load dashboard statistics
    loadDashboardStats(user);

    // Quick actions
    document.getElementById('bookAppointmentAction').addEventListener('click', () => {
        window.location.href = '/pages/patient/book-appointment.html';
    });
    document.getElementById('viewAppointmentsAction').addEventListener('click', () => {
        window.location.href = '/pages/patient/appointments.html';
    });
    document.getElementById('viewProfileAction').addEventListener('click', () => {
        window.location.href = '/pages/patient/profile.html';
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        api.stopHealthMonitoring(); // Stop monitoring before logout
        authService.logout();
    });
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
    
    // Appointments
    const endpoint = user.role === 'DOCTOR' ? '/api/doctor/appointment' : '/api/patient/appointment';
    api.get(endpoint)
        .then(res => {
            const appointments = res.data.content || res.data;
            const upcoming = appointments.filter(a => a.status === 'PENDING' || a.status === 'APPROVED').length;
            document.getElementById('upcomingAppointmentsCount').textContent = upcoming;
        })
        .catch(err => {
            console.log('Failed to load appointments:', err);
            document.getElementById('upcomingAppointmentsCount').textContent = '0';
            // Don't show error notification for dashboard stats
        });
    
    // Doctors - Fixed endpoint from /api/doctor to /api/doctors
    api.get('/api/doctors')
        .then(res => {
            const doctors = res.data.content || res.data;
            document.getElementById('doctorsCount').textContent = Array.isArray(doctors) ? doctors.length : 0;
        })
        .catch(err => {
            console.log('Failed to load doctors:', err);
            document.getElementById('doctorsCount').textContent = '0';
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