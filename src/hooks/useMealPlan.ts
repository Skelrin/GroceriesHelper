import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';

export function useMealPlan(startDate: string, endDate: string) {
  const mealPlan = useLiveQuery(
    async () => {
      const meals = await db.mealPlan
        .where('date')
        .between(startDate, endDate, true, true)
        .toArray();

      const recipeIds = meals.map((m) => m.recipeId);
      const recipes = await db.recipes.where('id').anyOf(recipeIds).toArray();
      const recipesMap = new Map(recipes.map((r) => [r.id, r]));

      return meals.map((meal) => ({
        ...meal,
        recipe: recipesMap.get(meal.recipeId),
      }));
    },
    [startDate, endDate]
  );

  return {
    mealPlan: mealPlan ?? [],
    isLoading: mealPlan === undefined,
  };
}