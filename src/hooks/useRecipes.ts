import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';

export function useRecipes() {
  const recipes = useLiveQuery(
    () => db.recipes.orderBy('name').toArray(),
    []
  );

  return { recipes: recipes ?? [], isLoading: recipes === undefined };
}