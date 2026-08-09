import React, { useState } from 'react';
import { useMealPlan } from '../hooks/useMealPlan';
import { useRecipes } from '../hooks/useRecipes';
import { setMealPlan, removeMealFromPlan, updateMealServings } from '../services/mealPlanService';
import { getMonday, getWeekDays, formatDateIso, DAY_NAMES } from '../utils/dateUtils';

export function PlanningView() {
  const [currentMonday, setCurrentMonday] = useState<Date>(() => getMonday(new Date()));
  const weekDays = getWeekDays(currentMonday);
  
  const startDate = formatDateIso(weekDays[0]);
  const endDate = formatDateIso(weekDays[6]);

  const { mealPlan, isLoading: planLoading } = useMealPlan(startDate, endDate);
  const { recipes, isLoading: recipesLoading } = useRecipes();

  const [activeSlot, setActiveSlot] = useState<{ date: string; mealType: 'lunch' | 'dinner' } | null>(null);
  const [selectedRecipeId, setSelectedRecipeId] = useState<number | ''>('');
  const [servings, setServings] = useState<number>(4);

  const handlePrevWeek = () => {
    const prev = new Date(currentMonday);
    prev.setDate(prev.getDate() - 7);
    setCurrentMonday(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(currentMonday);
    next.setDate(next.getDate() + 7);
    setCurrentMonday(next);
  };

  const handleOpenModal = (dateStr: string, mealType: 'lunch' | 'dinner') => {
    const existing = mealPlan.find((m) => m.date === dateStr && m.mealType === mealType);
    setActiveSlot({ date: dateStr, mealType });
    if (existing) {
      setSelectedRecipeId(existing.recipeId);
      setServings(existing.servings);
    } else {
      setSelectedRecipeId('');
      setServings(4);
    }
  };

  const handleSaveMeal = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!activeSlot || selectedRecipeId === '') return;

    await setMealPlan({
      date: activeSlot.date,
      mealType: activeSlot.mealType,
      recipeId: Number(selectedRecipeId),
      servings,
    });

    if ('vibrate' in navigator) navigator.vibrate(10);
    setActiveSlot(null);
  };

  const handleServingsChange = async (mealPlanId: number, newServings: number) => {
    if (newServings < 1) return;
    await updateMealServings(mealPlanId, newServings);
  };

  const handleRemoveMeal = async (mealPlanId: number) => {
    await removeMealFromPlan(mealPlanId);
    if ('vibrate' in navigator) navigator.vibrate([10, 30, 10]);
  };

  if (planLoading || recipesLoading) {
    return <div className="p-4 text-center">Chargement du planning...</div>;
  }

  return (
    <div className="p-4 max-w-xl mx-auto pb-20">
      <div className="flex justify-between items-center mb-6 bg-slate-800 p-3 rounded-xl text-white">
        <button
          onClick={handlePrevWeek}
          className="bg-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-600"
        >
          ← Préc.
        </button>
        <span className="font-semibold text-sm">
          Du {weekDays[0].toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} au{' '}
          {weekDays[6].toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
        </span>
        <button
          onClick={handleNextWeek}
          className="bg-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-600"
        >
          Suiv. →
        </button>
      </div>

      <div className="space-y-4">
        {weekDays.map((dayDate, index) => {
          const dateStr = formatDateIso(dayDate);
          const lunch = mealPlan.find((m) => m.date === dateStr && m.mealType === 'lunch');
          const dinner = mealPlan.find((m) => m.date === dateStr && m.mealType === 'dinner');
          const isToday = formatDateIso(new Date()) === dateStr;

          return (
            <div
              key={dateStr}
              className={`border rounded-xl p-3 bg-slate-900 text-white ${
                isToday ? 'ring-2 ring-emerald-500 border-transparent' : 'border-slate-800'
              }`}
            >
              <div className="mb-3 border-b border-slate-800 pb-1">
                <span className={isToday ? 'font-extrabold text-emerald-400 text-lg' : 'font-medium text-slate-300'}>
                  {DAY_NAMES[index]} {dayDate.getDate()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700 flex flex-col justify-between min-h-[75px]">
                  <span className="font-semibold text-amber-400 mb-1">☀️ Midi</span>
                  {lunch ? (
                    <div>
                      <p className="font-bold truncate my-1">{lunch.recipe?.name ?? 'Recette inconnue'}</p>
                      <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => lunch.id && handleServingsChange(lunch.id, lunch.servings - 1)}
                            className="w-5 h-5 bg-slate-700 rounded font-bold"
                          >
                            -
                          </button>
                          <span>{lunch.servings}p</span>
                          <button
                            onClick={() => lunch.id && handleServingsChange(lunch.id, lunch.servings + 1)}
                            className="w-5 h-5 bg-slate-700 rounded font-bold"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => lunch.id && handleRemoveMeal(lunch.id)}
                          className="text-red-400 font-bold px-1"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleOpenModal(dateStr, 'lunch')}
                      className="mt-2 py-1 px-3 bg-slate-700 rounded text-slate-200 font-medium hover:bg-slate-600 self-start"
                    >
                      + Ajouter
                    </button>
                  )}
                </div>

                <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700 flex flex-col justify-between min-h-[75px]">
                  <span className="font-semibold text-indigo-400 mb-1">🌙 Soir</span>
                  {dinner ? (
                    <div>
                      <p className="font-bold truncate my-1">{dinner.recipe?.name ?? 'Recette inconnue'}</p>
                      <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => dinner.id && handleServingsChange(dinner.id, dinner.servings - 1)}
                            className="w-5 h-5 bg-slate-700 rounded font-bold"
                          >
                            -
                          </button>
                          <span>{dinner.servings}p</span>
                          <button
                            onClick={() => dinner.id && handleServingsChange(dinner.id, dinner.servings + 1)}
                            className="w-5 h-5 bg-slate-700 rounded font-bold"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => dinner.id && handleRemoveMeal(dinner.id)}
                          className="text-red-400 font-bold px-1"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleOpenModal(dateStr, 'dinner')}
                      className="mt-2 py-1 px-3 bg-slate-700 rounded text-slate-200 font-medium hover:bg-slate-600 self-start"
                    >
                      + Ajouter
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {activeSlot && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 text-white rounded-2xl p-5 max-w-sm w-full shadow-xl">
            <h3 className="font-bold text-lg mb-4">
              Planifier le repas ({activeSlot.mealType === 'lunch' ? 'Midi' : 'Soir'})
            </h3>

            <form onSubmit={handleSaveMeal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Choisir une recette</label>
                <select
                  value={selectedRecipeId}
                  onChange={(e) => {
                    const id = e.target.value ? Number(e.target.value) : '';
                    setSelectedRecipeId(id);
                    const rec = recipes.find((r) => r.id === id);
                    if (rec) setServings(rec.servings);
                  }}
                  className="w-full p-2 border border-slate-600 rounded-lg text-sm bg-slate-900 text-white"
                  required
                >
                  <option value="">-- Sélectionner --</option>
                  {recipes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.servings} pers.)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre de convives</label>
                <input
                  type="number"
                  min="1"
                  value={servings}
                  onChange={(e) => setServings(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full p-2 border border-slate-600 rounded-lg text-sm bg-slate-900 text-white"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveSlot(null)}
                  className="flex-1 py-2 bg-slate-700 text-slate-200 rounded-lg text-sm font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-500"
                >
                  Valider
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}