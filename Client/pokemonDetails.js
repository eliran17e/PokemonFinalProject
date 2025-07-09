// Pokemon details page 
document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("details-container");
    
    // Get Pokemon ID from URL
    const urlPath = window.location.pathname;
    const pokemonId = urlPath.split('/pokemon/')[1];
    
    console.log('Pokemon ID from URL:', pokemonId); // Debug log
    
    if (!pokemonId) {
        container.innerHTML = "<p>No Pokémon ID provided.</p>";
        return;
    }

    // Show loading state
    container.innerHTML = `
        <div style="text-align: center; padding: 40px;">
            <p>Loading Pokemon details...</p>
            <div style="display: inline-block; width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite;"></div>
        </div>
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    `;

    try {
        // Fetch Pokemon data from our API
        console.log('Fetching Pokemon data for ID:', pokemonId); // Debug log
        const response = await fetch(`/api/pokemon/${pokemonId}`);
        
        console.log('Response status:', response.status); // Debug log
        
        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = '/login';
                return;
            }
            if (response.status === 404) {
                container.innerHTML = "<p>Pokémon not found. Please check the ID and try again.</p>";
                return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Pokemon data received:', data); // Debug log
        displayPokemonDetails(data);
        
    } catch (error) {
        console.error('Error loading Pokemon:', error);
        container.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <p>Error loading Pokémon details: ${error.message}</p>
                <button onclick="window.location.reload()" style="margin-top: 20px;">Try Again</button>
            </div>
        `;
    }
});

// Function to display Pokemon details
function displayPokemonDetails(data) {
    const container = document.getElementById("details-container");
    
    if (!data) {
        container.innerHTML = "<p>No Pokemon data available.</p>";
        return;
    }
    
    const types = data.types && data.types.length > 0 ? data.types.map(t => t.type.name).join(", ") : "Unknown";
    const abilities = data.abilities && data.abilities.length > 0 ? data.abilities.map(a => a.ability.name).join(", ") : "Unknown";
    const stats = data.stats && data.stats.length > 0 ? data.stats.map(s => `<li>${s.stat.name}: ${s.base_stat}</li>`).join("") : "<li>No stats available</li>";
    const moves = data.moves && data.moves.length > 0 ? data.moves.map(m => m.move.name).join(", ") : "No moves data";

    container.innerHTML = `
        <img src="${data.sprites?.front_default || '/placeholder-pokemon.png'}" alt="${data.name}" onerror="this.src='/placeholder-pokemon.png'">
        <h2>${data.name || 'Unknown'} (#${data.id || 'Unknown'})</h2>
        <p><strong>Type:</strong> ${types}</p>
        <p><strong>Abilities:</strong> ${abilities}</p>
        <p><strong>Height:</strong> ${data.height || 'Unknown'}</p>
        <p><strong>Weight:</strong> ${data.weight || 'Unknown'}</p>
        <p><strong>Base Experience:</strong> ${data.base_experience || 'N/A'}</p>
        <h3>Stats:</h3>
        <ul>${stats}</ul>
        <h3>Top Moves:</h3>
        <p>${moves}</p>
        ${data.cries?.latest ? `<audio controls src="${data.cries.latest}"></audio>` : ""}
        
        <h3>Related Videos:</h3>
        <div id="youtube-videos">
            <div class="loading-videos">Loading videos...</div>
        </div>
    `;
    
    // Load YouTube videos after displaying Pokemon data
    loadYouTubeVideos(data.name);
}

// Function to load YouTube videos
async function loadYouTubeVideos(pokemonName) {
    const videosContainer = document.getElementById('youtube-videos');
    
    try {
        const response = await fetch(`/api/youtube/${encodeURIComponent(pokemonName)}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch videos');
        }
        
        const data = await response.json();
        
        if (data.error) {
            videosContainer.innerHTML = `<p class="error">Unable to load videos: ${data.error}</p>`;
            return;
        }
        
        if (!data.videos || data.videos.length === 0) {
            videosContainer.innerHTML = '<p>No videos found for this Pokemon.</p>';
            return;
        }
        
        displayYouTubeVideos(data.videos);
        
    } catch (error) {
        console.error('Error loading YouTube videos:', error);
        videosContainer.innerHTML = '<p class="error">Unable to load videos at this time.</p>';
    }
}

// Function to display YouTube videos
function displayYouTubeVideos(videos) {
    const videosContainer = document.getElementById('youtube-videos');
    
    const videosHTML = videos.map(video => `
        <div class="video-item">
            <div class="video-thumbnail">
                <img src="${video.thumbnail}" alt="${video.title}" onclick="openVideo('${video.id}')">
                <div class="play-button" onclick="openVideo('${video.id}')">▶</div>
            </div>
            <div class="video-info">
                <h4 class="video-title" onclick="openVideo('${video.id}')">${video.title}</h4>
                <p class="video-channel">${video.channelTitle}</p>
                <p class="video-description">${video.description.substring(0, 100)}${video.description.length > 100 ? '...' : ''}</p>
                <div class="video-actions">
                    <button onclick="openVideo('${video.id}')" class="watch-btn">Watch</button>
                    <button onclick="openVideoInNewTab('${video.url}')" class="external-btn">Open in YouTube</button>
                </div>
            </div>
        </div>
    `).join('');
    
    videosContainer.innerHTML = `
        <div class="videos-grid">
            ${videosHTML}
        </div>
    `;
}

// Function to open video in embedded player
function openVideo(videoId) {
    const modal = document.createElement('div');
    modal.className = 'video-modal';
    modal.innerHTML = `
        <div class="video-modal-content">
            <span class="close-modal" onclick="closeVideoModal()">&times;</span>
            <iframe width="800" height="450" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeVideoModal();
        }
    });
}

// Function to close video modal
function closeVideoModal() {
    const modal = document.querySelector('.video-modal');
    if (modal) {
        modal.remove();
    }
}

// Function to open video in new tab
function openVideoInNewTab(url) {
    window.open(url, '_blank');
}

// Function to go back to the previous page
function goBack() {
    window.history.back();
}