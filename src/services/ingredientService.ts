import { db, type Ingredient } from '../db';

// --- CREATE ---
export async function addIngredient(ingredient: Omit<Ingredient, 'id'>): Promise<number> {
  return await db.ingredients.add(ingredient);
}

// --- UPDATE ---
export async function updateIngredient(id: number, changes: Partial<Omit<Ingredient, 'id'>>): Promise<number> {
  return await db.ingredients.update(id, changes);
}

// --- DELETE (Cascade) ---
export async function deleteIngredientCascade(ingredientId: number): Promise<void> {
  return db.transaction('rw', [db.ingredients, db.recipeIngredients, db.shoppingListOverride], async () => {

    await db.ingredients.delete(ingredientId);

    await db.recipeIngredients.where('ingredientId').equals(ingredientId).delete();

    await db.shoppingListOverride.where('ingredientId').equals(ingredientId).delete();
  });
}

export async function getIngredientUsageCount(ingredientId: number): Promise<number> {
  return await db.recipeIngredients.where('ingredientId').equals(ingredientId).count();
}