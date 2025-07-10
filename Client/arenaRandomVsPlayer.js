// Arena Random VS Player functionality
let onlinePlayers = [];
let selectedPlayer = null;
let currentUser = null;
let player1Pokemon = null;
let player2Pokemon = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 DOM Content Loaded - Starting arena random vs player');
    console.log('🔄 Loading current user...');
    loadCurrentUser();
    console.log('🔄 Loading online players...');
    loadOnlinePlayers();
    
    // Refresh online players every 30 seconds
    setInterval(() => {
        console.log('🔄 Auto-refreshing online players...');
        loadOnlinePlayers();
    }, 30000);
});

// Load current user information
async function loadCurrentUser() {
    try {
        const response = await fetch('/api/user');
        if (response.ok) {
            const data = await response.json();
            currentUser = data.user;
        } else {
            window.location.href = '/login';
        }
    } catch (error) {
        console.error('Error loading user info:', error);
        window.location.href = '/login';
    }
}

// Load online players list
async function loadOnlinePlayers() {
    console.log('🔄 loadOnlinePlayers() called');
    const playersList = document.getElementById('playersList');
    const onlineCount = document.getElementById('onlineCount');
    
    console.log('📍 Elements found:', {
        playersList: !!playersList,
        onlineCount: !!onlineCount
    });
    
    if (!playersList) {
        console.error('❌ playersList element not found!');
        return;
    }
    
    try {
        console.log('📡 Making API call to /api/arena/online-players...');
        const response = await fetch('/api/arena/online-players');
        
        console.log('📡 Response received:', {
            status: response.status,
            ok: response.ok,
            statusText: response.statusText
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                console.error('❌ Authentication failed - redirecting to login');
                window.location.href = '/login';
                return;
            }
            throw new Error(`API call failed: ${response.status} ${response.statusText}`);
        }
        
        onlinePlayers = await response.json();
        console.log('✅ Online players received:', onlinePlayers);
        
        displayOnlinePlayers();
        
        // Update online count
        if (onlineCount) {
            onlineCount.textContent = onlinePlayers.length;
            console.log(`📊 Updated online count: ${onlinePlayers.length}`);
        }
        
    } catch (error) {
        console.error('❌ Error loading online players:', error);
        playersList.innerHTML = `
            <div class="error-message">
                Unable to load online players: ${error.message}
                <br><br>
                <button onclick="loadOnlinePlayers()" style="background: #3498db; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
                    🔄 Retry
                </button>
            </div>
        `;
        if (onlineCount) {
            onlineCount.textContent = '0';
        }
    }
}

// Display online players
function displayOnlinePlayers() {
    console.log('🎨 displayOnlinePlayers() called with:', onlinePlayers);
    const playersList = document.getElementById('playersList');
    
    if (!playersList) {
        console.error('❌ playersList element not found in displayOnlinePlayers!');
        return;
    }
    
    if (onlinePlayers.length === 0) {
        console.log('📝 No online players - showing empty message');
        playersList.innerHTML = `
            <div class="loading-message">
                No other players online at the moment.
                <br><br>
                <button onclick="loadOnlinePlayers()" style="background: #3498db; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
                    🔄 Refresh
                </button>
            </div>
        `;
        return;
    }
    
    console.log(`🎨 Rendering ${onlinePlayers.length} online players`);
    
    playersList.innerHTML = onlinePlayers.map(player => {
        console.log(`   - Rendering player: ${player.name}`);
        return `
            <div class="player-item" onclick="selectPlayer('${player.id}')" data-player-id="${player.id}">
                <div class="player-info">
                    <div class="player-avatar">${player.name.charAt(0).toUpperCase()}</div>
                    <div class="player-details">
                        <h4>${player.name}</h4>
                        <div class="player-stats">
                            <span>Wins: ${player.wins}</span>
                            <span>Losses: ${player.losses}</span>
                            <span>Draws: ${player.draws}</span>
                        </div>
                    </div>
                </div>
                <div class="player-status">Online</div>
            </div>
        `;
    }).join('');
    
    console.log('✅ Players rendered successfully');
}

