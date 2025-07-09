const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs').promises;
const fetch = require('node-fetch');
const app = express();
const PORT = 3000;

// Configure session middleware
app.use(session({
  secret: 'pokemon-secret-key-2025', // Change this in production
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true if using HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Middleware to parse form data with increased limits
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));

// Serve static files from Client folder
app.use(express.static('Client'));

// Data folder path
const DATA_FOLDER = path.join(__dirname, 'Data');
const USERS_FILE = path.join(DATA_FOLDER, 'users.json');
const PROJECT_INFO_FILE = path.join(DATA_FOLDER, 'project-info.json');

// YouTube API configuration
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Initialize data folder and files if they don't exist
async function initializeDataFolder() {
  try {
    await fs.mkdir(DATA_FOLDER, { recursive: true });
    
    try {
      await fs.access(USERS_FILE);
    } catch {
      // Create users.json if it doesn't exist
      await fs.writeFile(USERS_FILE, JSON.stringify([], null, 2));
      console.log('Created users.json file');
    }
    
    try {
      await fs.access(PROJECT_INFO_FILE);
    } catch {
      // Create project-info.json if it doesn't exist
      const defaultProjectInfo = {
        projectName: "Pokemon Explorer",
        description: "A comprehensive Pokemon discovery platform",
        version: "1.0.0",
        submittedBy: []
      };
      await fs.writeFile(PROJECT_INFO_FILE, JSON.stringify(defaultProjectInfo, null, 2));
      console.log('Created project-info.json file');
    }
  } catch (error) {
    console.error('Error initializing data folder:', error);
  }
}

// Helper function to read users from file
async function getUsers() {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users:', error);
    return [];
  }
}

// Helper function to save users to file
async function saveUsers(users) {
  try {
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error saving users:', error);
    throw error;
  }
}

// Helper function to validate name (max 50 chars, letters only)
function validateName(name) {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Name is required' };
  }
  
  const trimmedName = name.trim();
  
  if (trimmedName.length === 0) {
    return { valid: false, error: 'Name is required' };
  }
  
  if (trimmedName.length > 50) {
    return { valid: false, error: 'Name must be 50 characters or less' };
  }
  
  const nameRegex = /^[A-Za-z\s]+$/;
  if (!nameRegex.test(trimmedName)) {
    return { valid: false, error: 'Name can only contain letters and spaces' };
  }
  
  return { valid: true, value: trimmedName };
}

// Helper function to validate email
function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' };
  }
  
  const trimmedEmail = email.trim().toLowerCase();
  
  if (trimmedEmail.length === 0) {
    return { valid: false, error: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return { valid: false, error: 'Please enter a valid email address' };
  }
  
  return { valid: true, value: trimmedEmail };
}

// Helper function to validate password (7-15 chars, 1 uppercase, 1 lowercase, 1 special char)
function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Password is required' };
  }
  
  const errors = [];
  
  if (password.length < 7) {
    errors.push('at least 7 characters');
  }
  
  if (password.length > 15) {
    errors.push('maximum 15 characters');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('one lowercase letter');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('one special character');
  }
  
  if (errors.length > 0) {
    return { valid: false, error: `Password must contain: ${errors.join(', ')}` };
  }
  
  return { valid: true, value: password };
}

// Helper function to optimize Pokemon data for storage
function optimizePokemonData(pokemon) {
  return {
    id: pokemon.id,
    name: pokemon.name,
    sprites: {
      front_default: pokemon.sprites.front_default
    },
    types: pokemon.types.map(t => ({
      type: { name: t.type.name }
    })),
    abilities: pokemon.abilities.map(a => ({
      ability: { name: a.ability.name }
    })),
    height: pokemon.height,
    weight: pokemon.weight,
    base_experience: pokemon.base_experience,
    stats: pokemon.stats.map(s => ({
      stat: { name: s.stat.name },
      base_stat: s.base_stat
    })),
    moves: pokemon.moves.slice(0, 10).map(m => ({
      move: { name: m.move.name }
    })),
    cries: pokemon.cries || null
  };
}

