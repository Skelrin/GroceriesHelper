import { db } from '../db';

export async function toggleIngredientCheck(ingredientId: number, currentChecked: boolean): Promise<void> {
  const existing = await db.shoppingListOverride.where('ingredientId').equals(ingredientId).first();

  if (existing && existing.id) {
    await db.shoppingListOverride.update(existing.id, { isChecked: !currentChecked });
  } else {
    await db.shoppingListOverride.add({
      ingredientId,
      extraAmount: 0,
      isChecked: true,
    });
  }
}

export async function clearCheckedIngredients(): Promise<void> {
  await db.shoppingListOverride.toCollection().modify({ isChecked: false });
}