// Select a player for battle
function selectPlayer(playerId) {
    selectedPlayer = onlinePlayers.find(p => p.id === playerId);
    
    if (!selectedPlayer) {
        alert('Player not found!');
        return;
    }
    
    // Update UI to show selected player
    document.querySelectorAll('.player-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    const selectedItem = document.querySelector(`[data-player-id="${playerId}"]`);
    if (selectedItem) {
        selectedItem.classList.add('selected');
    }
    
    // Enable challenge button
    const challengeBtn = document.getElementById('challengeBtn');
    challengeBtn.disabled = false;
    challengeBtn.textContent = `⚔️ Challenge ${selectedPlayer.name}`;
}

// Refresh online players manually
function refreshOnlinePlayers() {
    const refreshBtn = document.querySelector('.refresh-btn');
    refreshBtn.textContent = '🔄 Refreshing...';
    refreshBtn.disabled = true;
    
    loadOnlinePlayers().finally(() => {
        refreshBtn.textContent = '🔄 Refresh';
        refreshBtn.disabled = false;
    });
}

// Challenge selected player
async function challengePlayer() {
    if (!selectedPlayer) {
        alert('Please select a player first!');
        return;
    }
    
    const challengeBtn = document.getElementById('challengeBtn');
    challengeBtn.disabled = true;
    challengeBtn.textContent = 'Setting up battle...';
    
    try {
        // Get current user's favorites
        const userFavoritesResponse = await fetch('/api/favorites');
        if (!userFavoritesResponse.ok) {
            throw new Error('Failed to get your favorites');
        }
        const userFavorites = await userFavoritesResponse.json();
        
        if (userFavorites.length === 0) {
            alert('You need to have favorite Pokemon to battle! Please add some Pokemon to your favorites first.');
            challengeBtn.disabled = false;
            challengeBtn.textContent = `⚔️ Challenge ${selectedPlayer.name}`;
            return;
        }
        
        // Get opponent's favorites
        const opponentFavoritesResponse = await fetch(`/api/arena/player-favorites/${selectedPlayer.id}`);
        if (!opponentFavoritesResponse.ok) {
            throw new Error('Failed to get opponent favorites');
        }
        const opponentFavorites = await opponentFavoritesResponse.json();
        
        if (opponentFavorites.length === 0) {
            alert(`${selectedPlayer.name} doesn't have any favorite Pokemon to battle with!`);
            challengeBtn.disabled = false;
            challengeBtn.textContent = `⚔️ Challenge ${selectedPlayer.name}`;
            return;
        }
        
        // Select random Pokemon for both players
        player1Pokemon = userFavorites[Math.floor(Math.random() * userFavorites.length)];
        player2Pokemon = opponentFavorites[Math.floor(Math.random() * opponentFavorites.length)];
        
        // Show battle setup phase
        showBattleSetup();
        
    } catch (error) {
        console.error('Error setting up battle:', error);
        alert('Failed to set up battle. Please try again.');
        challengeBtn.disabled = false;
        challengeBtn.textContent = `⚔️ Challenge ${selectedPlayer.name}`;
    }
}

// Show battle setup phase
function showBattleSetup() {
    document.getElementById('selectionPhase').style.display = 'none';
    document.getElementById('battleSetupPhase').style.display = 'block';
    
    // Update player names in headers
    document.getElementById('player1Name').textContent = `${currentUser.name}'s Pokemon`;
    document.getElementById('player2Name').textContent = `${selectedPlayer.name}'s Pokemon`;
    
    // Display player Pokemon
    displayPokemonStats('player1', player1Pokemon);
    
    // Display opponent Pokemon
    displayPokemonStats('player2', player2Pokemon);
}

// Display Pokemon stats in battle setup
function displayPokemonStats(side, pokemon) {
    const prefix = side;
    
    // Set image and name
    document.getElementById(`${prefix}PokemonImage`).src = pokemon.sprites.front_default;
    document.getElementById(`${prefix}PokemonName`).textContent = pokemon.name;
    
    // Set types
    const typesContainer = document.getElementById(`${prefix}PokemonTypes`);
    typesContainer.innerHTML = pokemon.types.map(type => 
        `<span class="type-badge">${type.type.name}</span>`
    ).join('');
    
    // Get stats
    const stats = getStats(pokemon);
    
    // Display stats with animations
    setTimeout(() => {
        animateStatBar(`${prefix}HP`, stats.hp, 255);
        document.getElementById(`${prefix}HPValue`).textContent = stats.hp;
    }, 100);
    
    setTimeout(() => {
        animateStatBar(`${prefix}Attack`, stats.attack, 200);
        document.getElementById(`${prefix}AttackValue`).textContent = stats.attack;
    }, 300);
    
    setTimeout(() => {
        animateStatBar(`${prefix}Defense`, stats.defense, 200);
        document.getElementById(`${prefix}DefenseValue`).textContent = stats.defense;
    }, 500);
    
    setTimeout(() => {
        animateStatBar(`${prefix}Speed`, stats.speed, 200);
        document.getElementById(`${prefix}SpeedValue`).textContent = stats.speed;
    }, 700);
}

// Get Pokemon stats
function getStats(pokemon) {
    const stats = {
        hp: 50,
        attack: 50,
        defense: 50,
        speed: 50
    };
    
    if (pokemon.stats) {
        pokemon.stats.forEach(stat => {
            const statName = stat.stat.name;
            if (statName === 'hp') stats.hp = stat.base_stat;
            else if (statName === 'attack') stats.attack = stat.base_stat;
            else if (statName === 'defense') stats.defense = stat.base_stat;
            else if (statName === 'speed') stats.speed = stat.base_stat;
        });
    }
    
    return stats;
}

// Animate stat bars
function animateStatBar(elementId, value, maxValue) {
    const statFill = document.getElementById(elementId);
    const percentage = Math.min((value / maxValue) * 100, 100);
    statFill.style.width = percentage + '%';
}

// Calculate Pokemon battle score using the formula
function calculateBattleScore(pokemon) {
    const stats = getStats(pokemon);
    const randomBonus = Math.random() * 20 - 10; // Random between -10 and +10
    
    const score = (stats.hp * 0.3) + (stats.attack * 0.4) + (stats.defense * 0.2) + (stats.speed * 0.1) + randomBonus;
    
    return {
        score: Math.round(score * 100) / 100, // Round to 2 decimal places
        stats: stats,
        randomBonus: Math.round(randomBonus * 100) / 100
    };
}

// Start the battle
function startBattle() {
    const startBattleBtn = document.getElementById('startBattleBtn');
    startBattleBtn.disabled = true;
    startBattleBtn.textContent = 'Starting Battle...';
    
    // Hide battle setup and show animation
    document.getElementById('battleSetupPhase').style.display = 'none';
    document.getElementById('battleAnimationPhase').style.display = 'block';
    
    // Set up battle arena
    setupBattleArena();
    
    // Start countdown
    startCountdown();
}

// Setup battle arena with Pokemon images
function setupBattleArena() {
    document.getElementById('battlePlayer1Image').src = player1Pokemon.sprites.front_default;
    document.getElementById('battlePlayer1Name').textContent = player1Pokemon.name;
    document.getElementById('battlePlayer2Image').src = player2Pokemon.sprites.front_default;
    document.getElementById('battlePlayer2Name').textContent = player2Pokemon.name;
}

// Start the countdown animation
function startCountdown() {
    const countdownElement = document.getElementById('countdown');
    const countdownNumber = document.getElementById('countdownNumber');
    let count = 3;
    
    const countdownInterval = setInterval(() => {
        countdownNumber.textContent = count;
        countdownNumber.style.animation = 'none';
        
        // Trigger reflow to restart animation
        countdownNumber.offsetHeight;
        countdownNumber.style.animation = 'countdownPulse 1s ease-in-out';
        
        count--;
        
        if (count < 0) {
            clearInterval(countdownInterval);
            showFightText();
        }
    }, 1000);
}

// Show "FIGHT!" text and determine winner
function showFightText() {
    const countdown = document.getElementById('countdown');
    const fightText = document.getElementById('fightText');
    
    countdown.style.display = 'none';
    fightText.style.display = 'block';
    
    // Calculate battle scores
    const player1Result = calculateBattleScore(player1Pokemon);
    const player2Result = calculateBattleScore(player2Pokemon);
    
    // Determine winner
    let result, player1Wins;
    
    if (Math.abs(player1Result.score - player2Result.score) < 0.1) {
        result = 'draw';
        player1Wins = null;
    } else {
        player1Wins = player1Result.score > player2Result.score;
        result = player1Wins ? 'player1_wins' : 'player2_wins';
    }
    
    // Show battle results after fight animation
    setTimeout(() => {
        showBattleResults(player1Result, player2Result, result);
    }, 2000);
}

// Show battle results
function showBattleResults(player1Result, player2Result, result) {
    const battleArena = document.querySelector('.battle-arena');
    
    let resultTitle, resultClass;
    switch(result) {
        case 'player1_wins':
            resultTitle = '🏆 Victory!';
            resultClass = 'victory';
            break;
        case 'player2_wins':
            resultTitle = '💀 Defeat!';
            resultClass = 'defeat';
            break;
        case 'draw':
            resultTitle = '🤝 Draw!';
            resultClass = 'draw';
            break;
    }
    
    // Create results overlay
    const resultsOverlay = document.createElement('div');
    resultsOverlay.className = 'battle-results-overlay';
    resultsOverlay.innerHTML = `
        <div class="battle-results">
            <h2 class="results-title ${resultClass}">${resultTitle}</h2>
            
            <div class="battle-scores">
                <div class="score-card ${result === 'player1_wins' ? 'winner' : result === 'draw' ? 'draw' : 'loser'}">
                    <div class="score-header">
                        <img src="${player1Pokemon.sprites.front_default}" alt="${player1Pokemon.name}">
                        <h3>${player1Pokemon.name}</h3>
                        <div class="player-name">${currentUser.name}</div>
                        ${result === 'player1_wins' ? '<div class="winner-crown">👑</div>' : ''}
                    </div>
                    <div class="final-score">
                        Final Score: ${player1Result.score}
                    </div>
                </div>
                
                <div class="vs-results">VS</div>
                
                <div class="score-card ${result === 'player2_wins' ? 'winner' : result === 'draw' ? 'draw' : 'loser'}">
                    <div class="score-header">
                        <img src="${player2Pokemon.sprites.front_default}" alt="${player2Pokemon.name}">
                        <h3>${player2Pokemon.name}</h3>
                        <div class="player-name">${selectedPlayer.name}</div>
                        ${result === 'player2_wins' ? '<div class="winner-crown">👑</div>' : ''}
                    </div>
                    <div class="final-score">
                        Final Score: ${player2Result.score}
                    </div>
                </div>
            </div>
            
            <div class="results-actions">
                <button class="battle-again-btn" onclick="battleAgain()">⚔️ Battle Again</button>
                <button class="back-to-arena-btn" onclick="backToArena()">🏛️ Back to Arena</button>
            </div>
        </div>
    `;
    
    battleArena.appendChild(resultsOverlay);
    
    // Animate results appearance
    setTimeout(() => {
        resultsOverlay.style.opacity = '1';
    }, 100);
    
    // Save battle result to backend
    saveBattleResult(player1Result, player2Result, result);
}

// Save battle result to backend
async function saveBattleResult(player1Result, player2Result, result) {
    try {
        const battleData = {
            player1Id: currentUser.id,
            player2Id: selectedPlayer.id,
            player1Pokemon: {
                id: player1Pokemon.id,
                name: player1Pokemon.name,
                sprite: player1Pokemon.sprites.front_default
            },
            player2Pokemon: {
                id: player2Pokemon.id,
                name: player2Pokemon.name,
                sprite: player2Pokemon.sprites.front_default
            },
            player1Score: player1Result.score,
            player2Score: player2Result.score,
            result: result,
            battleType: 'vs-player'
        };
        
        const response = await fetch('/api/arena/save-battle-result', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(battleData)
        });
        
        if (!response.ok) {
            console.error('Failed to save battle result');
        } else {
            console.log('Battle result saved successfully');
        }
        
    } catch (error) {
        console.error('Error saving battle result:', error);
    }
}

