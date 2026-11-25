import {
    getFood,
    getDesserts,
    getDrinks,
    searchFood,
    searchDrinks
} from "./api.js";

import {
    renderMeals,
    renderStats,
    showMessage
} from "./interface.js";

// Estado principal da aplicação.
let allMeals = [];
let activeCategory = "todos";

// Carrega o cardápio inicial.
async function loadMenu() {
    showMessage("Preparando o cardápio de Leonida...");

    try {
        // As três categorias são carregadas ao mesmo tempo.
        const results = await Promise.allSettled([
            getFood(),
            getDesserts(),
            getDrinks()
        ]);

        const foods = results[0].status === "fulfilled"
            ? results[0].value
            : [];

        const desserts = results[1].status === "fulfilled"
            ? results[1].value
            : [];

        const drinks = results[2].status === "fulfilled"
            ? results[2].value
            : [];

        // Junta todos os resultados em um único array.
        allMeals = [...foods, ...desserts, ...drinks];

        // Remove possíveis itens repetidos.
        allMeals = [
            ...new Map(allMeals.map(item => [item.id, item])).values()
        ];

        renderStats(allMeals);
        applyFilters();

        if (allMeals.length === 0) {
            showMessage(
                "Não foi possível carregar o cardápio. Verifique sua conexão e tente novamente."
            );
            return;
        }

        showMessage(
            `${allMeals.length} itens encontrados no cardápio de Vice City.`
        );

    } catch (error) {
        console.error("Erro ao carregar o cardápio:", error);

        showMessage(
            "O cardápio não pôde ser carregado. Tente novamente mais tarde."
        );

        renderMeals([]);
    }
}

// Aplica o filtro escolhido pelo usuário.
function applyFilters() {
    const filteredMeals = allMeals.filter(meal => {
        return activeCategory === "todos" ||
            meal.category === activeCategory;
    });

    renderMeals(filteredMeals);
}

// Atualiza o botão selecionado.
function updateActiveButton(selectedButton) {
    const filterButtons = document.querySelectorAll(".filter-button");

    filterButtons.forEach(button => {
        button.classList.remove("active");
    });

    selectedButton.classList.add("active");
}

// Configura os botões de categoria.
function setupFilters() {
    const filterButtons = document.querySelectorAll(".filter-button");

    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            activeCategory = button.dataset.filter;

            updateActiveButton(button);
            applyFilters();

            showMessage(
                activeCategory === "todos"
                    ? "Exibindo todo o cardápio."
                    : `Exibindo: ${button.textContent.toLowerCase()}.`
            );
        });
    });
}

// Pesquisa itens nas duas APIs.
async function handleSearch(event) {
    event.preventDefault();

    const searchInput = document.getElementById("searchInput");
    const query = searchInput.value.trim();

    if (!query) {
        allMeals = [...allMeals];
        applyFilters();
        showMessage("Exibindo o cardápio completo.");
        return;
    }

    showMessage(`Procurando por "${query}"...`);

    try {
        const results = await Promise.allSettled([
            searchFood(query),
            searchDrinks(query)
        ]);

        const foods = results[0].status === "fulfilled"
            ? results[0].value
            : [];

        const drinks = results[1].status === "fulfilled"
            ? results[1].value
            : [];

        const searchResults = [...foods, ...drinks];

        // Evita resultados repetidos.
        const uniqueResults = [
            ...new Map(searchResults.map(item => [item.id, item])).values()
        ];

        // Aplica a categoria selecionada também aos resultados da pesquisa.
        const filteredResults = uniqueResults.filter(meal => {
            return activeCategory === "todos" ||
                meal.category === activeCategory;
        });

        renderMeals(filteredResults);

        if (filteredResults.length === 0) {
            showMessage(`Nenhum resultado encontrado para "${query}".`);
        } else {
            showMessage(
                `${filteredResults.length} resultado(s) encontrado(s) para "${query}".`
            );
        }

    } catch (error) {
        console.error("Erro na pesquisa:", error);

        showMessage(
            "Não foi possível realizar a pesquisa. Tente novamente."
        );
    }
}

// Configuração inicial da aplicação.
function initializeApp() {
    setupFilters();

    const searchForm = document.getElementById("searchForm");

    searchForm.addEventListener("submit", handleSearch);

    loadMenu();
}

initializeApp();