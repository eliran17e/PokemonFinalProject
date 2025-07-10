# 🎯 Pokemon Explorer

A comprehensive Pokemon discovery platform where users can search, explore, and collect their favorite Pokemon. Built with modern web technologies and featuring advanced search capabilities, detailed Pokemon information, personalized favorites management, and an interactive battle arena system.

## 📋 Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Middleware](#middleware)
- [Database Structure](#database-structure)
- [Team](#team)
- [License](#license)

## ✨ Features

### Core Features
- **Advanced Pokemon Search** - Search by ID, name, type, or ability
- **Detailed Pokemon Information** - Comprehensive Pokemon stats and information
- **Personal Favorites Collection** - Save and manage your favorite Pokemon
- **User Authentication & Registration** - Secure user accounts with session management
- **Data Export Functionality** - Download your favorites as JSON

### Battle Arena System
- **Interactive Battle Arena** - Real-time Pokemon battles
- **Player vs Bot Battles** - Fight against AI opponents
- **Player vs Player Battles** - Challenge other online players
- **Battle History Tracking** - Complete record of all your battles
- **Competitive Leaderboard** - Global rankings and statistics
- **Player Statistics & Rankings** - Track wins, losses, and draws
- **Real-time Battle Results** - Live battle outcome processing

### User Experience
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Session-based Security** - Secure authentication system
- **Real-time Online Players** - See who's currently online

## 🛠 Technologies Used

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **express-session** - Session management middleware
- **node-fetch** - HTTP client for API requests
- **File-based Database** - JSON file storage system

### Frontend
- **HTML5** - Markup language
- **CSS3** - Styling with modern features (Grid, Flexbox, Animations)
- **JavaScript (ES6+)** - Modern JavaScript with async/await

### External APIs
- **PokeAPI** - RESTful Pokemon API providing comprehensive Pokemon data
- **YouTube API** - For Pokemon-related video content (optional)

## 📁 Project Structure

```
PokemonFinalProject/
├── Server.js                 # Main server file
├── package.json              # Dependencies and scripts
├── README.md                # Project documentation
│
├── Client/                  # Frontend files
│   ├── index.html           # Landing page
│   ├── index.js             # Landing page logic
│   ├── index.css            # Landing page styles
│   │
│   ├── login.html           # Login page
│   ├── login.js             # Login functionality
│   ├── login.css            # Login styles
│   │
│   ├── register.html        # Registration page
│   ├── register.js          # Registration functionality
│   ├── register.css         # Registration styles
│   │
│   ├── pokemonSearch.html   # Pokemon search page
│   ├── pokemonSearch.js     # Search functionality
│   ├── pokemonSearch.css    # Search page styles
│   │
│   ├── pokemonFavorites.html # Favorites page
│   ├── pokemonFavorites.js  # Favorites functionality
│   ├── pokemonFavorites.css # Favorites styles
│   │
│   ├── arena.html           # Arena main page
│   ├── arena.js             # Arena functionality
│   ├── arena.css            # Arena styles
│   │
│   ├── arenaVsBot.html      # Bot battle page
│   ├── arenaVsBot.js        # Bot battle logic
│   ├── arenaVsBot.css       # Bot battle styles
│   │
│   ├── arenaRandomVsPlayer.html  # Player vs Player battle
│   ├── arenaRandomVsPlayer.js    # PvP battle logic
│   ├── arenaRandomVsPlayer.css   # PvP battle styles
│   │
│   ├── arenaFightHistory.html    # Battle history page
│   ├── arenaFightHistory.js      # History functionality
│   ├── arenaFightHistory.css     # History styles
│   │
│   ├── arenaLeaderboard.html     # Leaderboard page
│   ├── arenaLeaderboard.js       # Leaderboard functionality
│   ├── arenaLeaderboard.css      # Leaderboard styles
│   │
│   ├── navbar.js            # Navigation functionality
│   └── navbar.css           # Navigation styles
│
└── Data/                    # Data storage
    ├── users.json           # User accounts
    ├── arena.json           # Arena data and stats
    ├── project-info.json    # Project metadata
    │
    └── [user_email]/        # User-specific folders
        ├── favorites.json   # User's favorite Pokemon
        └── battle-history.json # User's battle history
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (version 18.x or higher)
- npm (Node Package Manager)

### Step 1: Clone or Download the Project
```bash
# If using Git
git clone https://github.com/eliran17e/pokemon-final-project.git
cd pokemon-final-project

# Or download and extract the project files to your desired directory
```

### Step 2: Install Dependencies
```bash
npm install
```

If you don't have a `package.json` file, create one with these dependencies:
```bash
npm init -y
npm install express express-session node-fetch
```

### Step 3: Environment Setup (Optional)
Create a `.env` file in the root directory for any environment variables:
```env
NODE_ENV=development
YOUTUBE_API_KEY=your_youtube_api_key_here
PORT=3000
```

### Step 4: Initialize Data Directory
The application will automatically create the necessary data directories and files on first run. No additional setup required.

## ▶️ Running the Application

### Start the Server
```bash
npm start
# or
node Server.js
```

The server will start and you'll see output similar to:
```
Server running on http://localhost:3000
Data folder initialized
Available routes:
  GET / - Welcome page
  GET /login - Login page
  GET /register - Register page
  GET /search - Search page (protected)
  GET /favorites - Favorites page (protected)
  GET /arena - Arena page (protected)
  ...
```

### Access the Application
Open your web browser and navigate to: `http://localhost:3000`

### Available Routes
- `GET /` - Landing page
- `GET /login` - Login page
- `GET /register` - Registration page
- `GET /search` - Pokemon search (protected)
- `GET /favorites` - User favorites (protected)
- `GET /arena` - Battle arena main page (protected)
- `GET /arena/vs-bot` - Bot battles (protected)
- `GET /arena/random-vs-player` - Player battles (protected)
- `GET /arena/fight-history` - Battle history (protected)
- `GET /arena/leaderboard` - Leaderboard (protected)

## 🔌 API Endpoints

### Authentication
- `POST /login` - User login
- `POST /register` - User registration
- `POST /logout` - User logout
- `GET /api/user` - Get current user info

### Pokemon & Favorites
- `GET /api/favorites` - Get user's favorites
- `POST /api/favorites` - Save user's favorites
- `POST /api/favorites/add` - Add single Pokemon to favorites

### Arena & Battles
- `GET /api/arena/online-players` - Get online players
- `GET /api/arena/stats` - Get player statistics
- `GET /api/arena/rank` - Get player rank
- `GET /api/arena/battle-history` - Get battle history
- `GET /api/arena/leaderboard` - Get leaderboard
- `POST /api/arena/save-battle-result` - Save battle result
- `POST /api/arena/sync-stats` - Synchronize arena statistics

### Project Info
- `GET /api/project-info` - Get project information

### External APIs
- `GET /api/youtube/:pokemonName` - Get YouTube videos for Pokemon

## 🔧 Middleware

### Core Middleware
- **express.urlencoded()** - Parse URL-encoded bodies (limit: 10mb)
- **express.json()** - Parse JSON bodies (limit: 10mb)
- **express.static()** - Serve static files from Client folder

### Session Management
```javascript
express-session({
  secret: 'pokemon-secret-key-2025',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
})
```

### Authentication Middleware
- Route protection for authenticated pages
- Automatic redirection to login for unauthenticated users
- Session-based user tracking

### Online Player Tracking
- Automatic online status updates
- Cleanup of offline players (5-minute timeout)
- Real-time player statistics synchronization

## 💾 Database Structure

### File-based Storage System

#### users.json
```json
[
  {
    "id": "unique_user_id",
    "name": "User Name",
    "email": "user@email.com",
    "password": "hashed_password"
  }
]
```

#### arena.json
```json
{
  "players": {
    "user_id": {
      "wins": 0,
      "losses": 0,
      "draws": 0
    }
  },
  "battles": [],
  "onlinePlayers": [
    {
      "id": "user_id",
      "name": "User Name",
      "email": "user@email.com",
      "lastSeen": "2025-01-01T00:00:00.000Z",
      "wins": 0,
      "losses": 0,
      "draws": 0
    }
  ]
}
```

#### User-specific Files
- `favorites.json` - Optimized Pokemon data for display and battles
- `battle-history.json` - Complete battle records

## 👥 Team

| Name | Email | GitHub | Role |
|------|-------|--------|------|
| **Tomer Harari** | tomerdb@gmail.com | [@tomerdb](https://github.com/tomerdb) | Full-Stack Developer |
| **Eliran Elisha** | eliran17eli@gmail.com | [@eliran17e](https://github.com/eliran17e) | Full-Stack Developer |

### Academic Information
- **Course:** Web Development Course
- **Institution:** Tel-Hai Academic College
- **Semester:** Spring 2025
- **Project Type:** Final Project

## 🎮 How to Use

### Getting Started
1. Start the server with `node Server.js`
2. Visit `http://localhost:3000` in your browser
3. Register a new account or login with existing credentials
4. Start searching for Pokemon in the search page
5. Add Pokemon to your favorites collection
6. Enter the Arena for exciting battles!

### Battle System
1. **VS Bot:** Practice against AI opponents to improve your skills
2. **VS Player:** Challenge other online players in real-time battles
3. **View History:** Check your complete battle records and statistics
4. **Leaderboard:** See global rankings and compete for the top spot

### Key Features
- Search Pokemon by ID, name, type, or ability
- Save favorites with optimized data for quick access
- Real-time multiplayer battle system
- Comprehensive statistics and battle history tracking
- Export your favorite Pokemon data as JSON

## 📄 License

This project is developed as part of an academic course at Tel-Hai Academic College.

## 🔗 External Resources

- **PokeAPI:** [https://pokeapi.co/](https://pokeapi.co/) - Comprehensive Pokemon data
- **Node.js:** [https://nodejs.org/](https://nodejs.org/)
- **Express.js:** [https://expressjs.com/](https://expressjs.com/)

---

**Version:** 1.0.0  
**Last Updated:** July 2025
