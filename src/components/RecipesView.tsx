import React, { useState } from 'react';
import { useRecipes } from '../hooks/useRecipes';
import { useIngredients } from '../hooks/useIngredients';
import { createRecipeWithIngredients, deleteRecipeCascade, getRecipeWithDetails } from '../services/recipeService';

interface SelectedIngredient {
  ingredientId: number;
  amount: number;
}

export function RecipesView() {
  const { recipes, isLoading: recipesLoading } = useRecipes();
  const { ingredients, isLoading: ingredientsLoading } = useIngredients();

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [servings, setServings] = useState(4);
  const [instructions, setInstructions] = useState('');
  
  // Recipe's ingredient list
  const [recipeIngredients, setRecipeIngredients] = useState<SelectedIngredient[]>([]);
  const [currentIngredientId, setCurrentIngredientId] = useState<number | ''>('');
  const [currentAmount, setCurrentAmount] = useState<number | ''>('');

  // State of selected recipe
  const [selectedRecipe, setSelectedRecipe] = useState<Awaited<ReturnType<typeof getRecipeWithDetails>> | null>(null);

  const handleAddIngredientToRecipe = () => {
    if (currentIngredientId === '' || currentAmount === '' || currentAmount <= 0) return;

    if (recipeIngredients.some((item) => item.ingredientId === Number(currentIngredientId))) {
      alert('Cet ingrédient est déjà dans la recette.');
      return;
    }

    setRecipeIngredients([
      ...recipeIngredients,
      { ingredientId: Number(currentIngredientId), amount: Number(currentAmount) },
    ]);

    setCurrentIngredientId('');
    setCurrentAmount('');
  };

  const handleRemoveIngredientFromForm = (ingredientId: number) => {
    setRecipeIngredients(recipeIngredients.filter((item) => item.ingredientId !== ingredientId));
  };

  const handleSubmitRecipe = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (recipeIngredients.length === 0) {
      alert('Veuillez ajouter au moins un ingrédient à la recette.');
      return;
    }

    await createRecipeWithIngredients(
      { name: name.trim(), servings, instructions: instructions.trim() || undefined },
      recipeIngredients
    );

    if ('vibrate' in navigator) navigator.vibrate(10);

    setName('');
    setServings(4);
    setInstructions('');
    setRecipeIngredients([]);
    setIsFormOpen(false);
  };

  const handleDeleteRecipe = async (recipeId: number) => {
    if (confirm('Supprimer cette recette ? Elle sera également retirée du planning.')) {
      await deleteRecipeCascade(recipeId);
      if (selectedRecipe?.id === recipeId) setSelectedRecipe(null);
      if ('vibrate' in navigator) navigator.vibrate([10, 30, 10]);
    }
  };

  const handleSelectRecipe = async (recipeId: number) => {
    const details = await getRecipeWithDetails(recipeId);
    setSelectedRecipe(details);
  };

  if (recipesLoading || ingredientsLoading) {
    return <div className="p-4 text-center">Chargement des recettes...</div>;
  }

  return (
    <div className="p-4 max-w-lg mx-auto pb-20">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Recettes</h2>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-emerald-700"
        >
          {isFormOpen ? 'Fermer' : '+ Nouvelle Recette'}
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmitRecipe} className="mb-8 p-4 bg-slate-50 border rounded-xl flex flex-col gap-4">
          <h3 className="font-semibold text-lg border-b pb-2">Créer une recette</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la recette</label>
            <input
              type="text"
              placeholder="ex: Pâte à crêpes, Quiche lorraine..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded-lg bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Portions de référence</label>
            <input
              type="number"
              min="1"
              value={servings}
              onChange={(e) => setServings(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full p-2 border rounded-lg bg-white"
              required
            />
          </div>

          <div className="p-3 bg-white border rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">Ingrédients de la recette</label>
            
            <div className="flex gap-2 mb-3">
              <select
                value={currentIngredientId}
                onChange={(e) => setCurrentIngredientId(e.target.value ? Number(e.target.value) : '')}
                className="p-2 border rounded-lg flex-1 text-sm"
              >
                <option value="">Sélectionner un ingrédient</option>
                {ingredients.map((ing) => (
                  <option key={ing.id} value={ing.id}>
                    {ing.name} ({ing.unit})
                  </option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Qté"
                min="0.1"
                step="any"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value ? Number(e.target.value) : '')}
                className="p-2 border rounded-lg w-20 text-sm"
              />

              <button
                type="button"
                onClick={handleAddIngredientToRecipe}
                className="bg-slate-800 text-white px-3 py-2 rounded-lg text-sm"
              >
                Ajouter
              </button>
            </div>

            {recipeIngredients.length > 0 ? (
              <ul className="divide-y border-t text-sm">
                {recipeIngredients.map((item) => {
                  const ing = ingredients.find((i) => i.id === item.ingredientId);
                  return (
                    <li key={item.ingredientId} className="py-1.5 flex justify-between items-center">
                      <span>
                        {ing?.name} : <strong>{item.amount}</strong> {ing?.unit}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveIngredientFromForm(item.ingredientId)}
                        className="text-red-500 font-bold px-2"
                      >
                        ✕
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-xs text-gray-500 italic">Aucun ingrédient ajouté pour l'instant.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Instructions (Optionnel)</label>
            <textarea
              placeholder="Étapes de préparation..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full p-2 border rounded-lg bg-white h-20 text-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 text-white py-2.5 rounded-lg font-semibold hover:bg-emerald-700"
          >
            Enregistrer la recette
          </button>
        </form>
      )}

      <div className="grid gap-3">
        {recipes.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Aucune recette enregistrée.</p>
        ) : (
          recipes.map((recipe) => (
            <div
              key={recipe.id}
              className="p-4 border rounded-xl bg-white shadow-sm flex justify-between items-center"
            >
              <div
                onClick={() => recipe.id && handleSelectRecipe(recipe.id)}
                className="cursor-pointer flex-1"
              >
                <h3 className="font-semibold text-lg text-gray-900">{recipe.name}</h3>
                <p className="text-xs text-gray-500">Portions de base : {recipe.servings} pers.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => recipe.id && handleSelectRecipe(recipe.id)}
                  className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1.5 rounded-lg"
                >
                  Voir
                </button>
                <button
                  onClick={() => recipe.id && handleDeleteRecipe(recipe.id)}
                  className="text-xs bg-red-50 text-red-600 px-2.5 py-1.5 rounded-lg hover:bg-red-100"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedRecipe && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold">{selectedRecipe.name}</h3>
                <p className="text-xs text-gray-500">Pour {selectedRecipe.servings} personnes</p>
              </div>
              <button
                onClick={() => setSelectedRecipe(null)}
                className="text-gray-400 hover:text-gray-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <h4 className="font-semibold text-sm text-gray-700 mb-2">Ingrédients :</h4>
            <ul className="divide-y border-t border-b mb-4">
              {selectedRecipe.ingredients.map((item) => (
                <li key={item.id} className="py-2 text-sm flex justify-between">
                  <span>{item.ingredientDetails?.name}</span>
                  <span className="font-medium">
                    {item.amount} {item.ingredientDetails?.unit}
                  </span>
                </li>
              ))}
            </ul>

            {selectedRecipe.instructions && (
              <div className="mb-4">
                <h4 className="font-semibold text-sm text-gray-700 mb-1">Instructions :</h4>
                <p className="text-xs text-gray-600 whitespace-pre-line bg-slate-50 p-3 rounded-lg">
                  {selectedRecipe.instructions}
                </p>
              </div>
            )}

            <button
              onClick={() => setSelectedRecipe(null)}
              className="w-full bg-slate-800 text-white py-2 rounded-lg text-sm font-medium"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}