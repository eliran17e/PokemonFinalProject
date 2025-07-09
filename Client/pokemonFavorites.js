// Global variable to store favorites
let currentFavorites = [];

// Function to fetch and display favorite Pokémon
// This function will be called when the page is loaded
document.addEventListener("DOMContentLoaded", async () => {
    await loadFavorites();
    displayFavorites();
});

// Function to load favorites from server
async function loadFavorites() {
    try {
        const response = await fetch('/api/favorites');
        if (!response.ok) {
            throw new Error('Failed to fetch favorites');
        }
        
        currentFavorites = await response.json();
    } catch (error) {
        console.error('Error loading favorites:', error);
        currentFavorites = [];
        
        // Check if user is authenticated
        if (error.message.includes('401') || error.message.includes('Not authenticated')) {
            window.location.href = '/login';
        }
    }
}

// Function to save favorites to server
async function saveFavorites() {
    try {
        // Make sure we're sending optimized data
        const optimizedFavorites = currentFavorites.map(pokemon => ({
            id: pokemon.id,
            name: pokemon.name,
            sprites: {
                front_default: pokemon.sprites.front_default
            },
            types: pokemon.types,
            abilities: pokemon.abilities,
            height: pokemon.height,
            weight: pokemon.weight,
            base_experience: pokemon.base_experience,
            stats: pokemon.stats,
            moves: pokemon.moves,
            cries: pokemon.cries || null
        }));
        
        const response = await fetch('/api/favorites', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ favorites: optimizedFavorites })
        });
        
        if (!response.ok) {
            throw new Error('Failed to save favorites');
        }
        
        return true;
    } catch (error) {
        console.error('Error saving favorites:', error);
        alert('Failed to save favorites. Please try again.');
        return false;
    }
}

// Function to display favorites in the table
function displayFavorites() {
    const container = document.getElementById("favorite-pokemons");
    
    if (currentFavorites.length === 0) {
        container.innerHTML = "<tr><td colspan='6'>No favorites yet.</td></tr>";
        return;
    }

    container.innerHTML = "";
    
    currentFavorites.forEach(pokemon => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><img src="${pokemon.sprites.front_default}" /></td>
            <td>${pokemon.name}</td>
            <td>${pokemon.types.map(t => t.type.name).join("<br>")}</td>
            <td>${pokemon.id}</td>
            <td>${pokemon.abilities.map(a => a.ability.name).join("<br>")}</td>
            <td>
                <button class="remove-button">Remove</button>
                <button class="more-info-button">More Info</button>
            </td>
        `;
        container.appendChild(row);
    
        // Add event listeners
        row.querySelector(".remove-button").addEventListener("click", () => removePokemon(pokemon.id));
        row.querySelector(".more-info-button").addEventListener("click", () => moreInfoAboutPokemon(pokemon));
    });
}

// Function to remove a Pokémon from favorites
async function removePokemon(pokemonId) {
    try {
        // Remove from local array
        currentFavorites = currentFavorites.filter(p => p.id !== pokemonId);
        
        // Save to server
        const saved = await saveFavorites();
        
        if (saved) {
            // Update display
            displayFavorites();
        } else {
            // If save failed, reload favorites from server
            await loadFavorites();
            displayFavorites();
        }
    } catch (error) {
        console.error('Error removing pokemon:', error);
        alert('Failed to remove pokemon. Please try again.');
    }
}

// Function to sort Pokémon by name
async function sortPokemonsbyName() {
    currentFavorites.sort((a, b) => a.name.localeCompare(b.name));
    const saved = await saveFavorites();
    
    if (saved) {
        displayFavorites();
    } else {
        // If save failed, reload favorites from server
        await loadFavorites();
        displayFavorites();
    }
}

// Function to sort Pokémon by ID
async function sortPokemonsbyId() {
    currentFavorites.sort((a, b) => a.id - b.id);
    const saved = await saveFavorites();
    
    if (saved) {
        displayFavorites();
    } else {
        // If save failed, reload favorites from server
        await loadFavorites();
        displayFavorites();
    }
}

// Function to return to the search page
function returnHomePage() {
    window.location.href = "/search";
}

// Function to download favorite Pokémon as a JSON file
function downloadPokemons() {
    if (currentFavorites.length === 0) {
        alert('No favorites to download');
        return;
    }
    
    const blob = new Blob([JSON.stringify(currentFavorites, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "favorites.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Function to navigate to Pokémon details page
function moreInfoAboutPokemon(pokemon) {
    window.location.href = `/pokemon/${pokemon.id}`;
}