// Admin User Management Page JS

document.addEventListener('DOMContentLoaded', async () => {
    // Auth check
    if (!(await authService.requireAuth())) return;
    const user = authService.getUser();
    if (!user || user.role !== 'ADMIN') {
        authService.redirectByRole(user);
        return;
    }
    document.getElementById('adminName').textContent = user.firstName || 'Admin';

    // Initial fetch (all users)
    await fetchAndRenderUsers();

    // Search form
    document.getElementById('userSearchForm').onsubmit = async (e) => {
        e.preventDefault();
        await fetchAndRenderUsers();
    };
    document.getElementById('resetBtn').onclick = async () => {
        document.getElementById('searchName').value = '';
        document.getElementById('searchEmail').value = '';
        document.getElementById('searchRole').value = '';
        document.getElementById('searchCity').value = '';
        await fetchAndRenderUsers();
    };

    // Logout button
    document.getElementById('logoutBtn').onclick = () => authService.logout();
});

async function fetchAndRenderUsers() {
    const name = document.getElementById('searchName').value.trim();
    const email = document.getElementById('searchEmail').value.trim();
    const role = document.getElementById('searchRole').value;
    const city = document.getElementById('searchCity').value.trim();
    let users = [];
    try {
        let endpoint = '/api/all/';
        endpoint += role ? role : 'ADMIN'; // Default to ADMIN, but you can fetch all roles if needed
        const res = await api.get(endpoint);
        if (res.data && res.data.content) {
            users = res.data.content;
        }
    } catch (e) {
        console.error('Failed to fetch users', e);
        notificationService.error('Failed to load users.');
    }
    // Filter client-side for name/email/city
    if (name) users = users.filter(u => (u.firstName + ' ' + u.lastName).toLowerCase().includes(name.toLowerCase()));
    if (email) users = users.filter(u => u.email && u.email.toLowerCase().includes(email.toLowerCase()));
    if (city) users = users.filter(u => u.city && u.city.toLowerCase().includes(city.toLowerCase()));
    renderUsers(users);
}

function renderUsers(users) {
    const tableBody = document.querySelector('#usersTable tbody');
    const noUsers = document.getElementById('noUsers');
    tableBody.innerHTML = '';
    if (!users.length) {
        noUsers.classList.remove('d-none');
        return;
    }
    noUsers.classList.add('d-none');
    users.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${user.firstName || ''} ${user.lastName || ''}</td>
            <td>${user.email || '-'}</td>
            <td><span class="badge bg-${getRoleColor(user.role)}">${user.role}</span></td>
            <td>${user.city || '-'}</td>
            <td><button class="btn btn-sm btn-outline-info" onclick="viewUser('${user.id || user.email}')">View</button></td>
        `;
        tableBody.appendChild(tr);
    });
}

function getRoleColor(role) {
    switch ((role || '').toUpperCase()) {
        case 'ADMIN': return 'primary';
        case 'DOCTOR': return 'success';
        case 'PATIENT': return 'info';
        default: return 'secondary';
    }
}

window.viewUser = function(userId) {
    // For now, just alert. You can link to a user details page or modal.
    alert('View user details: ' + userId);
    // window.location.href = `user-details.html?userId=${userId}`;
} 