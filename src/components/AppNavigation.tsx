export type ActiveTab = 'planning' | 'shopping' | 'recipes' | 'ingredients';

interface AppNavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export function AppNavigation({ activeTab, onTabChange }: AppNavigationProps) {
  const tabs: { id: ActiveTab; label: string; icon: string }[] = [
    { id: 'planning', label: 'Planning', icon: '📅' },
    { id: 'shopping', label: 'Courses', icon: '🛒' },
    { id: 'recipes', label: 'Recettes', icon: '📖' },
    { id: 'ingredients', label: 'Ingrédients', icon: '🥦' },
  ];

  const handleSelect = (tabId: ActiveTab) => {
    if (activeTab !== tabId) {
      if ('vibrate' in navigator) navigator.vibrate(10);
      onTabChange(tabId);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-40">
      <div className="max-w-md mx-auto flex justify-around items-center h-16 px-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleSelect(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors ${
                isActive ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="text-xl leading-none mb-1">{tab.icon}</span>
              <span className="text-[11px] font-medium">{tab.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}