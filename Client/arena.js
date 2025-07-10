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
        const response = await fetch('/api/arena/stats');
        
        if (response.ok) {
            const stats = await response.json();
            displayUserStats(stats);
        } else {
            // Show placeholder if not available
            displayPlaceholderStats();
        }
    } catch (error) {
        console.error('Error loading user stats:', error);
        displayPlaceholderStats();
    }
}

// Load user rank
async function loadUserRank() {
    const rankElement = document.getElementById('userRank');
    
    try {
        const response = await fetch('/api/arena/rank');
        
        if (response.ok) {
            const rank = await response.json();
            displayUserRank(rank);
        } else {
            displayPlaceholderRank();
        }
    } catch (error) {
        console.error('Error loading user rank:', error);
        displayPlaceholderRank();
    }
}

// Display user statistics (only from player vs player battles)
function displayUserStats(stats) {
    const statsElement = document.getElementById('userStats');
    const totalBattles = stats.wins + stats.losses + stats.draws;
    
    if (totalBattles === 0) {
        statsElement.textContent = 'No PvP battles yet';
        statsElement.title = 'Player vs Player battle statistics (Bot battles not counted)';
    } else {
        statsElement.textContent = `${stats.wins}W - ${stats.losses}L - ${stats.draws}D (PvP)`;
        statsElement.title = `Player vs Player: ${stats.wins} wins, ${stats.losses} losses, ${stats.draws} draws`;
    }
    
    statsElement.classList.remove('loading');
}

// Display user rank (only from player vs player battles)
function displayUserRank(rank) {
    const rankElement = document.getElementById('userRank');
    
    if (rank.position === 'Unranked') {
        rankElement.textContent = 'Unranked (PvP)';
        rankElement.title = 'Ranking based on Player vs Player battles only';
    } else {
        rankElement.textContent = `Rank #${rank.position} (PvP)`;
        rankElement.title = `Player vs Player ranking: #${rank.position} out of ${rank.totalPlayers} players`;
    }
    
    rankElement.classList.remove('loading');
}

// Placeholder functions (for when backend is not available)
function displayPlaceholderStats() {
    const statsElement = document.getElementById('userStats');
    statsElement.textContent = 'No PvP battles yet';
    statsElement.title = 'Player vs Player battle statistics (Bot battles not counted)';
    statsElement.classList.remove('loading');
}

function displayPlaceholderRank() {
    const rankElement = document.getElementById('userRank');
    rankElement.textContent = 'Unranked (PvP)';
    rankElement.title = 'Ranking based on Player vs Player battles only';
    rankElement.classList.remove('loading');
}

// Add keyboard navigation support
document.addEventListener('keydown', function(e) {
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
    
    .loading {
        color: #95a5a6;
        font-style: italic;
    }
`;
document.head.appendChild(style);

// Auto-refresh stats every 30 seconds
setInterval(() => {
    loadUserStats();
    loadUserRank();
}, 30000);