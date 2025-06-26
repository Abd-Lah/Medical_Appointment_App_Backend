// Menu utility for role-based navbar
function showContentForRole(role) {
    if (!role) {
        console.warn('showContentForRole: No role provided');
        return;
    }
    
    document.querySelectorAll('.role-content').forEach(item => {
        if (item && item.classList && typeof item.classList.contains === 'function') {
            item.style.display = item.classList.contains('role-' + role.toLowerCase()) ? '' : 'none';
        }
    });
}

function showMenuForRole(role) {
    if (!role) {
        console.warn('showMenuForRole: No role provided');
        return;
    }
    
    console.log('Showing menu for role:', role);
    
    const navItems = document.querySelectorAll('.nav-item');
    console.log('Found nav items:', navItems.length);
    
    navItems.forEach((item, index) => {
        // Check if item exists and has classList property
        if (!item || !item.classList || typeof item.classList.contains !== 'function') {
            console.warn(`Nav item ${index} is not a valid DOM element or missing classList`);
            return; // Skip this item if it's not a valid DOM element
        }
        
        // Hide by default
        item.style.display = 'none';
        
        // Show if the item has the class for this role
        const roleClass = 'role-' + role.toLowerCase();
        if (item.classList.contains(roleClass)) {
            item.style.display = '';
            console.log(`Showing nav item with class: ${roleClass}`);
        }
    });
    
    showContentForRole(role);
}

// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.showMenuForRole = showMenuForRole;
    window.showContentForRole = showContentForRole;
} 