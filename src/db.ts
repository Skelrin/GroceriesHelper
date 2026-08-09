import Dexie, { type Table } from 'dexie';

export interface Ingredient {
  id?: number;
  name: string;
  unit: 'g' | 'ml' | 'piece';
  category: 'Légumes' | 'Fruits' | 'Épicerie' | 'Viandes' | 'Surgelés' | 'Boissons' | 'Autre';
}

export interface Recipe {
  id?: number;
  name: string;
  servings: number;
  instructions?: string;
}

export interface RecipeIngredient {
  id?: number;
  recipeId: number;
  ingredientId: number;
  amount: number;
}

export interface MealPlan {
  id?: number;
  date: string;         // Format ISO 'YYYY-MM-DD'
  mealType: 'lunch' | 'dinner';
  recipeId: number;
  servings: number;
}

export interface ShoppingListOverride {
  id?: number;
  ingredientId: number;
  extraAmount: number;
  isChecked: boolean;
}

export class GroceriesDatabase extends Dexie {
  ingredients!: Table<Ingredient, number>;
  recipes!: Table<Recipe, number>;
  recipeIngredients!: Table<RecipeIngredient, number>;
  mealPlan!: Table<MealPlan, number>;
  shoppingListOverride!: Table<ShoppingListOverride, number>;

  constructor() {
    super('GroceriesHelperDB');

    this.version(1).stores({
      ingredients: '++id, name, category',
      recipes: '++id, name',
      recipeIngredients: '++id, recipeId, ingredientId',
      mealPlan: '++id, date, mealType, recipeId',
      shoppingListOverride: '++id, ingredientId, isChecked'
    });
  }
}

export const db = new GroceriesDatabase();