'use client';

import { useState } from 'react';
import { FullComponentInfo } from '@/lib/interfaces';
import { SearchIcon, FilterIcon, TagIcon } from 'lucide-react';

interface ComponentSelectorProps {
  components: FullComponentInfo[];
  selectedComponent: FullComponentInfo | null;
  onSelect: (component: FullComponentInfo) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function ComponentSelector({
  components,
  selectedComponent,
  onSelect,
  searchQuery,
  onSearchChange,
}: ComponentSelectorProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Build unique, sorted tag list from components
  const tags: string[] = Array.from(
    new Set(
      components.flatMap(c => (c.tags || []).filter(Boolean))
    )
  ).sort((a, b) => a.localeCompare(b));

  // First, apply search filter
  const searchFiltered = components.filter(component =>
    component.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Then, apply tag filter (if any)
  const filteredComponents = searchFiltered.filter(component =>
    selectedTag ? (component.tags || []).includes(selectedTag) : true
  );

  // Compute counts per tag within the search-filtered set
  const tagCounts: Record<string, number> = tags.reduce((acc, tag) => {
    acc[tag] = searchFiltered.filter(c => (c.tags || []).includes(tag)).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            id="component-search"
            name="component-search"
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
          {selectedTag && (
            <button
              onClick={() => setSelectedTag(null)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear filters
            </button>
          )}
        </div>
        
        {/* Tag Filters */}
        {showFilters && (
          <div className="mt-3 space-y-1" data-testid="filter-list">
            {tags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                className={`w-full text-left px-3 py-2 rounded text-sm flex items-center ${
                  selectedTag === tag 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'hover:bg-gray-100'
                }`}
              >
                <TagIcon className="w-4 h-4 mr-2 text-gray-500" />
                {tag}
                <span className="ml-auto text-xs text-gray-500">
                  {tagCounts[tag] || 0}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Component List - always flat, tags only filter */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="space-y-2">
            {filteredComponents.map(component => (
              <ComponentItem
                key={component.id}
                component={component}
                isSelected={selectedComponent?.id === component.id}
                onSelect={onSelect}
              />
            ))}
          </div>
        </div>
        
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
  component: FullComponentInfo;
  isSelected: boolean;
  onSelect: (component: FullComponentInfo) => void;
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