
const MEAL_API = "https://www.themealdb.com/api/json/v1/1";
const DRINK_API = "https://www.thecocktaildb.com/api/json/v1/1";

async function getData(url) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Não foi possível acessar a API.");
    }

    return response.json();
}

function getIngredients(item) {
    const ingredients = [];

    for (let i = 1; i <= 20; i++) {
        const ingredient = item[`strIngredient${i}`];

        if (ingredient && ingredient.trim()) {
            ingredients.push(ingredient.trim());
        }
    }

    return ingredients.slice(0, 4).join(", ");
}

function formatMeal(meal, category) {
    return {
        id: meal.idMeal,
        name: meal.strMeal,
        image: meal.strMealThumb,
        category,
        description: getIngredients(meal)
    };
}

function formatDrink(drink) {
    return {
        id: drink.idDrink,
        name: drink.strDrink,
        image: drink.strDrinkThumb,
        category: "Bebida",
        description: getIngredients(drink)
    };
}

async function getMealDetails(id, category) {
    const data = await getData(`${MEAL_API}/lookup.php?i=${id}`);

    if (data.meals && data.meals[0]) {
        return formatMeal(data.meals[0], category);
    }

    return null;
}

async function getDrinkDetails(id) {
    const data = await getData(`${DRINK_API}/lookup.php?i=${id}`);
    const drink = data.drinks && data.drinks[0];

    if (!drink || drink.strAlcoholic !== "Non alcoholic") {
        return null;
    }

    return formatDrink(drink);
}

async function getMealsByCategory(apiCategory, siteCategory, limit) {
    const data = await getData(`${MEAL_API}/filter.php?c=${apiCategory}`);
    const meals = (data.meals || []).slice(0, limit);

    const details = await Promise.all(
        meals.map(meal => getMealDetails(meal.idMeal, siteCategory))
    );

    return details.filter(meal => meal !== null);
}

export async function getFood() {
    const categories = ["Beef", "Chicken", "Seafood"];

    const results = await Promise.all(
        categories.map(category => getMealsByCategory(category, "Comida", 3))
    );

    return results.flat();
}

export async function getDesserts() {
    return getMealsByCategory("Dessert", "Sobremesa", 4);
}

export async function getDrinks() {
    const data = await getData(`${DRINK_API}/filter.php?a=Non_Alcoholic`);
    const drinks = (data.drinks || []).slice(0, 4);

    const details = await Promise.all(
        drinks.map(drink => getDrinkDetails(drink.idDrink))
    );

    return details.filter(drink => drink !== null);
}
