// Arena VS Bot functionality
let userFavorites = [];
let selectedPokemon = null;
let botPokemon = null;

document.addEventListener('DOMContentLoaded', function() {
    loadUserFavorites();
});

// Load user's favorite Pokemon for selection
async function loadUserFavorites() {
    const favoritesGrid = document.getElementById('favoritesGrid');
    
    try {
        const response = await fetch('/api/favorites');
        
        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = '/login';
                return;
            }
            throw new Error('Failed to fetch favorites');
        }
        
        userFavorites = await response.json();
        displayFavorites();
        
    } catch (error) {
        console.error('Error loading favorites:', error);
        favoritesGrid.innerHTML = `
            <div class="error-message">
                Unable to load your Pokemon. Please try again or add some Pokemon to your favorites first.
                <br><br>
                <a href="/favorites" style="color: #48dbfb;">Go to Favorites</a>
            </div>
        `;
    }
}

// Display favorites for selection
function displayFavorites() {
    const favoritesGrid = document.getElementById('favoritesGrid');
    
    if (userFavorites.length === 0) {
        favoritesGrid.innerHTML = `
            <div class="error-message">
                You don't have any favorite Pokemon yet!
                <br><br>
                <a href="/search" style="color: #48dbfb;">Search and add Pokemon to favorites</a>
            </div>
        `;
        return;
    }
    
    favoritesGrid.innerHTML = userFavorites.map(pokemon => `
        <div class="pokemon-selection-card" onclick="selectPokemon(${pokemon.id})">
            <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
            <h4>${pokemon.name}</h4>
            <div class="pokemon-id">#${pokemon.id}</div>
            <div class="pokemon-types-selection">
                ${pokemon.types.map(type => `
                    <span class="type-badge">${type.type.name}</span>
                `).join('')}
            </div>
        </div>
    `).join('');
}

// Select a Pokemon for battle
async function selectPokemon(pokemonId) {
    selectedPokemon = userFavorites.find(p => p.id === pokemonId);
    
    if (!selectedPokemon) {
        alert('Pokemon not found!');
        return;
    }
    
    // Generate random bot Pokemon
    await generateBotPokemon();
    
    // Show battle setup phase
    showBattleSetup();
}

// Generate a random Pokemon for the bot
async function generateBotPokemon() {
    try {
        // Generate random Pokemon ID (1-1010 for all generations)
        const randomId = Math.floor(Math.random() * 1010) + 1;
        
        const response = await fetch(`/api/pokemon/${randomId}`);
        
        if (response.ok) {
            botPokemon = await response.json();
        } else {
            // Fallback to a few known Pokemon IDs if random fails
            const fallbackIds = [25, 1, 4, 7, 150, 144, 145, 146, 249, 250];
            const fallbackId = fallbackIds[Math.floor(Math.random() * fallbackIds.length)];
            
            const fallbackResponse = await fetch(`/api/pokemon/${fallbackId}`);
            if (fallbackResponse.ok) {
                botPokemon = await fallbackResponse.json();
            } else {
                throw new Error('Failed to generate bot Pokemon');
            }
        }
    } catch (error) {
        console.error('Error generating bot Pokemon:', error);
        // Use a default Pokemon as last resort
        botPokemon = {
            id: 25,
            name: 'pikachu',
            sprites: { front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png' },
            types: [{ type: { name: 'electric' } }],
            stats: [
                { stat: { name: 'hp' }, base_stat: 35 },
                { stat: { name: 'attack' }, base_stat: 55 },
                { stat: { name: 'defense' }, base_stat: 40 },
                { stat: { name: 'speed' }, base_stat: 90 }
            ]
        };
    }
}

// Show battle setup phase
function showBattleSetup() {
    document.getElementById('selectionPhase').style.display = 'none';
    document.getElementById('battleSetupPhase').style.display = 'block';
    
    // Display player Pokemon
    displayPokemonStats('player', selectedPokemon);
    
    // Display bot Pokemon
    displayPokemonStats('bot', botPokemon);
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
    document.getElementById('battlePlayerImage').src = selectedPokemon.sprites.front_default;
    document.getElementById('battlePlayerName').textContent = selectedPokemon.name;
    document.getElementById('battleBotImage').src = botPokemon.sprites.front_default;
    document.getElementById('battleBotName').textContent = botPokemon.name;
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
    const playerResult = calculateBattleScore(selectedPokemon);
    const botResult = calculateBattleScore(botPokemon);
    
    // Determine winner
    const playerWins = playerResult.score > botResult.score;
    
    // Show battle results after fight animation
    setTimeout(() => {
        showBattleResults(playerResult, botResult, playerWins);
    }, 2000);
}

// Show battle results
function showBattleResults(playerResult, botResult, playerWins) {
    const battleArena = document.querySelector('.battle-arena');
    
    // Create results overlay
    const resultsOverlay = document.createElement('div');
    resultsOverlay.className = 'battle-results-overlay';
    resultsOverlay.innerHTML = `
        <div class="battle-results">
            <h2 class="results-title">${playerWins ? '🏆 Victory!' : '💀 Defeat!'}</h2>
            
            <div class="battle-scores">
                <div class="score-card ${playerWins ? 'winner' : 'loser'}">
                    <div class="score-header">
                        <img src="${selectedPokemon.sprites.front_default}" alt="${selectedPokemon.name}">
                        <h3>${selectedPokemon.name}</h3>
                        ${playerWins ? '<div class="winner-crown">👑</div>' : ''}
                    </div>
                    <div class="final-score">
                        Final Score: ${playerResult.score}
                    </div>
                </div>
                
                <div class="vs-results">VS</div>
                
                <div class="score-card ${!playerWins ? 'winner' : 'loser'}">
                    <div class="score-header">
                        <img src="${botPokemon.sprites.front_default}" alt="${botPokemon.name}">
                        <h3>${botPokemon.name} (Bot)</h3>
                        ${!playerWins ? '<div class="winner-crown">👑</div>' : ''}
                    </div>
                    <div class="final-score">
                        Final Score: ${botResult.score}
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
}

// Battle again with same Pokemon
function battleAgain() {
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
    
    // Show battle setup phase
    document.getElementById('battleSetupPhase').style.display = 'block';
    
    // Reset battle button
    const startBattleBtn = document.getElementById('startBattleBtn');
    startBattleBtn.disabled = false;
    startBattleBtn.textContent = '⚔️ Start Battle';
    
    // Generate new bot Pokemon
    generateBotPokemon().then(() => {
        displayPokemonStats('bot', botPokemon);
    });
}

// Go back to Pokemon selection
function backToSelection() {
    document.getElementById('battleSetupPhase').style.display = 'none';
    document.getElementById('selectionPhase').style.display = 'block';
    
    selectedPokemon = null;
    botPokemon = null;
}

// Go back to main arena
function backToArena() {
    window.location.href = '/arena';
}