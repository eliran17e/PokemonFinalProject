// Add these new sections to your existing Server.js file

// Add this after the existing data paths
const ARENA_FILE = path.join(DATA_FOLDER, 'arena.json');

// Add this to the initializeDataFolder function (after the project-info.json creation)
try {
  await fs.access(ARENA_FILE);
} catch {
  // Create arena.json if it doesn't exist
  const defaultArenaData = {
    players: {},
    battles: [],
    onlinePlayers: []
  };
  await fs.writeFile(ARENA_FILE, JSON.stringify(defaultArenaData, null, 2));
  console.log('Created arena.json file');
}

// Add these helper functions for arena functionality
async function getArenaData() {
  try {
    const data = await fs.readFile(ARENA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading arena data:', error);
    return { players: {}, battles: [], onlinePlayers: [] };
  }
}

async function saveArenaData(arenaData) {
  try {
    await fs.writeFile(ARENA_FILE, JSON.stringify(arenaData, null, 2));
  } catch (error) {
    console.error('Error saving arena data:', error);
    throw error;
  }
}

async function updatePlayerStats(playerId, result) {
  const arenaData = await getArenaData();
  
  if (!arenaData.players[playerId]) {
    arenaData.players[playerId] = {
      wins: 0,
      losses: 0,
      draws: 0
    };
  }
  
  switch(result) {
    case 'win':
      arenaData.players[playerId].wins++;
      break;
    case 'loss':
      arenaData.players[playerId].losses++;
      break;
    case 'draw':
      arenaData.players[playerId].draws++;
      break;
  }
  
  await saveArenaData(arenaData);
}

async function addOnlinePlayer(user) {
  const arenaData = await getArenaData();
  const playerStats = arenaData.players[user.id] || { wins: 0, losses: 0, draws: 0 };
  
  const onlinePlayer = {
    id: user.id,
    name: user.name,
    email: user.email,
    lastSeen: new Date().toISOString(),
    wins: playerStats.wins,
    losses: playerStats.losses,
    draws: playerStats.draws
  };
  
  // Remove if already exists and add fresh entry
  arenaData.onlinePlayers = arenaData.onlinePlayers.filter(p => p.id !== user.id);
  arenaData.onlinePlayers.push(onlinePlayer);
  
  await saveArenaData(arenaData);
}

async function removeOnlinePlayer(userId) {
  const arenaData = await getArenaData();
  arenaData.onlinePlayers = arenaData.onlinePlayers.filter(p => p.id !== userId);
  await saveArenaData(arenaData);
}

async function cleanupOfflinePlayers() {
  const arenaData = await getArenaData();
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  
  arenaData.onlinePlayers = arenaData.onlinePlayers.filter(player => {
    return new Date(player.lastSeen) > fiveMinutesAgo;
  });
  
  await saveArenaData(arenaData);
}

// Middleware to track online players
app.use((req, res, next) => {
  if (req.session.user) {
    addOnlinePlayer(req.session.user).catch(console.error);
  }
  next();
});

// Cleanup offline players every 5 minutes
setInterval(cleanupOfflinePlayers, 5 * 60 * 1000);

// Add these new API routes for arena functionality

// API route to get online players
app.get('/api/arena/online-players', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  try {
    await cleanupOfflinePlayers();
    const arenaData = await getArenaData();
    res.json(arenaData.onlinePlayers);
  } catch (error) {
    console.error('Error getting online players:', error);
    res.status(500).json({ error: 'Failed to get online players' });
  }
});

// API route to get player favorites by ID
app.get('/api/arena/player-favorites/:playerId', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  try {
    const playerId = req.params.playerId;
    
    // Get all users to find the player's email
    const users = await getUsers();
    const player = users.find(u => u.id === playerId);
    
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }
    
    // Get player's favorites
    const safeFolderName = player.email.replace(/[@.]/g, '_');
    const favoritesFile = path.join(DATA_FOLDER, safeFolderName, 'favorites.json');
    
    try {
      const data = await fs.readFile(favoritesFile, 'utf8');
      const favorites = JSON.parse(data);
      res.json(favorites);
    } catch {
      res.json([]); // Return empty array if no favorites
    }
  } catch (error) {
    console.error('Error getting player favorites:', error);
    res.status(500).json({ error: 'Failed to get player favorites' });
  }
});

