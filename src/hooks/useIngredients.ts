import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';

export function useIngredients() {

  const ingredients = useLiveQuery(
    () => db.ingredients.orderBy('name').toArray(),
    []
  );

  const isLoading = ingredients === undefined;

  return { ingredients: ingredients ?? [], isLoading };
}