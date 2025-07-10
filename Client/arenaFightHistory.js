// Battle History functionality
let allBattles = [];
let filteredBattles = [];

document.addEventListener('DOMContentLoaded', function() {
    loadBattleHistory();
});

// Load battle history from server
async function loadBattleHistory() {
    const battlesList = document.getElementById('battlesList');
    
    try {
        console.log('📊 Loading battle history...');
        const response = await fetch('/api/arena/battle-history');
        
        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = '/login';
                return;
            }
            throw new Error('Failed to fetch battle history');
        }
        
        allBattles = await response.json();
        filteredBattles = [...allBattles];
        
        console.log(`✅ Loaded ${allBattles.length} battles`);
        
        updateStatsSummary();
        displayBattles();
        
    } catch (error) {
        console.error('❌ Error loading battle history:', error);
        battlesList.innerHTML = `
            <div class="no-battles-message">
                <div class="no-battles-icon">⚠️</div>
                <h3>Failed to load battle history</h3>
                <p>There was an error loading your battles. Please try again.</p>
                <button onclick="loadBattleHistory()" class="battle-again-link">🔄 Retry</button>
            </div>
        `;
    }
}

// Update stats summary
function updateStatsSummary() {
    if (allBattles.length === 0) {
        // Show zeros for all stats
        document.getElementById('totalWins').textContent = '0';
        document.getElementById('totalLosses').textContent = '0';
        document.getElementById('totalDraws').textContent = '0';
        document.getElementById('totalBattles').textContent = '0';
        document.getElementById('winPercentage').textContent = '0%';
        document.getElementById('overallScore').textContent = '0';
        return;
    }
    
    let wins = 0;
    let losses = 0;
    let draws = 0;
    
    allBattles.forEach(battle => {
        const userWon = (battle.isCurrentUserPlayer1 && battle.result === 'player1_wins') ||
                       (!battle.isCurrentUserPlayer1 && battle.result === 'player2_wins');
        
        const userLost = (battle.isCurrentUserPlayer1 && battle.result === 'player2_wins') ||
                        (!battle.isCurrentUserPlayer1 && battle.result === 'player1_wins');
        
        if (userWon) {
            wins++;
        } else if (userLost) {
            losses++;
        } else if (battle.result === 'draw') {
            draws++;
        }
    });
    
    const totalBattles = wins + losses + draws;
    const winPercentage = totalBattles > 0 ? Math.round((wins / totalBattles) * 100) : 0;
    const overallScore = (wins * 3) + (draws * 1) + (losses * 0);
    
    // Update DOM
    document.getElementById('totalWins').textContent = wins;
    document.getElementById('totalLosses').textContent = losses;
    document.getElementById('totalDraws').textContent = draws;
    document.getElementById('totalBattles').textContent = totalBattles;
    document.getElementById('winPercentage').textContent = winPercentage + '%';
    document.getElementById('overallScore').textContent = overallScore;
    
    console.log(`📈 Stats: ${wins}W-${losses}L-${draws}D (${winPercentage}% win rate, ${overallScore} points)`);
}

