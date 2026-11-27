
import { getFood, getDesserts, getDrinks } from "./api.js";
import { renderMeals, showMessage } from "./interface.js";

async function loadMenu() {
    showMessage("Carregando o cardápio...");

    try {
        const food = await getFood();
        const drinks = await getDrinks();
        const desserts = await getDesserts();

        renderMeals(food, "foodGrid");
        renderMeals(drinks, "drinkGrid");
        renderMeals(desserts, "dessertGrid");

        showMessage("Cardápio carregado com sucesso!");

    } catch (error) {
        console.error(error);
        showMessage("Não foi possível carregar o cardápio. Tente novamente.");
    }
}

loadMenu();
