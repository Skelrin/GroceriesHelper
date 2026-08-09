import { useState, useEffect } from 'react';
import { AppNavigation, type ActiveTab } from './components/AppNavigation';
import { PlanningView } from './components/PlanningView';
import { ShoppingListView } from './components/ShoppingListView';
import { RecipesView } from './components/RecipesView';
import { IngredientsView } from './components/IngredientsView';
import { cleanupOldMealPlans } from './services/mealPlanService';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('planning');

  useEffect(() => {
    cleanupOldMealPlans(15).catch((err) => {
      console.error('Erreur lors du nettoyage d IndexedDB :', err);
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">

      <main className="max-w-md mx-auto">
        {activeTab === 'planning' && <PlanningView />}
        {activeTab === 'shopping' && <ShoppingListView />}
        {activeTab === 'recipes' && <RecipesView />}
        {activeTab === 'ingredients' && <IngredientsView />}
      </main>

      <AppNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default App;