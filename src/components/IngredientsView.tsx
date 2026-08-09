import React, { useState } from 'react';
import { useIngredients } from '../hooks/useIngredients';
import { addIngredient, deleteIngredientCascade } from '../services/ingredientService';
import type { Ingredient } from '../db';

export function IngredientsView() {
  const { ingredients, isLoading } = useIngredients();

  const [name, setName] = useState('');
  const [unit, setUnit] = useState<Ingredient['unit']>('g');
  const [category, setCategory] = useState<Ingredient['category']>('Épicerie');

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await addIngredient({ name: name.trim(), unit, category });
    
    if ('vibrate' in navigator) navigator.vibrate(10);
    
    setName('');
  };

  const handleDelete = async (id: number) => {
    if (confirm('Supprimer cet ingrédient ? Il sera retiré de toutes vos recettes.')) {
      await deleteIngredientCascade(id);
      if ('vibrate' in navigator) navigator.vibrate([10, 30, 10]);
    }
  };

  if (isLoading) return <div className="p-4">Chargement de la base...</div>;

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Ingrédients</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2 mb-6 p-3 bg-slate-100 rounded-lg">
        <input
          type="text"
          placeholder="Nom (ex: Farine)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="p-2 border rounded"
          required
        />
        
        <div className="flex gap-2">
          <select 
            value={unit} 
            onChange={(e) => setUnit(e.target.value as Ingredient['unit'])}
            className="p-2 border rounded flex-1"
          >
            <option value="g">Grammes (g)</option>
            <option value="ml">Millilitres (ml)</option>
            <option value="piece">Pièce(s)</option>
          </select>

          <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value as Ingredient['category'])}
            className="p-2 border rounded flex-1"
          >
            <option value="Légumes">Légumes</option>
            <option value="Fruits">Fruits</option>
            <option value="Épicerie">Épicerie</option>
            <option value="Viandes">Viandes</option>
            <option value="Surgelés">Surgelés</option>
            <option value="Boissons">Boissons</option>
            <option value="Autre">Autre</option>
          </select>
        </div>

        <button type="submit" className="bg-emerald-600 text-white py-2 rounded font-medium mt-1">
          + Ajouter l'ingrédient
        </button>
      </form>

      <ul className="divide-y border-t border-b">
        {ingredients.map((item) => (
          <li key={item.id} className="py-2 flex justify-between items-center">
            <div>
              <span className="font-semibold">{item.name}</span>
              <span className="text-xs text-gray-500 ml-2">({item.unit}) • {item.category}</span>
            </div>
            <button 
              onClick={() => item.id && handleDelete(item.id)}
              className="text-red-500 hover:text-red-700 text-sm p-1"
            >
              Supprimer
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}