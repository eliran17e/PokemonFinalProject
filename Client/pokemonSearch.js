const url = "https://pokeapi.co/api/v2/";
const searchType = document.getElementById("search-type");
const searchResultsBody = document.getElementById("search-results-body");

//  On page load: auto-trigger search if URL has query parameters 
document.addEventListener("DOMContentLoaded", function() {
    if (window.location.search) {
        const params = new URLSearchParams(window.location.search);
        const type = params.get("type");
        const query = params.get("query");
        if (type && query) {
            document.getElementById("search-type").value = type;
            document.getElementById("search-input").value = query;
            searchBtnClick();
        }
    }
});

// Main search handler: triggers the correct fetch function based on user selection
function searchBtnClick() {
    const searchType = document.getElementById("search-type").value;
    const searchInput = document.getElementById("search-input").value;

    // Show the loader
    document.getElementById("loader").style.display = "block";

    // Create a URL with the search parameters
    const url = new URL(window.location.href);

    // Remove any existing search parameters
    url.searchParams.delete("type");
    url.searchParams.delete("query");

    // Add the current search parameters
    url.searchParams.set("type", searchType);
    url.searchParams.set("query", searchInput);

    // Update the URL without refreshing the page
    window.history.pushState({ searchType, searchInput }, '', url);

    // Perform the search based on type
    if (searchType === "id" || searchType === "name") {
        getPokemonById(searchInput);
    } else if (searchType === "type") {
        getPokemonByType(searchInput);
    } else if (searchType === "ability") {
        getPokemonByAbility(searchInput);
    }
     else {
        console.error("Invalid search type");
        document.getElementById("loader").style.display = "none";
    }
}

//  Fetch Pokémon by ID or name 
function getPokemonById(id) {
    return fetch(`${url}pokemon/${id}`)
        .then(response => {
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        return response.json();
        })
        .then(data => {
        searchResultsBody.innerHTML = "";
        displayPokemon(data);
        })
        .catch(error => {
        alert(`Could not found pokemon with this id: ${id}`);
        
        }).finally(() => {
            document.getElementById("loader").style.display = "none";
        });
}

// Fetch list of Pokémon by type 
function getPokemonByType(type) {
    return fetch(`${url}type/${type}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then(data => {
            searchResultsBody.innerHTML = "";
            data.pokemon.forEach(pokemon => {
                fetch(pokemon.pokemon.url)
                    .then(response => response.json())
                    .then(pokemonData => {
                        displayPokemon(pokemonData);
                        document.getElementById("loader").style.display = "none";
                    })
                    .catch(error => {
                        console.error("Error fetching Pokémon details:", error);
                    });
            });
        })
        .catch(error => {
            alert(`Could not found pokemon with this type: ${type} `);
        }).finally(() => {
            document.getElementById("loader").style.display = "none";
        });
}

// Fetch list of Pokémon by ability
function getPokemonByAbility(ability) {
    return fetch(`${url}ability/${ability}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then(data => {
            searchResultsBody.innerHTML = "";
            data.pokemon.forEach(pokemon => {
                fetch(pokemon.pokemon.url)
                    .then(response => response.json())
                    .then(pokemonData => {
                        displayPokemon(pokemonData);
                        document.getElementById("loader").style.display = "none";
                    })
                    .catch(error => {
                        console.error("Error fetching Pokémon details:", error);
                    });
            });
        })
        .catch(error => {
            alert(`Could not found pokemon with this ability: ${ability}`);
        }).finally(() => {
            document.getElementById("loader").style.display = "none";
        });
}

//  Navigate to favorites page
function showFavorites() {
    window.location.href = "/favorites";
}

// Add Pokémon to favorites (updated to use server-side storage)
async function addPokemons(pokemon) {
    try {
        // Use the dedicated add endpoint
        const response = await fetch('/api/favorites/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ pokemon })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert(`${pokemon.name} added to favourites`);
        } else {
            if (response.status === 400 && result.error === 'Pokemon already in favorites') {
                alert(`${pokemon.name} is already in favourites`);
            } else {
                throw new Error(result.error || 'Failed to add pokemon');
            }
        }
        
    } catch (error) {
        console.error('Error adding pokemon to favorites:', error);
        
        // Check if it's an authentication error
        if (error.message.includes('401') || error.message.includes('Not authenticated')) {
            alert('Please log in to add favorites');
            window.location.href = '/login';
        } else {
            alert('Failed to add pokemon to favorites. Please try again.');
        }
    }
}

//  Display Pokémon in the search results table
function displayPokemon(pokemon) {
    const searchResultsBody = document.getElementById("search-results-body");

    const row = document.createElement("tr");

    const imgCell = `<td><img src="${pokemon.sprites.front_default}"></td>`;
    const nameCell = `<td>${pokemon.name}</td>`;
    const typeCell = `<td>${pokemon.types.map(t => t.type.name).join("<br>")}</td>`;
    const idCell = `<td>${pokemon.id}</td>`;
    const abilityCell = `<td>${pokemon.abilities.map(a => a.ability.name).join("<br>")}</td>`;
    const buttonFavoriteCell = `<td><button class="favorite-button">Add to Favorites</button></td>`;
    const buttonMoreInfoCell = `<td><button class="more-information-button">More Info</button></td>`;
    

    row.innerHTML = imgCell + nameCell + typeCell + idCell + abilityCell + buttonFavoriteCell+ buttonMoreInfoCell;

    // Append the row
    searchResultsBody.appendChild(row);

    // Attach event listener to button
    const button = row.querySelector(".favorite-button");
    button.addEventListener("click", () => {
        addPokemons(pokemon); // pass the full JSON
    });
    const moreInfoButton = row.querySelector(".more-information-button");
    moreInfoButton.addEventListener("click", () => {
        moreInfoAboutPokemon(pokemon);
    });
}

//  Navigate to Pokémon details page
function moreInfoAboutPokemon(pokemon) {
    window.location.href = `/pokemon/${pokemon.id}`;
}