// Display battles
function displayBattles() {
    const battlesList = document.getElementById('battlesList');
    
    if (filteredBattles.length === 0) {
        if (allBattles.length === 0) {
            battlesList.innerHTML = `
                <div class="no-battles-message">
                    <div class="no-battles-icon">⚔️</div>
                    <h3>No battles yet!</h3>
                    <p>You haven't fought any Player vs Player battles yet.</p>
                    <a href="/arena/random-vs-player" class="battle-again-link">🎯 Start Fighting</a>
                </div>
            `;
        } else {
            battlesList.innerHTML = `
                <div class="no-battles-message">
                    <div class="no-battles-icon">🔍</div>
                    <h3>No battles match your filter</h3>
                    <p>Try changing the filter options above.</p>
                </div>
            `;
        }
        return;
    }
    
    battlesList.innerHTML = filteredBattles.map(battle => {
        const userWon = (battle.isCurrentUserPlayer1 && battle.result === 'player1_wins') ||
                       (!battle.isCurrentUserPlayer1 && battle.result === 'player2_wins');
        
        const userLost = (battle.isCurrentUserPlayer1 && battle.result === 'player2_wins') ||
                        (!battle.isCurrentUserPlayer1 && battle.result === 'player1_wins');
        
        let resultClass, resultIcon, resultText;
        if (userWon) {
            resultClass = 'win';
            resultIcon = '🏆';
            resultText = 'Victory';
        } else if (userLost) {
            resultClass = 'loss';
            resultIcon = '💀';
            resultText = 'Defeat';
        } else {
            resultClass = 'draw';
            resultIcon = '🤝';
            resultText = 'Draw';
        }
        
        const userPokemon = battle.isCurrentUserPlayer1 ? battle.player1Pokemon : battle.player2Pokemon;
        const opponentPokemon = battle.isCurrentUserPlayer1 ? battle.player2Pokemon : battle.player1Pokemon;
        const opponentName = battle.isCurrentUserPlayer1 ? battle.player2Name : battle.player1Name;
        const userScore = battle.isCurrentUserPlayer1 ? battle.player1Score : battle.player2Score;
        const opponentScore = battle.isCurrentUserPlayer1 ? battle.player2Score : battle.player1Score;
        
        const battleDate = new Date(battle.timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        return `
            <div class="battle-item ${resultClass}">
                <div class="battle-header">
                    <div class="battle-result ${resultClass}">
                        <span class="result-icon">${resultIcon}</span>
                        <span>${resultText}</span>
                    </div>
                    <div class="battle-date">${battleDate}</div>
                </div>
                <div class="battle-content">
                    <div class="pokemon-info">
                        <img src="${userPokemon.sprite}" alt="${userPokemon.name}" class="pokemon-avatar">
                        <div class="pokemon-details">
                            <h4>${userPokemon.name}</h4>
                            <div class="player-name">You</div>
                            <div class="score">Score: ${userScore}</div>
                        </div>
                    </div>
                    <div class="vs-indicator">VS</div>
                    <div class="pokemon-info">
                        <img src="${opponentPokemon.sprite}" alt="${opponentPokemon.name}" class="pokemon-avatar">
                        <div class="pokemon-details">
                            <h4>${opponentPokemon.name}</h4>
                            <div class="player-name">${opponentName}</div>
                            <div class="score">Score: ${opponentScore}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Filter battles by result
function filterBattles() {
    const filterValue = document.getElementById('resultFilter').value;
    
    if (filterValue === 'all') {
        filteredBattles = [...allBattles];
    } else {
        filteredBattles = allBattles.filter(battle => {
            const userWon = (battle.isCurrentUserPlayer1 && battle.result === 'player1_wins') ||
                           (!battle.isCurrentUserPlayer1 && battle.result === 'player2_wins');
            
            const userLost = (battle.isCurrentUserPlayer1 && battle.result === 'player2_wins') ||
                            (!battle.isCurrentUserPlayer1 && battle.result === 'player1_wins');
            
            switch (filterValue) {
                case 'win':
                    return userWon;
                case 'loss':
                    return userLost;
                case 'draw':
                    return battle.result === 'draw';
                default:
                    return true;
            }
        });
    }
    
    displayBattles();
}

// Sort battles
function sortBattles() {
    const sortValue = document.getElementById('sortBy').value;
    
    switch (sortValue) {
        case 'recent':
            filteredBattles.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            break;
        case 'oldest':
            filteredBattles.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            break;
        case 'opponent':
            filteredBattles.sort((a, b) => {
                const aOpponent = a.isCurrentUserPlayer1 ? a.player2Name : a.player1Name;
                const bOpponent = b.isCurrentUserPlayer1 ? b.player2Name : b.player1Name;
                return aOpponent.localeCompare(bOpponent);
            });
            break;
    }
    
    displayBattles();
}