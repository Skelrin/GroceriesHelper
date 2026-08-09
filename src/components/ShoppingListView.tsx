import { useState } from 'react';
import { useShoppingList } from '../hooks/useShoppingList';
import { toggleIngredientCheck, clearCheckedIngredients } from '../services/shoppingService';
import { getMonday, getWeekDays, formatDateIso } from '../utils/dateUtils';

export function ShoppingListView() {
  const defaultMonday = getMonday(new Date());
  const defaultWeek = getWeekDays(defaultMonday);

  const [startDate, setStartDate] = useState<string>(formatDateIso(defaultWeek[0]));
  const [endDate, setEndDate] = useState<string>(formatDateIso(defaultWeek[6]));

  const { shoppingList, isLoading } = useShoppingList(startDate, endDate);

  const setThisWeek = () => {
    const monday = getMonday(new Date());
    const week = getWeekDays(monday);
    setStartDate(formatDateIso(week[0]));
    setEndDate(formatDateIso(week[6]));
  };

  const setNextWeek = () => {
    const monday = getMonday(new Date());
    monday.setDate(monday.getDate() + 7);
    const week = getWeekDays(monday);
    setStartDate(formatDateIso(week[0]));
    setEndDate(formatDateIso(week[6]));
  };

  const handleToggleCheck = async (ingredientId?: number, isChecked?: boolean) => {
    if (!ingredientId) return;
    await toggleIngredientCheck(ingredientId, !!isChecked);
    if ('vibrate' in navigator) navigator.vibrate(10);
  };

  const categories = Array.from(new Set(shoppingList.map((item) => item.ingredient.category)));

  return (
    <div className="p-4 max-w-lg mx-auto pb-24">
      <h2 className="text-2xl font-bold mb-4">Liste de Courses</h2>

      <div className="bg-slate-100 p-3.5 rounded-2xl mb-6 space-y-3">
        <div className="flex gap-2">
          <button
            onClick={setThisWeek}
            className="flex-1 py-1.5 bg-white rounded-lg text-xs font-semibold text-slate-700 shadow-sm border"
          >
            Cette semaine
          </button>
          <button
            onClick={setNextWeek}
            className="flex-1 py-1.5 bg-white rounded-lg text-xs font-semibold text-slate-700 shadow-sm border"
          >
            Semaine prochaine
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1">Du :</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 border rounded-lg bg-white text-xs font-semibold"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1">Au :</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 border rounded-lg bg-white text-xs font-semibold"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Génération de la liste...</div>
      ) : shoppingList.length === 0 ? (
        <div className="text-center py-10 bg-slate-50 border rounded-2xl p-4">
          <p className="text-gray-500 text-sm">Aucun repas planifié sur cette période.</p>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-3 px-1">
            <span className="text-xs text-gray-500 font-medium">
              {shoppingList.filter((i) => i.isChecked).length} / {shoppingList.length} coché(s)
            </span>
            <button
              onClick={() => clearCheckedIngredients()}
              className="text-xs text-red-600 font-semibold hover:underline"
            >
              Décocher tout
            </button>
          </div>

          <div className="space-y-5">
            {categories.map((category) => {
              const categoryItems = shoppingList.filter((item) => item.ingredient.category === category);

              return (
                <div key={category} className="bg-white border rounded-2xl p-4 shadow-sm">
                  <h3 className="font-bold text-sm text-emerald-800 border-b pb-2 mb-2">{category}</h3>
                  <ul className="divide-y">
                    {categoryItems.map(({ ingredient, totalAmount, isChecked }) => (
                      <li
                        key={ingredient.id}
                        onClick={() => handleToggleCheck(ingredient.id, isChecked)}
                        className={`py-2.5 flex justify-between items-center cursor-pointer select-none ${
                          isChecked ? 'opacity-40 line-through' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="font-medium text-sm text-gray-800">{ingredient.name}</span>
                        </div>
                        <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full">
                          {totalAmount} {ingredient.unit}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}