// Helper function to create user folder
async function createUserFolder(email) {
  // Use email as folder name (replace @ and . with safe characters)
  const safeFolderName = email.replace(/[@.]/g, '_');
  const userFolder = path.join(DATA_FOLDER, safeFolderName);
  try {
    await fs.mkdir(userFolder, { recursive: true });
    
    // Create favorites.json for the user
    const favoritesFile = path.join(userFolder, 'favorites.json');
    await fs.writeFile(favoritesFile, JSON.stringify([], null, 2));
    
    console.log(`Created folder and favorites file for user: ${email}`);
  } catch (error) {
    console.error('Error creating user folder:', error);
    throw error;
  }
}

// Route for home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Client', 'index.html'));
});

// Route for search page (protected)
app.get('/search', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  res.sendFile(path.join(__dirname, 'Client', 'pokemonSearch.html'));
});

// Route for register page
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'Client', 'register.html'));
});

// Route for login page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'Client', 'login.html'));
});

// Route for favorites page (protected)
app.get('/favorites', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  res.sendFile(path.join(__dirname, 'Client', 'pokemonFavorites.html'));
});

// Route for Pokemon details page (protected)
app.get('/pokemon/:id', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  res.sendFile(path.join(__dirname, 'Client', 'pokemonDetails.html'));
});

// Arena routes (all protected)
app.get('/arena', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  res.sendFile(path.join(__dirname, 'Client', 'arena.html'));
});

app.get('/arena/vs-bot', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  res.sendFile(path.join(__dirname, 'Client', 'arenaVsBot.html'));
});

app.get('/arena/random-vs-player', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  res.sendFile(path.join(__dirname, 'Client', 'arenaRandomVsPlayer.html'));
});

app.get('/arena/fight-history', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  res.sendFile(path.join(__dirname, 'Client', 'arenaFightHistory.html'));
});

app.get('/arena/leaderboard', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  res.sendFile(path.join(__dirname, 'Client', 'arenaLeaderboard.html'));
});

// API route to get project information
app.get('/api/project-info', async (req, res) => {
  try {
    const data = await fs.readFile(PROJECT_INFO_FILE, 'utf8');
    const projectInfo = JSON.parse(data);
    res.json(projectInfo);
  } catch (error) {
    console.error('Error reading project info:', error);
    res.status(500).json({ error: 'Failed to load project information' });
  }
});

// API route to get Pokemon by ID (proxy to PokeAPI)
app.get('/api/pokemon/:id', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const pokemonId = req.params.id;
    console.log('Fetching Pokemon ID:', pokemonId); // Debug log
    
    // Validate Pokemon ID
    if (!pokemonId || pokemonId.trim() === '') {
      return res.status(400).json({ error: 'Invalid Pokemon ID' });
    }
    
    // First, try to find the Pokemon in user's favorites
    const email = req.session.user.email;
    const safeFolderName = email.replace(/[@.]/g, '_');
    const favoritesFile = path.join(DATA_FOLDER, safeFolderName, 'favorites.json');
    
    try {
      const data = await fs.readFile(favoritesFile, 'utf8');
      const favorites = JSON.parse(data);
      const favoritePokemon = favorites.find(p => p.id.toString() === pokemonId);
      
      if (favoritePokemon) {
        console.log('Found Pokemon in favorites:', favoritePokemon.name);
        return res.json(favoritePokemon);
      }
    } catch (error) {
      console.log('No favorites file or error reading it, fetching from API');
    }
    
    // If not found in favorites, fetch from PokeAPI
    console.log('Fetching from PokeAPI for ID:', pokemonId);
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
    
    if (!response.ok) {
      console.log('PokeAPI response not ok:', response.status);
      return res.status(response.status).json({ error: 'Pokemon not found' });
    }
    
    const pokemonData = await response.json();
    console.log('Received Pokemon data from API:', pokemonData.name);
    
    const optimizedData = optimizePokemonData(pokemonData);
    console.log('Sending optimized data');
    
    res.json(optimizedData);
    
  } catch (error) {
    console.error('Error fetching Pokemon:', error);
    res.status(500).json({ error: 'Failed to fetch Pokemon data', details: error.message });
  }
});

