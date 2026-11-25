const MEAL_API = "https://www.themealdb.com/api/json/v1/1";
const DRINK_API = "https://www.thecocktaildb.com/api/json/v1/1";

async function requestData(url) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
    }

    return response.json();
}

// Traduz ingredientes conhecidos para português.
function getIngredients(item) {
    const translations = {
        chicken: "frango",
        beef: "carne bovina",
        pork: "carne suína",
        shrimp: "camarão",
        salmon: "salmão",
        tuna: "atum",
        onion: "cebola",
        garlic: "alho",
        tomato: "tomate",
        potato: "batata",
        rice: "arroz",
        egg: "ovo",
        flour: "farinha",
        sugar: "açúcar",
        butter: "manteiga",
        milk: "leite",
        cheese: "queijo",
        lemon: "limão",
        lime: "limão",
        orange: "laranja",
        coconut: "coco",
        pineapple: "abacaxi",
        strawberry: "morango",
        chocolate: "chocolate",
        cream: "creme",
        mint: "hortelã",
        water: "água",
        ice: "gelo",
        apple: "maçã",
        banana: "banana",
        bread: "pão",
        honey: "mel",
        carrot: "cenoura",
        cinnamon: "canela",
        vanilla: "baunilha",
        cucumber: "pepino",
        olive: "azeitona",
        "olive oil": "azeite",
        "bell pepper": "pimentão",
        spinach: "espinafre",
        mushroom: "cogumelo",
        corn: "milho",
        bacon: "bacon",
        pasta: "massa",
        vinegar: "vinagre",
        mustard: "mostarda",
        paprika: "páprica",
        parsley: "salsinha",
        basil: "manjericão",
        "black pepper": "pimenta-do-reino"
    };

    const ingredients = [];

    for (let i = 1; i <= 20; i++) {
        const ingredient = item[`strIngredient${i}`];

        if (ingredient && ingredient.trim()) {
            const original = ingredient.trim();
            const translated = translations[original.toLowerCase()] || original;

            ingredients.push(translated);
        }
    }

    return ingredients;
}

// Cria uma descrição usando os ingredientes de cada receita.
function createMealDescription(meal, ingredients) {
    const category = (meal.strCategory || "").toLowerCase();
    const ingredientsText = ingredients.length
        ? ingredients.slice(0, 5).join(", ")
        : "ingredientes selecionados";

    if (category === "dessert") {
        return `Uma sobremesa preparada com ${ingredientsText}. Uma opção especial para adoçar sua visita ao VICE SLICE.`;
    }

    if (category === "seafood") {
        return `Uma receita com sabores do mar, combinando ${ingredientsText}. Um toque costeiro direto de Leonida.`;
    }

    if (category === "vegetarian" || category === "vegan") {
        return `Uma combinação de ${ingredientsText}, trazendo variedade e sabor em uma receita cheia de personalidade.`;
    }

    return `Preparado com ${ingredientsText}, este prato traz uma combinação de sabores para quem quer aproveitar o melhor da casa.`;
}

function createDrinkDescription(drink, ingredients) {
    const ingredientsText = ingredients.length
        ? ingredients.slice(0, 5).join(", ")
        : "ingredientes selecionados";

    return `Uma bebida sem álcool que combina ${ingredientsText}. Uma opção refrescante para aproveitar o clima de Vice City.`;
}

function formatMeal(meal) {
    const ingredients = getIngredients(meal);

    const category = (meal.strCategory || "").toLowerCase() === "dessert"
        ? "sobremesa"
        : "comida";

    return {
        id: `meal-${meal.idMeal}`,
        name: meal.strMeal || "Receita sem nome",
        image: meal.strMealThumb || "",
        category,
        description: createMealDescription(meal, ingredients)
    };
}

function formatDrink(drink) {
    const ingredients = getIngredients(drink);

    return {
        id: `drink-${drink.idDrink}`,
        name: drink.strDrink || "Bebida sem nome",
        image: drink.strDrinkThumb || "",
        category: "drink",
        description: createDrinkDescription(drink, ingredients)
    };
}

async function getMealDetails(id) {
    const data = await requestData(
        `${MEAL_API}/lookup.php?i=${encodeURIComponent(id)}`
    );

    const meal = data.meals?.[0];

    return meal ? formatMeal(meal) : null;
}

function isNonAlcoholic(drink) {
    const alcoholicType = (drink.strAlcoholic || "")
        .toLowerCase()
        .replace(/[_-]/g, " ")
        .trim();

    return alcoholicType.includes("non alcoholic");
}

async function getDrinkDetails(id) {
    const data = await requestData(
        `${DRINK_API}/lookup.php?i=${encodeURIComponent(id)}`
    );

    const drink = data.drinks?.[0];

    if (!drink || !isNonAlcoholic(drink)) {
        return null;
    }

    return formatDrink(drink);
}

// Busca pratos de diferentes categorias.
export async function getFood() {
    const categories = ["Beef", "Chicken", "Seafood"];

    const categoryResults = await Promise.allSettled(
        categories.map(async (category) => {
            const data = await requestData(
                `${MEAL_API}/filter.php?c=${encodeURIComponent(category)}`
            );

            return (data.meals || []).slice(0, 2);
        })
    );

    const basicMeals = categoryResults
        .filter(result => result.status === "fulfilled")
        .flatMap(result => result.value);

    const uniqueMeals = [
        ...new Map(basicMeals.map(meal => [meal.idMeal, meal])).values()
    ];

    const details = await Promise.allSettled(
        uniqueMeals.map(meal => getMealDetails(meal.idMeal))
    );

    return details
        .filter(result => result.status === "fulfilled" && result.value)
        .map(result => result.value);
}

// Busca sobremesas.
export async function getDesserts() {
    const data = await requestData(`${MEAL_API}/filter.php?c=Dessert`);

    const desserts = (data.meals || []).slice(0, 3);

    const details = await Promise.allSettled(
        desserts.map(dessert => getMealDetails(dessert.idMeal))
    );

    return details
        .filter(result => result.status === "fulfilled" && result.value)
        .map(result => result.value);
}

// Busca apenas drinks sem álcool.
export async function getDrinks() {
    const data = await requestData(
        `${DRINK_API}/filter.php?a=Non_Alcoholic`
    );

    const drinks = (data.drinks || []).slice(0, 3);

    const details = await Promise.allSettled(
        drinks.map(drink => getDrinkDetails(drink.idDrink))
    );

    return details
        .filter(result => result.status === "fulfilled" && result.value)
        .map(result => result.value);
}

// Pesquisa de comidas e sobremesas.
export async function searchFood(query) {
    const data = await requestData(
        `${MEAL_API}/search.php?s=${encodeURIComponent(query)}`
    );

    const meals = (data.meals || []).slice(0, 8);

    return meals.map(formatMeal);
}

// Pesquisa de bebidas, mantendo somente as sem álcool.
export async function searchDrinks(query) {
    const data = await requestData(
        `${DRINK_API}/search.php?s=${encodeURIComponent(query)}`
    );

    const drinks = (data.drinks || [])
        .filter(isNonAlcoholic)
        .slice(0, 6);

    const details = await Promise.allSettled(
        drinks.map(drink => getDrinkDetails(drink.idDrink))
    );

    return details
        .filter(result => result.status === "fulfilled" && result.value)
        .map(result => result.value);
}