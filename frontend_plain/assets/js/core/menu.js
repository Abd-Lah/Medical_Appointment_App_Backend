// Menu utility for role-based navbar
function showContentForRole(role) {
    if (!role) {
        // showContentForRole: No role provided
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
        // showMenuForRole: No role provided
        return;
    }
    
    // Showing menu for role
    
    const navItems = document.querySelectorAll('.nav-item');
    // Found nav items
    
    navItems.forEach((item, index) => {
        // Check if item exists and has classList property
        if (!item || !item.classList || typeof item.classList.contains !== 'function') {
            // Nav item is not a valid DOM element or missing classList
            return; // Skip this item if it's not a valid DOM element
        }
        
        // Check if this nav item has any role class
        const hasRoleClass = Array.from(item.classList).some(className => 
            className.startsWith('role-')
        );
        
        // Only process nav items that have role classes
        if (hasRoleClass) {
            // Hide by default
            item.style.display = 'none';
            
            // Show if the item has the class for this role
            const roleClass = 'role-' + role.toLowerCase();
            if (item.classList.contains(roleClass)) {
                item.style.display = '';
                // Showing nav item with class
            }
        }
        // If nav item doesn't have role class, leave it as is (visible)
    });
    
    showContentForRole(role);
}

// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.showMenuForRole = showMenuForRole;
    window.showContentForRole = showContentForRole;
} 