// Handle registration with improved validation
app.post('/register', async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    
    // Validate all fields
    const nameValidation = validateName(name);
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);
    
    const fieldErrors = {};
    
    if (!nameValidation.valid) {
      fieldErrors.name = nameValidation.error;
    }
    
    if (!emailValidation.valid) {
      fieldErrors.email = emailValidation.error;
    }
    
    if (!passwordValidation.valid) {
      fieldErrors.password = passwordValidation.error;
    }
    
    // Check password confirmation
    if (password !== confirmPassword) {
      fieldErrors.confirmPassword = 'Passwords do not match';
    }
    
    // If there are validation errors, return them
    if (Object.keys(fieldErrors).length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        fieldErrors 
      });
    }
    
    const users = await getUsers();
    
    // Check if email already exists
    if (users.find(user => user.email === emailValidation.value)) {
      return res.status(400).json({ 
        error: 'Email already exists',
        fieldErrors: { email: 'This email is already registered' }
      });
    }
    
    // Create new user
    const newUser = {
      id: Date.now().toString(),
      name: nameValidation.value,
      email: emailValidation.value,
      password: passwordValidation.value, // In production, hash this password!
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    await saveUsers(users);
    await createUserFolder(newUser.email); // Use email as folder name
    
    console.log('New user registered:', newUser.email);
    res.json({ message: 'Registration successful', redirect: '/login' });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Handle login with email instead of username
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const emailValidation = validateEmail(email);
    const fieldErrors = {};
    
    if (!emailValidation.valid) {
      fieldErrors.email = emailValidation.error;
    }
    
    if (!password) {
      fieldErrors.password = 'Password is required';
    }
    
    if (Object.keys(fieldErrors).length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        fieldErrors 
      });
    }
    
    const users = await getUsers();
    const user = users.find(u => u.email === emailValidation.value && u.password === password);
    
    if (!user) {
      return res.status(400).json({ 
        error: 'Invalid credentials',
        fieldErrors: { 
          email: 'Invalid email or password',
          password: 'Invalid email or password'
        }
      });
    }
    
    // Create session
    req.session.user = { 
      id: user.id,
      name: user.name,
      email: user.email 
    };
    console.log('User logged in:', user.email);
    
    res.json({ message: 'Login successful', redirect: '/search' });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user info
app.get('/api/user', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  res.json({ user: req.session.user });
});

// Logout
app.post('/logout', (req, res) => {
  const email = req.session.user ? req.session.user.email : 'Unknown';
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Could not log out' });
    }
    console.log('User logged out:', email);
    res.json({ message: 'Logged out successfully', redirect: '/' });
  });
});

// API route to get user's favorites
app.get('/api/favorites', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  try {
    const email = req.session.user.email;
    const safeFolderName = email.replace(/[@.]/g, '_');
    const favoritesFile = path.join(DATA_FOLDER, safeFolderName, 'favorites.json');
    
    try {
      const data = await fs.readFile(favoritesFile, 'utf8');
      res.json(JSON.parse(data));
    } catch {
      res.json([]); // Return empty array if file doesn't exist
    }
  } catch (error) {
    console.error('Error getting favorites:', error);
    res.status(500).json({ error: 'Failed to get favorites' });
  }
});

// API route to save user's favorites
app.post('/api/favorites', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  try {
    const email = req.session.user.email;
    const safeFolderName = email.replace(/[@.]/g, '_');
    const { favorites } = req.body;
    const favoritesFile = path.join(DATA_FOLDER, safeFolderName, 'favorites.json');
    
    // Optimize Pokemon data before saving
    const optimizedFavorites = favorites.map(pokemon => optimizePokemonData(pokemon));
    
    await fs.writeFile(favoritesFile, JSON.stringify(optimizedFavorites, null, 2));
    res.json({ message: 'Favorites saved successfully' });
    
  } catch (error) {
    console.error('Error saving favorites:', error);
    res.status(500).json({ error: 'Failed to save favorites' });
  }
});

