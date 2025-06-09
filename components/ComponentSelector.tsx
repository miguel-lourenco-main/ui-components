'use client';

import { useState } from 'react';
import { Component, LocalComponent } from '@/types';
import { SearchIcon, FilterIcon, TagIcon } from 'lucide-react';

interface ComponentSelectorProps {
  components: (Component | LocalComponent)[];
  selectedComponent: (Component | LocalComponent) | null;
  onSelect: (component: Component | LocalComponent) => void;
  searchQuery: string;
  selectedCategory: string | null;
  onSearchChange: (query: string) => void;
  onCategoryChange: (category: string | null) => void;
}

const categories = [
  { id: 'form', name: 'Form', icon: '📝' },
  { id: 'layout', name: 'Layout', icon: '📐' },
  { id: 'data-display', name: 'Data Display', icon: '📊' },
];

export default function ComponentSelector({
  components,
  selectedComponent,
  onSelect,
  searchQuery,
  selectedCategory,
  onSearchChange,
  onCategoryChange,
}: ComponentSelectorProps) {
  const [showFilters, setShowFilters] = useState(false);

  const filteredComponents = components.filter(component => {
    const matchesSearch = component.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         component.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (component.tags && component.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    
    const matchesCategory = !selectedCategory || component.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const groupedComponents = categories.reduce((acc, category) => {
    acc[category.id] = filteredComponents.filter(c => c.category === category.id);
    return acc;
  }, {} as Record<string, Component[]>);

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center justify-between mt-3 ml-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <FilterIcon className="w-4 h-4 mr-1" />
            Filters
          </button>
          {selectedCategory && (
            <button
              onClick={() => onCategoryChange(null)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear filters
            </button>
          )}
        </div>
        
        {/* Category Filters */}
        {showFilters && (
          <div className="mt-3 space-y-1">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id === selectedCategory ? null : category.id)}
                className={`w-full text-left px-3 py-2 rounded text-sm flex items-center ${
                  selectedCategory === category.id 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'hover:bg-gray-100'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
                <span className="ml-auto text-xs text-gray-500">
                  {groupedComponents[category.id]?.length || 0}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Component List */}
      <div className="flex-1 overflow-y-auto">
        {selectedCategory ? (
          // Show single category
          <div className="p-4">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center">
              <span className="mr-2">
                {categories.find(c => c.id === selectedCategory)?.icon}
              </span>
              {categories.find(c => c.id === selectedCategory)?.name}
            </h3>
            <div className="space-y-2">
              {groupedComponents[selectedCategory]?.map(component => (
                <ComponentItem
                  key={component.id}
                  component={component}
                  isSelected={selectedComponent?.id === component.id}
                  onSelect={onSelect}
                />
              ))}
            </div>
          </div>
        ) : (
          // Show all categories
          <div className="p-4 space-y-6">
            {categories.map(category => {
              const categoryComponents = groupedComponents[category.id];
              if (!categoryComponents || categoryComponents.length === 0) return null;

              return (
                <div key={category.id}>
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                    <span className="mr-2">{category.icon}</span>
                    {category.name}
                    <span className="ml-2 text-xs text-gray-500">
                      ({categoryComponents.length})
                    </span>
                  </h3>
                  <div className="space-y-2">
                    {categoryComponents.map(component => (
                      <ComponentItem
                        key={component.id}
                        component={component}
                        isSelected={selectedComponent?.id === component.id}
                        onSelect={onSelect}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {filteredComponents.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <SearchIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No components found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface ComponentItemProps {
  component: Component;
  isSelected: boolean;
  onSelect: (component: Component) => void;
}

function ComponentItem({ component, isSelected, onSelect }: ComponentItemProps) {
  return (
    <button
      onClick={() => onSelect(component)}
      className={`w-full overflow-hidden text-left p-3 rounded-lg border transition-colors ${
        isSelected 
          ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-500' 
          : 'bg-white border-gray-200 hover:bg-gray-50'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center">
            <h4 className="font-medium text-gray-900">{component.name}</h4>
            {component.version && (
              <span className="text-xs text-gray-500 ml-2">
                v{component.version}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {component.description}
          </p>
          {component.tags && component.tags.length > 0 && (
            <div className="flex items-center mt-2 space-x-1">
              <TagIcon className="w-3 h-3 text-gray-400" />
              <div className="flex items-center flex-wrap gap-1">
                {component.tags.slice(0, 3).map(tag => (
                  <span
                    key={tag}
                    className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                  >
                    {tag}
                  </span>
                ))}
                {component.tags.length > 3 && (
                  <span className="text-xs text-gray-500">
                    +{component.tags.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </button>
  );
} 