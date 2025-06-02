'use client';

import { MonitorIcon, TabletIcon, SmartphoneIcon } from 'lucide-react';

interface ViewportControlsProps {
  viewMode: 'desktop' | 'tablet' | 'mobile';
  onViewModeChange: (mode: 'desktop' | 'tablet' | 'mobile') => void;
}

const viewModes = [
  {
    id: 'desktop' as const,
    name: 'Desktop',
    icon: MonitorIcon,
    width: '100%',
    description: 'Desktop view (1024px+)',
  },
  {
    id: 'tablet' as const,
    name: 'Tablet',
    icon: TabletIcon,
    width: '768px',
    description: 'Tablet view (768px)',
  },
  {
    id: 'mobile' as const,
    name: 'Mobile',
    icon: SmartphoneIcon,
    width: '375px',
    description: 'Mobile view (375px)',
  },
];

export default function ViewportControls({ viewMode, onViewModeChange }: ViewportControlsProps) {
  return (
    <div className="flex items-center bg-gray-100 rounded-lg p-1">
      {viewModes.map((mode) => {
        const Icon = mode.icon;
        const isActive = viewMode === mode.id;
        
        return (
          <button
            key={mode.id}
            onClick={() => onViewModeChange(mode.id)}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
            }`}
            title={mode.description}
          >
            <Icon className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">{mode.name}</span>
            <span className="sm:hidden">{mode.name.charAt(0)}</span>
            {mode.width !== '100%' && (
              <span className="ml-2 text-xs text-gray-500 hidden md:inline">
                {mode.width}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
} 