// Battle again with same opponent
function battleAgain() {
    console.log('🔄 Starting battle again...');
    
    // Remove any existing results overlay
    const existingOverlay = document.querySelector('.battle-results-overlay');
    if (existingOverlay) {
        existingOverlay.remove();
    }
    
    // Reset battle animation phase
    document.getElementById('battleAnimationPhase').style.display = 'none';
    
    // Reset countdown elements
    const countdown = document.getElementById('countdown');
    const fightText = document.getElementById('fightText');
    countdown.style.display = 'block';
    fightText.style.display = 'none';
    
    // Reset battle button
    const startBattleBtn = document.getElementById('startBattleBtn');
    startBattleBtn.disabled = false;
    startBattleBtn.textContent = '⚔️ Start Battle';
    
    // Generate new random Pokemon for both players
    generateNewRandomPokemon().then(() => {
        console.log('✅ New Pokemon generated, showing battle setup');
        // Show battle setup phase again
        document.getElementById('battleSetupPhase').style.display = 'block';
        
        // Update displays with new Pokemon
        displayPokemonStats('player1', player1Pokemon);
        displayPokemonStats('player2', player2Pokemon);
    }).catch(error => {
        console.error('❌ Error generating new Pokemon:', error);
        alert('Failed to generate new Pokemon. Please try again.');
        backToSelection();
    });
}