// API route to save battle result
app.post('/api/arena/save-battle-result', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  try {
    const {
      player1Id,
      player2Id,
      player1Pokemon,
      player2Pokemon,
      player1Score,
      player2Score,
      result,
      timestamp
    } = req.body;
    
    // Save battle record
    const arenaData = await getArenaData();
    
    const battleRecord = {
      id: Date.now().toString(),
      player1Id,
      player2Id,
      player1Pokemon,
      player2Pokemon,
      player1Score,
      player2Score,
      result,
      timestamp
    };
    
    arenaData.battles.push(battleRecord);
    
    // Update player stats
    if (result === 'player1_wins') {
      await updatePlayerStats(player1Id, 'win');
      await updatePlayerStats(player2Id, 'loss');
    } else if (result === 'player2_wins') {
      await updatePlayerStats(player1Id, 'loss');
      await updatePlayerStats(player2Id, 'win');
    } else if (result === 'draw') {
      await updatePlayerStats(player1Id, 'draw');
      await updatePlayerStats(player2Id, 'draw');
    }
    
    await saveArenaData(arenaData);
    
    res.json({ message: 'Battle result saved successfully' });
    
  } catch (error) {
    console.error('Error saving battle result:', error);
    res.status(500).json({ error: 'Failed to save battle result' });
  }
});

// API route to get player stats
app.get('/api/arena/stats', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  try {
    const arenaData = await getArenaData();
    const stats = arenaData.players[req.session.user.id] || { wins: 0, losses: 0, draws: 0 };
    res.json(stats);
  } catch (error) {
    console.error('Error getting player stats:', error);
    res.status(500).json({ error: 'Failed to get player stats' });
  }
});

// API route to get player rank
app.get('/api/arena/rank', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  try {
    const arenaData = await getArenaData();
    
    // Calculate rankings based on wins
    const players = Object.entries(arenaData.players).map(([id, stats]) => ({
      id,
      ...stats,
      totalBattles: stats.wins + stats.losses + stats.draws,
      winRate: stats.wins + stats.losses + stats.draws > 0 ? 
        (stats.wins / (stats.wins + stats.losses + stats.draws)) : 0
    }));
    
    // Sort by wins (descending), then by win rate
    players.sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      return b.winRate - a.winRate;
    });
    
    const playerRank = players.findIndex(p => p.id === req.session.user.id) + 1;
    
    res.json({ 
      position: playerRank > 0 ? playerRank : 'Unranked',
      totalPlayers: players.length
    });
  } catch (error) {
    console.error('Error getting player rank:', error);
    res.status(500).json({ error: 'Failed to get player rank' });
  }
});

// API route to get battle history
app.get('/api/arena/battle-history', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  try {
    const arenaData = await getArenaData();
    const userId = req.session.user.id;
    
    // Get battles involving current user
    const userBattles = arenaData.battles.filter(battle => 
      battle.player1Id === userId || battle.player2Id === userId
    );
    
    // Sort by timestamp (most recent first)
    userBattles.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Get user names for battles
    const users = await getUsers();
    const userMap = {};
    users.forEach(user => {
      userMap[user.id] = user.name;
    });
    
    const enrichedBattles = userBattles.map(battle => ({
      ...battle,
      player1Name: userMap[battle.player1Id] || 'Unknown',
      player2Name: userMap[battle.player2Id] || 'Unknown',
      isCurrentUserPlayer1: battle.player1Id === userId
    }));
    
    res.json(enrichedBattles);
  } catch (error) {
    console.error('Error getting battle history:', error);
    res.status(500).json({ error: 'Failed to get battle history' });
  }
});

// API route to get leaderboard
app.get('/api/arena/leaderboard', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  try {
    const arenaData = await getArenaData();
    const users = await getUsers();
    
    // Create user map
    const userMap = {};
    users.forEach(user => {
      userMap[user.id] = user.name;
    });
    
    // Calculate leaderboard
    const leaderboard = Object.entries(arenaData.players).map(([id, stats]) => ({
      id,
      name: userMap[id] || 'Unknown',
      wins: stats.wins,
      losses: stats.losses,
      draws: stats.draws,
      totalBattles: stats.wins + stats.losses + stats.draws,
      winRate: stats.wins + stats.losses + stats.draws > 0 ? 
        ((stats.wins / (stats.wins + stats.losses + stats.draws)) * 100).toFixed(1) : 0
    }));
    
    // Sort by wins (descending), then by win rate
    leaderboard.sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      return parseFloat(b.winRate) - parseFloat(a.winRate);
    });
    
    // Add rank to each player
    leaderboard.forEach((player, index) => {
      player.rank = index + 1;
    });
    
    res.json(leaderboard);
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
});

// Update the logout route to remove player from online list
app.post('/logout', async (req, res) => {
  const userId = req.session.user ? req.session.user.id : null;
  const email = req.session.user ? req.session.user.email : 'Unknown';
  
  if (userId) {
    try {
      await removeOnlinePlayer(userId);
    } catch (error) {
      console.error('Error removing online player:', error);
    }
  }
  
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Could not log out' });
    }
    console.log('User logged out:', email);
    res.json({ message: 'Logged out successfully', redirect: '/' });
  });
});