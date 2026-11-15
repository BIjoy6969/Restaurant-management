import React from 'react';
import { MenuCategory } from '../types';
import { Search, X, Sparkles, Flame, Leaf } from 'lucide-react';

interface CategoryTabsProps {
  categories: MenuCategory[];
  activeCategory: string;
  onSelectCategory: (categoryId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
}) => {
  const filterTags = [
    { id: 'ALL', label: 'All Dishes', icon: null },
    { id: 'Chef Special', label: "Chef's Special", icon: Sparkles },
    { id: 'Vegetarian', label: 'Vegetarian', icon: Leaf },
    { id: 'Spicy', label: 'Spicy', icon: Flame },
  ];

  return (
    <div className="sticky top-16 z-30 bg-[#FAF8F5]/95 backdrop-blur-md py-3 -mx-4 px-4 sm:mx-0 sm:px-0 border-b border-stone-200/60 mb-6 transition-all">
      {/* Search Bar & Dietary Quick Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search our culinary dishes, smashed burgers, mocktails..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-11 pr-10 py-2.5 text-sm bg-white border border-stone-300 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 shadow-xs transition-all font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dietary Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          {filterTags.map((tag) => {
            const Icon = tag.icon;
            const isSelected = activeFilter === tag.id;
            return (
              <button
                key={tag.id}
                onClick={() => onFilterChange(tag.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-stone-900 text-white shadow-md'
                    : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
                }`}
              >
                {Icon && <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-400' : 'text-stone-500'}`} />}
                <span>{tag.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Categories Pills */}
      <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
        <button
          onClick={() => onSelectCategory('ALL')}
          className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
            activeCategory === 'ALL'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30 scale-[1.02]'
              : 'bg-white text-stone-700 hover:bg-stone-100 hover:text-stone-900 border border-stone-300'
          }`}
        >
          All Categories
        </button>
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30 scale-[1.02]'
                  : 'bg-white text-stone-700 hover:bg-stone-100 hover:text-stone-900 border border-stone-300'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};