// Generate new random Pokemon for battle again
async function generateNewRandomPokemon() {
    try {
        // Get fresh favorites for both players
        const userFavoritesResponse = await fetch('/api/favorites');
        const userFavorites = await userFavoritesResponse.json();
        
        const opponentFavoritesResponse = await fetch(`/api/arena/player-favorites/${selectedPlayer.id}`);
        const opponentFavorites = await opponentFavoritesResponse.json();
        
        // Select new random Pokemon
        player1Pokemon = userFavorites[Math.floor(Math.random() * userFavorites.length)];
        player2Pokemon = opponentFavorites[Math.floor(Math.random() * opponentFavorites.length)];
        
    } catch (error) {
        console.error('Error generating new random Pokemon:', error);
        // Keep existing Pokemon if there's an error
    }
}

// Go back to player selection
function backToSelection() {
    document.getElementById('battleSetupPhase').style.display = 'none';
    document.getElementById('selectionPhase').style.display = 'block';
    
    // Reset selection
    selectedPlayer = null;
    player1Pokemon = null;
    player2Pokemon = null;
    
    // Reset challenge button
    const challengeBtn = document.getElementById('challengeBtn');
    challengeBtn.disabled = true;
    challengeBtn.textContent = '⚔️ Challenge Selected Player';
    
    // Clear player selection
    document.querySelectorAll('.player-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    // Refresh player list
    loadOnlinePlayers();
}

// Go back to main arena
function backToArena() {
    window.location.href = '/arena';
}

// Add some helper functions for better user experience

// Remove automatic logout on page unload - let the server handle session cleanup
// The server will automatically remove offline players after 5 minutes of inactivity

// Only handle logout on actual logout button clicks, not page refreshes
// This prevents users from being logged out when they refresh the page

// Remove the beforeunload event listener entirely - it causes more problems than it solves
// The server-side cleanup (every 5 minutes) is sufficient for removing offline players

// Update battle start to set flag
function startBattle() {
    console.log('⚔️ Starting battle...');
    battleInProgress = true;
    
    const startBattleBtn = document.getElementById('startBattleBtn');
    startBattleBtn.disabled = true;
    startBattleBtn.textContent = 'Starting Battle...';
    
    // Hide battle setup and show animation
    document.getElementById('battleSetupPhase').style.display = 'none';
    document.getElementById('battleAnimationPhase').style.display = 'block';
    
    // Set up battle arena
    setupBattleArena();
    
    // Start countdown
    startCountdown();
}

// Update battle results to clear flag
function showBattleResults(player1Result, player2Result, result) {
    console.log('📊 Showing battle results...');
    battleInProgress = false; // Battle is over
    
    const battleArena = document.querySelector('.battle-arena');
    
    let resultTitle, resultClass;
    switch(result) {
        case 'player1_wins':
            resultTitle = '🏆 Victory!';
            resultClass = 'victory';
            break;
        case 'player2_wins':
            resultTitle = '💀 Defeat!';
            resultClass = 'defeat';
            break;
        case 'draw':
            resultTitle = '🤝 Draw!';
            resultClass = 'draw';
            break;
    }
    
    // Create results overlay
    const resultsOverlay = document.createElement('div');
    resultsOverlay.className = 'battle-results-overlay';
    resultsOverlay.innerHTML = `
        <div class="battle-results">
            <h2 class="results-title ${resultClass}">${resultTitle}</h2>
            
            <div class="battle-scores">
                <div class="score-card ${result === 'player1_wins' ? 'winner' : result === 'draw' ? 'draw' : 'loser'}">
                    <div class="score-header">
                        <img src="${player1Pokemon.sprites.front_default}" alt="${player1Pokemon.name}">
                        <h3>${player1Pokemon.name}</h3>
                        <div class="player-name">${currentUser.name}</div>
                        ${result === 'player1_wins' ? '<div class="winner-crown">👑</div>' : ''}
                    </div>
                    <div class="final-score">
                        Final Score: ${player1Result.score}
                    </div>
                </div>
                
                <div class="vs-results">VS</div>
                
                <div class="score-card ${result === 'player2_wins' ? 'winner' : result === 'draw' ? 'draw' : 'loser'}">
                    <div class="score-header">
                        <img src="${player2Pokemon.sprites.front_default}" alt="${player2Pokemon.name}">
                        <h3>${player2Pokemon.name}</h3>
                        <div class="player-name">${selectedPlayer.name}</div>
                        ${result === 'player2_wins' ? '<div class="winner-crown">👑</div>' : ''}
                    </div>
                    <div class="final-score">
                        Final Score: ${player2Result.score}
                    </div>
                </div>
            </div>
            
            <div class="results-actions">
                <button class="battle-again-btn" onclick="battleAgain()">⚔️ Battle Again</button>
                <button class="back-to-arena-btn" onclick="backToArena()">🏛️ Back to Arena</button>
            </div>
        </div>
    `;
    
    battleArena.appendChild(resultsOverlay);
    
    // Animate results appearance
    setTimeout(() => {
        resultsOverlay.style.opacity = '1';
    }, 100);
    
    // Save battle result to backend
    saveBattleResult(player1Result, player2Result, result);
}

// Add periodic heartbeat to keep user online (instead of logout on unload)
setInterval(async function() {
    try {
        // Just make a simple request to keep the session alive and update lastSeen
        await fetch('/api/user');
    } catch (error) {
        // Ignore errors - this is just a keepalive
        console.log('Heartbeat failed (this is normal)');
    }
}, 60000); // Every minute

// Add escape key handler to go back
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const selectionPhase = document.getElementById('selectionPhase');
        const battleSetupPhase = document.getElementById('battleSetupPhase');
        const battleAnimationPhase = document.getElementById('battleAnimationPhase');
        
        if (battleSetupPhase.style.display !== 'none') {
            backToSelection();
        } else if (selectionPhase.style.display !== 'none') {
            backToArena();
        }
        // Don't allow escape during battle animation
    }
});

// Add loading states and better error handling
function showLoading(element, message = 'Loading...') {
    element.innerHTML = `
        <div class="loading-message">
            <div style="margin-bottom: 10px;">⚡</div>
            ${message}
        </div>
    `;
}
