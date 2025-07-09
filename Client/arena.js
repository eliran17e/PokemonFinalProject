// Arena page functionality
document.addEventListener('DOMContentLoaded', function() {
    loadUserStats();
    loadUserRank();
});

// Navigation functions
function navigateToVsBot() {
    window.location.href = '/arena/vs-bot';
}

function navigateToRandomVsPlayer() {
    window.location.href = '/arena/random-vs-player';
}

function navigateToFightHistory() {
    window.location.href = '/arena/fight-history';
}

function navigateToLeaderboard() {
    window.location.href = '/arena/leaderboard';
}

// Load user statistics
async function loadUserStats() {
    const statsElement = document.getElementById('userStats');
    
    try {
        // This will be implemented when we create the backend for arena stats
        // For now, we'll show placeholder data
        const response = await fetch('/api/arena/stats');
        
        if (response.ok) {
            const stats = await response.json();
            displayUserStats(stats);
        } else {
            // Placeholder stats for now
            displayPlaceholderStats();
        }
    } catch (error) {
        console.log('Arena stats not available yet, showing placeholder');
        displayPlaceholderStats();
    }
}

// Load user rank
async function loadUserRank() {
    const rankElement = document.getElementById('userRank');
    
    try {
        // This will be implemented when we create the backend for leaderboard
        // For now, we'll show placeholder data
        const response = await fetch('/api/arena/rank');
        
        if (response.ok) {
            const rank = await response.json();
            displayUserRank(rank);
        } else {
            // Placeholder rank for now
            displayPlaceholderRank();
        }
    } catch (error) {
        console.log('Arena rank not available yet, showing placeholder');
        displayPlaceholderRank();
    }
}

// Display user statistics
function displayUserStats(stats) {
    const statsElement = document.getElementById('userStats');
    statsElement.textContent = `${stats.wins}W - ${stats.losses}L`;
    statsElement.classList.remove('loading');
}

// Display user rank
function displayUserRank(rank) {
    const rankElement = document.getElementById('userRank');
    rankElement.textContent = `Rank #${rank.position}`;
    rankElement.classList.remove('loading');
}

// Placeholder functions (to be removed when backend is implemented)
function displayPlaceholderStats() {
    const statsElement = document.getElementById('userStats');
    statsElement.textContent = '0W - 0L';
    statsElement.classList.remove('loading');
}

function displayPlaceholderRank() {
    const rankElement = document.getElementById('userRank');
    rankElement.textContent = 'Unranked';
    rankElement.classList.remove('loading');
}

// Add keyboard navigation support
document.addEventListener('keydown', function(e) {
    const cards = document.querySelectorAll('.arena-card');
    
    switch(e.key) {
        case '1':
            navigateToVsBot();
            break;
        case '2':
            navigateToRandomVsPlayer();
            break;
        case '3':
            navigateToFightHistory();
            break;
        case '4':
            navigateToLeaderboard();
            break;
    }
});

// Add visual feedback for card interactions
document.querySelectorAll('.arena-card').forEach((card, index) => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-5px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
    
    // Add ripple effect on click
    card.addEventListener('click', function(e) {
        const ripple = document.createElement('div');
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(102, 126, 234, 0.3);
            width: 20px;
            height: 20px;
            left: ${x - 10}px;
            top: ${y - 10}px;
            pointer-events: none;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
        `;
        
        this.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// Add CSS for ripple animation
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .arena-card {
        position: relative;
        overflow: hidden;
    }
`;
document.head.appendChild(style);