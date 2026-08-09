import { useState } from 'react';
import type { ShoppingListItem } from '../hooks/useShoppingList';
import { toggleIngredientCheck, setTargetIngredientAmount } from '../services/shoppingService';

interface ShoppingItemRowProps {
  item: ShoppingListItem;
}

export function ShoppingItemRow({ item }: ShoppingItemRowProps) {
  const { ingredient, totalAmount, calculatedAmount, isChecked } = item;
  const [inputValue, setInputValue] = useState<string>(totalAmount.toString());

  if (inputValue !== totalAmount.toString() && document.activeElement?.tagName !== 'INPUT') {
    setInputValue(totalAmount.toString());
  }

  const numericValue = parseFloat(inputValue);
  const isInvalid = !isNaN(numericValue) && numericValue < calculatedAmount;

  const handleBlurOrSubmit = async () => {
    if (isNaN(numericValue) || numericValue < calculatedAmount) {
      setInputValue(totalAmount.toString());
      return;
    }

    if (ingredient.id) {
      await setTargetIngredientAmount(ingredient.id, numericValue, calculatedAmount);
    }
  };

  return (
    <li className="py-2.5 flex justify-between items-center gap-3">
      <div 
        onClick={() => ingredient.id && toggleIngredientCheck(ingredient.id, isChecked)} 
        className={`flex items-center gap-3 cursor-pointer flex-1 ${isChecked ? 'opacity-40 line-through' : ''}`}
      >
        <input 
          type="checkbox" 
          checked={isChecked} 
          readOnly 
          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500" 
        />
        <span className="font-medium text-sm text-gray-800">{ingredient.name}</span>
      </div>

      <div className="flex flex-col items-end">
        <div 
          className={`flex items-center gap-1.5 p-1 rounded-lg border transition-colors ${
            isInvalid 
              ? 'bg-red-50 border-red-500 ring-1 ring-red-500' 
              : 'bg-slate-100 border-slate-200 focus-within:ring-2 focus-within:ring-emerald-500'
          }`}
        >
          <input
            type="number"
            min={calculatedAmount}
            step={ingredient.unit === 'piece' ? '1' : '10'}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={handleBlurOrSubmit}
            onKeyDown={(e) => e.key === 'Enter' && handleBlurOrSubmit()}
            className={`w-16 text-right px-2 py-0.5 rounded text-xs font-bold border-none focus:outline-none ${
              isInvalid ? 'bg-red-100 text-red-700' : 'bg-white text-slate-800'
            }`}
          />
          <span className={`text-xs font-semibold pr-1.5 ${isInvalid ? 'text-red-500' : 'text-slate-500'}`}>
            {ingredient.unit}
          </span>
        </div>

        {isInvalid && (
          <span className="text-[10px] font-semibold text-red-500 mt-0.5">
            Min. {calculatedAmount} {ingredient.unit}
          </span>
        )}
      </div>
    </li>
  );
}