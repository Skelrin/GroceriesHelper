import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Ingredient } from '../db';

export interface ShoppingListItem {
  ingredient: Ingredient;
  totalAmount: number;
  isChecked: boolean;
  extraAmount: number;
  calculatedAmount: number;
}

export function useShoppingList(startDate: string, endDate: string) {
  const shoppingList = useLiveQuery(
    async () => {
      const meals = (startDate && endDate)
        ? await db.mealPlan.where('date').between(startDate, endDate, true, true).toArray()
        : [];

      const recipeIds = Array.from(new Set(meals.map((m) => m.recipeId)));
      const recipes = await db.recipes.where('id').anyOf(recipeIds).toArray();
      const recipesMap = new Map(recipes.map((r) => [r.id, r]));

      const recipeIngredients = await db.recipeIngredients
        .where('recipeId')
        .anyOf(recipeIds)
        .toArray();

      const totalsMap = new Map<number, number>();

      for (const meal of meals) {
        const recipe = recipesMap.get(meal.recipeId);
        if (!recipe || !recipe.id) continue;

        const ratio = meal.servings / recipe.servings;
        const currentRecipeIngredients = recipeIngredients.filter((ri) => ri.recipeId === recipe.id);

        for (const ri of currentRecipeIngredients) {
          const currentTotal = totalsMap.get(ri.ingredientId) || 0;
          totalsMap.set(ri.ingredientId, currentTotal + ri.amount * ratio);
        }
      }

      const overrides = await db.shoppingListOverride.toArray();
      const overridesMap = new Map(overrides.map((o) => [o.ingredientId, o]));

      const allIngredientIds = Array.from(
        new Set([
          ...totalsMap.keys(),
          ...overrides.filter(o => o.extraAmount !== 0).map(o => o.ingredientId)
        ])
      );

      if (allIngredientIds.length === 0) return [];

      const ingredients = await db.ingredients.where('id').anyOf(allIngredientIds).toArray();
      const ingredientsMap = new Map(ingredients.map((i) => [i.id, i]));

      const items: ShoppingListItem[] = [];

      for (const ingredientId of allIngredientIds) {
        const ingredient = ingredientsMap.get(ingredientId);
        if (!ingredient) continue;

        const calculatedAmount = totalsMap.get(ingredientId) || 0;
        const override = overridesMap.get(ingredientId);
        const extraAmount = override?.extraAmount ?? 0;
        const totalAmount = Math.round((calculatedAmount + extraAmount) * 10) / 10;

        if (totalAmount <= 0) continue;

        items.push({
          ingredient,
          calculatedAmount,
          totalAmount,
          isChecked: override?.isChecked ?? false,
          extraAmount,
        });
      }

      return items.sort((a, b) => {
        if (a.ingredient.category !== b.ingredient.category) {
          return a.ingredient.category.localeCompare(b.ingredient.category);
        }
        return a.ingredient.name.localeCompare(b.ingredient.name);
      });
    },
    [startDate, endDate]
  );

  return {
    shoppingList: shoppingList ?? [],
    isLoading: shoppingList === undefined,
  };
}