// API route to add a single Pokemon to favorites
app.post('/api/favorites/add', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  try {
    const email = req.session.user.email;
    const safeFolderName = email.replace(/[@.]/g, '_');
    const { pokemon } = req.body;
    const favoritesFile = path.join(DATA_FOLDER, safeFolderName, 'favorites.json');
    
    // Read current favorites
    let favorites = [];
    try {
      const data = await fs.readFile(favoritesFile, 'utf8');
      favorites = JSON.parse(data);
    } catch {
      // File doesn't exist, start with empty array
    }
    
    // Check for duplicates
    if (favorites.some(p => p.id === pokemon.id)) {
      return res.status(400).json({ error: 'Pokemon already in favorites' });
    }
    
    // Optimize and add new pokemon
    const optimizedPokemon = optimizePokemonData(pokemon);
    favorites.push(optimizedPokemon);
    
    // Save updated favorites
    await fs.writeFile(favoritesFile, JSON.stringify(favorites, null, 2));
    res.json({ message: 'Pokemon added to favorites successfully' });
    
  } catch (error) {
    console.error('Error adding pokemon to favorites:', error);
    res.status(500).json({ error: 'Failed to add pokemon to favorites' });
  }
});

// API route to get YouTube videos for a Pokemon
app.get('/api/youtube/:pokemonName', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const pokemonName = req.params.pokemonName;
    console.log('Fetching YouTube videos for:', pokemonName);
    console.log('Using API key:', YOUTUBE_API_KEY ? 'Key present' : 'No key');
    
    // Search for Pokemon-related videos
    const searchQuery = `${pokemonName} pokemon`;
    const searchUrl = `${YOUTUBE_API_BASE_URL}/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&maxResults=6&order=relevance&key=${YOUTUBE_API_KEY}`;
    
    console.log('Making request to YouTube API...');
    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      console.error('YouTube API error:', response.status, response.statusText);
      const errorData = await response.text();
      console.error('Error details:', errorData);
      
      if (response.status === 400) {
        return res.json({ videos: [], error: 'Invalid API key or request' });
      } else if (response.status === 403) {
        return res.json({ videos: [], error: 'API quota exceeded or invalid key' });
      } else {
        return res.json({ videos: [], error: `YouTube API error: ${response.status}` });
      }
    }
    
    const data = await response.json();
    console.log('YouTube API response received');
    
    // Check if we got valid data
    if (!data.items || data.items.length === 0) {
      return res.json({ videos: [], error: 'No videos found' });
    }
    
    // Format video data for frontend
    const videos = data.items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.medium.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`
    }));
    
    console.log(`Found ${videos.length} videos for ${pokemonName}`);
    res.json({ videos });
    
  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    res.status(500).json({ error: 'Failed to fetch YouTube videos', details: error.message });
  }
});

// Initialize and start server
initializeDataFolder().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Data folder initialized');
    console.log('Available routes:');
    console.log('  GET / - Welcome page');
    console.log('  GET /login - Login page');
    console.log('  GET /register - Register page');
    console.log('  GET /search - Search page (protected)');
    console.log('  GET /favorites - Favorites page (protected)');
    console.log('  GET /pokemon/:id - Pokemon details page (protected)');
    console.log('  GET /arena - Arena main page (protected)');
    console.log('  GET /arena/vs-bot - Arena vs Bot (protected)');
    console.log('  GET /arena/random-vs-player - Arena vs Player (protected)');
    console.log('  GET /arena/fight-history - Fight History (protected)');
    console.log('  GET /arena/leaderboard - Leaderboard (protected)');
  });
});