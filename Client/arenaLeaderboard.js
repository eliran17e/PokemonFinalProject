// Leaderboard functionality
let leaderboardData = [];
let currentUser = null;

document.addEventListener('DOMContentLoaded', function() {
    loadCurrentUser();
    loadLeaderboard();
});

// Load current user info
async function loadCurrentUser() {
    try {
        const response = await fetch('/api/user');
        if (response.ok) {
            const data = await response.json();
            currentUser = data.user;
        }
    } catch (error) {
        console.error('Error loading user info:', error);
    }
}

// Load leaderboard from server
async function loadLeaderboard() {
    const leaderboardTable = document.getElementById('leaderboardTable');
    
    try {
        console.log('🏆 Loading leaderboard...');
        
        // Show loading state
        leaderboardTable.innerHTML = '<div class="loading-message">Loading leaderboard...</div>';
        
        const response = await fetch('/api/arena/leaderboard');
        
        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = '/login';
                return;
            }
            throw new Error('Failed to fetch leaderboard');
        }
        
        leaderboardData = await response.json();
        
        console.log(`✅ Loaded ${leaderboardData.length} players`);
        
        displayLeaderboard();
        displayUserPosition();
        
    } catch (error) {
        console.error('❌ Error loading leaderboard:', error);
        leaderboardTable.innerHTML = `
            <div class="no-players-message">
                <div class="no-players-icon">⚠️</div>
                <h3>Failed to load leaderboard</h3>
                <p>There was an error loading the leaderboard. Please try again.</p>
                <button onclick="loadLeaderboard()" style="background: #3498db; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">🔄 Retry</button>
            </div>
        `;
    }
}

// Display leaderboard
function displayLeaderboard() {
    const leaderboardTable = document.getElementById('leaderboardTable');
    
    if (leaderboardData.length === 0) {
        leaderboardTable.innerHTML = `
            <div class="no-players-message">
                <div class="no-players-icon">🏆</div>
                <h3>No players on leaderboard yet!</h3>
                <p>Be the first to fight and claim your spot!</p>
                <a href="/arena/random-vs-player" style="background: #3498db; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; display: inline-block; margin-top: 10px;">🎯 Start Fighting</a>
            </div>
        `;
        return;
    }
    
    // Generate table HTML
    let tableHTML = `
        <div class="table-header">
            <div>Rank</div>
            <div>Player</div>
            <div>Wins</div>
            <div>Losses</div>
            <div>Draws</div>
            <div>Win %</div>
            <div>Score</div>
        </div>
    `;
    
    tableHTML += leaderboardData.map(player => {
        const isCurrentUser = currentUser && player.id === currentUser.id;
        
        let rankClass = '';
        if (player.rank === 1) rankClass = 'top-1';
        else if (player.rank === 2) rankClass = 'top-2';
        else if (player.rank === 3) rankClass = 'top-3';
        
        return `
            <div class="leaderboard-row ${isCurrentUser ? 'current-user' : ''}">
                <div class="rank ${rankClass}">${player.rank}</div>
                <div class="player-info">
                    <div class="player-avatar">${player.name.charAt(0).toUpperCase()}</div>
                    <div class="player-name">${player.name}${isCurrentUser ? ' (You)' : ''}</div>
                </div>
                <div class="stat-cell">${player.wins}</div>
                <div class="stat-cell">${player.losses}</div>
                <div class="stat-cell">${player.draws}</div>
                <div class="stat-cell win-percentage">${player.winPercentage}%</div>
                <div class="stat-cell overall-score">${player.overallScore}</div>
            </div>
        `;
    }).join('');
    
    leaderboardTable.innerHTML = tableHTML;
    
    console.log(`✅ Displayed ${leaderboardData.length} players on leaderboard`);
}

// Display user's position separately if they're not in top visible rankings
function displayUserPosition() {
    const userPositionDiv = document.getElementById('userPosition');
    const userPositionCard = document.getElementById('userPositionCard');
    
    if (!currentUser || leaderboardData.length === 0) {
        userPositionDiv.style.display = 'none';
        return;
    }
    
    const userEntry = leaderboardData.find(player => player.id === currentUser.id);
    
    if (!userEntry) {
        // User has no battles yet
        userPositionDiv.style.display = 'block';
        userPositionCard.innerHTML = `
            <div class="leaderboard-row current-user">
                <div class="rank">-</div>
                <div class="player-info">
                    <div class="player-avatar">${currentUser.name.charAt(0).toUpperCase()}</div>
                    <div class="player-name">${currentUser.name} (You)</div>
                </div>
                <div class="stat-cell">0</div>
                <div class="stat-cell">0</div>
                <div class="stat-cell">0</div>
                <div class="stat-cell win-percentage">0%</div>
                <div class="stat-cell overall-score">0</div>
            </div>
            <p style="text-align: center; margin-top: 10px; color: #7f8c8d; font-style: italic;">
                Start fighting to appear on the leaderboard!
            </p>
        `;
        return;
    }
    
    // If user is in top 10, don't show separate position (they're already visible)
    if (userEntry.rank <= 10) {
        userPositionDiv.style.display = 'none';
        return;
    }
    
    // Show user's position if they're ranked lower than top 10
    userPositionDiv.style.display = 'block';
    
    const winPercentage = userEntry.totalBattles > 0 ? 
        Math.round((userEntry.wins / userEntry.totalBattles) * 100) : 0;
    
    const overallScore = (userEntry.wins * 3) + (userEntry.draws * 1) + (userEntry.losses * 0);
    
    userPositionCard.innerHTML = `
        <div class="leaderboard-row current-user">
            <div class="rank">${userEntry.rank}</div>
            <div class="player-info">
                <div class="player-avatar">${currentUser.name.charAt(0).toUpperCase()}</div>
                <div class="player-name">${currentUser.name} (You)</div>
            </div>
            <div class="stat-cell">${userEntry.wins}</div>
            <div class="stat-cell">${userEntry.losses}</div>
            <div class="stat-cell">${userEntry.draws}</div>
            <div class="stat-cell win-percentage">${winPercentage}%</div>
            <div class="stat-cell overall-score">${overallScore}</div>
        </div>
        <p style="text-align: center; margin-top: 10px; color: #7f8c8d; font-style: italic;">
            ${userEntry.rank <= leaderboardData.length / 2 ? 
                'Great job! You\'re in the top half!' : 
                'Keep fighting to climb the ranks!'}
        </p>
    `;
}