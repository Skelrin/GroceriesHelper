import { db } from '../db';

export async function setTargetIngredientAmount(ingredientId: number, targetAmount: number, calculatedAmount: number): Promise<void> {
  const validTarget = Math.max(0, targetAmount);
  const extraAmount = validTarget - calculatedAmount;

  const existing = await db.shoppingListOverride.where('ingredientId').equals(ingredientId).first();

  if (existing && existing.id) {
    await db.shoppingListOverride.update(existing.id, { extraAmount });
  } else {
    await db.shoppingListOverride.add({
      ingredientId,
      extraAmount,
      isChecked: false,
    });
  }
}

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

export async function updateIngredientExtraAmount(ingredientId: number, extraAmount: number): Promise<void> {
  const existing = await db.shoppingListOverride.where('ingredientId').equals(ingredientId).first();

  if (existing && existing.id) {
    await db.shoppingListOverride.update(existing.id, { extraAmount });
  } else {
    await db.shoppingListOverride.add({
      ingredientId,
      extraAmount,
      isChecked: false,
    });
  }
}

export async function clearCheckedIngredients(): Promise<void> {
  await db.shoppingListOverride.toCollection().modify({ isChecked: false });
}

export async function resetShoppingListOverrides(): Promise<void> {
  await db.shoppingListOverride.clear();
}