import { db, type Recipe, type RecipeIngredient } from '../db';

export interface IngredientInput {
  ingredientId: number;
  amount: number;
}

// --- CREATE ---
export async function createRecipeWithIngredients(
  recipeData: Omit<Recipe, 'id'>,
  ingredients: IngredientInput[]
): Promise<number> {
  return db.transaction('rw', [db.recipes, db.recipeIngredients], async () => {
    const recipeId = await db.recipes.add(recipeData);

    const recipeIngredients: Omit<RecipeIngredient, 'id'>[] = ingredients.map((ing) => ({
      recipeId,
      ingredientId: ing.ingredientId,
      amount: ing.amount,
    }));

    await db.recipeIngredients.bulkAdd(recipeIngredients);

    return recipeId;
  });
}

// --- READ (Détails complets) ---
export async function getRecipeWithDetails(recipeId: number) {
  const recipe = await db.recipes.get(recipeId);
  if (!recipe) return null;

  const recipeIngredients = await db.recipeIngredients
    .where('recipeId')
    .equals(recipeId)
    .toArray();

  const ingredientIds = recipeIngredients.map((ri) => ri.ingredientId);
  const ingredients = await db.ingredients.where('id').anyOf(ingredientIds).toArray();

  const ingredientsMap = new Map(ingredients.map((ing) => [ing.id, ing]));

  const detailedIngredients = recipeIngredients.map((ri) => ({
    ...ri,
    ingredientDetails: ingredientsMap.get(ri.ingredientId),
  }));

  return {
    ...recipe,
    ingredients: detailedIngredients,
  };
}

// --- DELETE (Cascade) ---
export async function deleteRecipeCascade(recipeId: number): Promise<void> {
  return db.transaction('rw', [db.recipes, db.recipeIngredients, db.mealPlan], async () => {
    await db.recipes.delete(recipeId);
    await db.recipeIngredients.where('recipeId').equals(recipeId).delete();
    await db.mealPlan.where('recipeId').equals(recipeId).delete();
  });
}