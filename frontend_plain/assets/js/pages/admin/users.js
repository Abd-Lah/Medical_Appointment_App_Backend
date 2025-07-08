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
        let actions = `<button class="btn btn-sm btn-outline-info me-1" onclick="viewUser('${user.id || user.email}')">View</button>`;
        if (user.role === 'DOCTOR' && user.status && user.status.toUpperCase() === 'PENDING') {
            actions += `<button class="btn btn-sm btn-success me-1" onclick="validateDoctor('${user.id}')">Validate</button>`;
            actions += `<button class="btn btn-sm btn-danger" onclick="rejectDoctor('${user.id}')">Reject</button>`;
        }
        actions += `<button class="btn btn-sm btn-outline-danger ms-1" onclick="deleteUser('${user.id}')">Delete</button>`;
        tr.innerHTML = `
            <td>${user.firstName || ''} ${user.lastName || ''}</td>
            <td>${user.email || '-'}</td>
            <td><span class="badge bg-${getRoleColor(user.role)}">${user.role}</span></td>
            <td>${user.city || '-'}</td>
            <td>${actions}</td>
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

window.viewUser = async function(userId) {
    // Fetch user details and show in modal
    let user = null;
    try {
        const res = await api.get(`/api/user/${userId}`);
        user = res.data;
    } catch (e) {
        notificationService.error('Failed to load user details.');
        return;
    }
    const body = document.getElementById('userDetailsBody');
    const footer = document.getElementById('userDetailsFooter');
    body.innerHTML = `
        <div><strong>Name:</strong> ${user.firstName || ''} ${user.lastName || ''}</div>
        <div><strong>Email:</strong> ${user.email || '-'}</div>
        <div><strong>Role:</strong> ${user.role}</div>
        <div><strong>City:</strong> ${user.city || '-'}</div>
        <div><strong>Status:</strong> ${user.status || '-'}</div>
    `;
    footer.innerHTML = '';
    if (user.role === 'DOCTOR' && user.status && user.status.toUpperCase() === 'PENDING') {
        footer.innerHTML += `<button class="btn btn-success me-2" onclick="validateDoctor('${user.id}', true)">Validate</button>`;
        footer.innerHTML += `<button class="btn btn-danger" onclick="rejectDoctor('${user.id}', true)">Reject</button>`;
    }
    footer.innerHTML += `<button class="btn btn-outline-danger ms-2" onclick="deleteUser('${user.id}', true)">Delete</button>`;
    new bootstrap.Modal(document.getElementById('userDetailsModal')).show();
};

window.validateDoctor = function(userId, fromModal) {
    showConfirmAction('Validate Doctor', 'Are you sure you want to validate this doctor account?', async () => {
        try {
            await api.put(`/api/admin/validate-doctor/${userId}`);
            notificationService.success('Doctor validated successfully!');
            if (fromModal) bootstrap.Modal.getInstance(document.getElementById('userDetailsModal')).hide();
            await fetchAndRenderUsers();
        } catch (e) {
            notificationService.error('Failed to validate doctor.');
        }
    });
};

window.rejectDoctor = function(userId, fromModal) {
    showConfirmAction('Reject Doctor', 'Are you sure you want to reject (disable) this doctor account?', async () => {
        try {
            await api.put(`/api/admin/reject-doctor/${userId}`);
            notificationService.success('Doctor rejected/disabled successfully!');
            if (fromModal) bootstrap.Modal.getInstance(document.getElementById('userDetailsModal')).hide();
            await fetchAndRenderUsers();
        } catch (e) {
            notificationService.error('Failed to reject doctor.');
        }
    });
};

window.deleteUser = function(userId, fromModal) {
    showConfirmAction('Delete User', 'Are you sure you want to delete this user? This action cannot be undone.', async () => {
        try {
            await api.delete(`/api/user/${userId}`);
            notificationService.success('User deleted successfully!');
            if (fromModal) bootstrap.Modal.getInstance(document.getElementById('userDetailsModal')).hide();
            await fetchAndRenderUsers();
        } catch (e) {
            notificationService.error('Failed to delete user.');
        }
    });
};

function showConfirmAction(title, message, onConfirm) {
    document.getElementById('confirmActionTitle').textContent = title;
    document.getElementById('confirmActionBody').textContent = message;
    const btn = document.getElementById('confirmActionBtn');
    btn.onclick = async function() {
        btn.disabled = true;
        await onConfirm();
        btn.disabled = false;
        bootstrap.Modal.getInstance(document.getElementById('confirmActionModal')).hide();
    };
    new bootstrap.Modal(document.getElementById('confirmActionModal')).show();
} 