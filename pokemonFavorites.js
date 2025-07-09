
// Function to fetch and display favorite Pokémon
// This function will be called when the page is loaded
document.addEventListener("DOMContentLoaded", () => {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    const container = document.getElementById("favorite-pokemons");

    if (favorites.length === 0) {
        container.innerHTML = "<tr><td colspan='6'>No favorites yet.</td></tr>";
        return;
    }

    favorites.forEach(pokemon => {
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
        row.querySelector(".remove-button").addEventListener("click", () => removePokemon(pokemon.name));
        row.querySelector(".more-info-button").addEventListener("click", () => moreInfoAboutPokemon(pokemon));
    });
});
// Function to remove a Pokémon from favorites
function removePokemon(pokemonName) {
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    favorites = favorites.filter(p => p.name !== pokemonName);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    document.location.reload();
}
// Function to sort Pokémon by name or ID
function sortPokemonsbyName() {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    favorites.sort((a, b) => a.name.localeCompare(b.name));
    localStorage.setItem("favorites", JSON.stringify(favorites));
    document.location.reload();
}
// Function to sort Pokémon by ID
function sortPokemonsbyId() {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    favorites.sort((a, b) => a.id - b.id);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    document.location.reload();
}
// Function to return to the home page
function returnHomePage() {
    window.location.href = "index.html";
}
// Function to download favorite Pokémon as a JSON file
function downloadPokemons() {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    const blob = new Blob([JSON.stringify(favorites, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "favorites.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
// Function to navigate to Pokémon details page
function moreInfoAboutPokemon(pokemon) {
    pokemon = JSON.stringify(pokemon);
    sessionStorage.setItem("pokemon", pokemon);
    window.location.href = "pokemonDetails.html";
}
