// Evita que caracteres especiais vindos das APIs sejam interpretados como HTML.
export function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => {
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

// Garante que as imagens usem endereços HTTPS.
function getSafeImage(image) {
    if (!image) {
        return "";
    }

    try {
        const url = new URL(image);

        return url.protocol === "https:" ? escapeHTML(url.href) : "";
    } catch {
        return "";
    }
}

// Cria os cards dos pratos, sobremesas e bebidas.
export function renderMeals(meals) {
    const menuGrid = document.getElementById("menuGrid");

    if (!meals.length) {
        menuGrid.innerHTML = `
            <div class="empty-state">
                <h3>NENHUM ITEM ENCONTRADO</h3>
                <p>Tente outra pesquisa ou escolha uma categoria diferente.</p>
            </div>
        `;

        return;
    }

    const cards = meals.map((meal, index) => {
        const image = getSafeImage(meal.image);
        const name = escapeHTML(meal.name);
        const description = escapeHTML(meal.description);

        const categoryLabels = {
            comida: "COMIDA",
            sobremesa: "SOBREMESA",
            drink: "DRINK SEM ÁLCOOL"
        };

        const categoryLabel = categoryLabels[meal.category] || "ESPECIAL";

        const imageContent = image
            ? `<img src="${image}" alt="${name}" loading="lazy">`
            : `<div class="empty-state">Imagem indisponível</div>`;

        return `
            <article class="meal-card">
                <div class="meal-image-wrap">
                    ${imageContent}

                    <span class="meal-number">
                        #${String(index + 1).padStart(2, "0")}
                    </span>

                    <span class="meal-stamp">VICE SLICE</span>
                </div>

                <div class="meal-info">
                    <div class="meal-meta">
                        <span>${categoryLabel}</span>
                        <span>LEONIDA, FL</span>
                    </div>

                    <h3>${name}</h3>

                    <p class="meal-description">
                        ${description}
                    </p>

                    <div class="meal-footer">
                        <span>FEITO PARA VOCÊ</span>
                        <span>✦ VICE CITY</span>
                    </div>
                </div>
            </article>
        `;
    }).join("");

    menuGrid.innerHTML = cards;
}

// Atualiza os números do cardápio usando reduce().
export function renderStats(meals) {
    const totals = meals.reduce((accumulator, meal) => {
        accumulator.total++;

        if (meal.category === "comida") {
            accumulator.food++;
        }

        if (meal.category === "sobremesa") {
            accumulator.desserts++;
        }

        if (meal.category === "drink") {
            accumulator.drinks++;
        }

        return accumulator;
    }, {
        total: 0,
        food: 0,
        desserts: 0,
        drinks: 0
    });

    document.getElementById("totalItens").textContent = totals.total;
    document.getElementById("totalComidas").textContent = totals.food;
    document.getElementById("totalSobremesas").textContent = totals.desserts;
    document.getElementById("totalDrinks").textContent = totals.drinks;
}

// Mostra mensagens de carregamento e de erro.
export function showMessage(message) {
    document.getElementById("menuMessage").textContent = message;
}