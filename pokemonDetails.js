
// Pokemon details page 
document.addEventListener("DOMContentLoaded", () => {
    const data = JSON.parse(sessionStorage.getItem("pokemon"));
    const container = document.getElementById("details-container");

    if (!data) {
        container.innerHTML = "<p>No Pokémon selected.</p>";
        return;
    }

    const types = data.types.map(t => t.type.name).join(", ");
    const abilities = data.abilities.map(a => a.ability.name).join(", ");
    const stats = data.stats.map(s => `<li>${s.stat.name}: ${s.base_stat}</li>`).join("");
    const moves = data.moves.slice(0, 10).map(m => m.move.name).join(", ");

    container.innerHTML = `
        <img src="${data.sprites.front_default}" alt="${data.name}">
        <h2>${data.name} (#${data.id})</h2>
        <p><strong>Type:</strong> ${types}</p>
        <p><strong>Abilities:</strong> ${abilities}</p>
        <p><strong>Height:</strong> ${data.height}</p>
        <p><strong>Weight:</strong> ${data.weight}</p>
        <p><strong>Base Experience:</strong> ${data.base_experience}</p>
        <h3>Stats:</h3>
        <ul>${stats}</ul>
        <h3>Top Moves:</h3>
        <p>${moves}</p>
        ${data.cries?.latest ? `<audio controls src="${data.cries.latest}"></audio>` : ""}
    `;
});
// Function to go back to the previous page
function goBack() {
    window.history.back();
}