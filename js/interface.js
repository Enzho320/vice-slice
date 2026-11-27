
function escapeHTML(text) {
    return String(text ?? "").replace(/[&<>"']/g, character => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];
    });
}

export function renderMeals(meals, elementId) {
    const menu = document.getElementById(elementId);

    if (meals.length === 0) {
        menu.innerHTML = "<p>Nenhum item encontrado.</p>";
        return;
    }

    menu.innerHTML = meals.map(meal => `
        <article class="meal-card">
            <img src="${escapeHTML(meal.image)}"
                 alt="${escapeHTML(meal.name)}"
                 loading="lazy">

            <div class="meal-info">
                <span class="meal-category">${escapeHTML(meal.category)}</span>
                <h3>${escapeHTML(meal.name)}</h3>
                <p>${escapeHTML(meal.description || "Preparado com ingredientes selecionados.")}</p>
            </div>
        </article>
    `).join("");
}

export function showMessage(message) {
    document.getElementById("menuMessage").textContent = message;
}
