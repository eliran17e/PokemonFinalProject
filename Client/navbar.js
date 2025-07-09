// Navigation functionality for all pages

// Load user info when page loads
async function loadUserInfo() {
    try {
        const response = await fetch('/api/user');
        if (response.ok) {
            const data = await response.json();
            const usernameElement = document.getElementById('navUsername');
            if (usernameElement) {
                // Display the user's name instead of email
                usernameElement.textContent = data.user.name || data.user.email;
            }
        } else {
            // User not authenticated, redirect to login
            window.location.href = '/login';
        }
    } catch (error) {
        console.error('Error loading user info:', error);
        // On error, redirect to login
        window.location.href = '/login';
    }
}

// Logout function
async function logout() {
    try {
        // Show loading state on logout button
        const logoutBtn = document.querySelector('.nav-logout');
        if (logoutBtn) {
            logoutBtn.textContent = 'Logging out...';
            logoutBtn.disabled = true;
        }

        const response = await fetch('/logout', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const result = await response.json();
            // Successful logout, redirect to home
            window.location.href = '/';
        } else {
            console.error('Logout failed');
            // Even if logout fails on server, redirect to home
            window.location.href = '/';
        }
    } catch (error) {
        console.error('Logout error:', error);
        // Even if the request fails, redirect to home
        window.location.href = '/';
    }
}

// Initialize navbar when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load user info for navbar
    loadUserInfo();
    
    // Set active navigation link
    setActiveNavLink();
    
    // Add event listener for logout button if it exists
    const logoutBtn = document.querySelector('.nav-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
});

// Set active navigation link based on current page
function setActiveNavLink() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Remove active class from all links
    navLinks.forEach(link => link.classList.remove('active'));
    
    // Add active class to current page link
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (currentPath === href || 
            (currentPath.startsWith('/pokemon/') && href === '/search') ||
            (currentPath.startsWith('/arena') && href === '/arena')) {
            link.classList.add('active');
        }
    });
}

// Helper function to check if user is authenticated (can be used by other scripts)
async function checkAuthentication() {
    try {
        const response = await fetch('/api/user');
        return response.ok;
    } catch (error) {
        return false;
    }
}

// Export functions for use in other scripts if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        loadUserInfo,
        logout,
        checkAuthentication
    };
}