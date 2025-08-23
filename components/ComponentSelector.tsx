'use client';

import { useState } from 'react';
import { FullComponentInfo } from '@/lib/interfaces';
import { SearchIcon, FilterIcon, TagIcon, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

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
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <Input
            id="component-search"
            name="component-search"
            type="text"
            icon={<SearchIcon className="w-4 h-4 mr-1" />}
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background border-input text-foreground placeholder:text-muted-foreground"
          />
          <div className="flex items-center justify-between ml-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              <FilterIcon className="w-4 h-4 mr-1" />
            </Button>
            {selectedTag && (
              <Button
                variant="outline"
                onClick={() => setSelectedTag(null)}
                className="text-sm text-primary hover:text-primary/80"
              >
                <X className="w-4 h-4 mr-1" />
              </Button>
            )}
          </div>
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
                    ? 'bg-primary/10 text-primary' 
                    : 'hover:bg-muted'
                }`}
              >
                <TagIcon className="w-4 h-4 mr-2 text-muted-foreground" />
                {tag}
                <span className="ml-auto text-xs text-muted-foreground">
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
          <div className="p-8 text-center text-muted-foreground">
            <SearchIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
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
          ? 'bg-primary/5 border-primary/30 ring-2 ring-primary/50' 
          : 'bg-card border-border hover:bg-muted'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center">
            <h4 className="font-medium text-foreground">{component.name}</h4>
            {component.version && (
              <span className="text-xs text-muted-foreground ml-2">
                v{component.version}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {component.description}
          </p>
          {component.tags && component.tags.length > 0 && (
            <div className="flex items-center mt-2 space-x-1">
              <TagIcon className="w-3 h-3 text-muted-foreground" />
              <div className="flex items-center flex-wrap gap-1">
                {component.tags.slice(0, 3).map(tag => (
                  <span
                    key={tag}
                    className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded"
                  >
                    {tag}
                  </span>
                ))}
                {component.tags.length > 3 && (
                  <span className="text-xs text-muted-foreground">
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