'use client';

import { CodeIcon } from 'lucide-react';
import { Component, FullComponentInfo } from '@/lib/interfaces';
import Button from '@/components/display-components/buttons/Button/Button';
import { GitLabIconSingle } from '@/lib/icons';

interface CodeButtonsProps {
  component: Component | FullComponentInfo;
  showCode: boolean;
  onToggleCode: () => void;
}

export default function CodeButtons({ component, showCode, onToggleCode }: CodeButtonsProps) {

  const getGitLabUrl = (component: Component | FullComponentInfo) => {
    // Base GitLab repository URL - you can make this configurable
    const baseRepoUrl = 'https://gitlab.com/personal1625516/ui-components';
    
   return baseRepoUrl;
  };

  const handleGitLabClick = () => {
    const url = getGitLabUrl(component);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex items-center space-x-2 ml-4">
      <Button
        onClick={onToggleCode}
        className="flex items-center space-x-2 px-3 py-2 rounded transition-colors bg-blue-100 text-blue-700 hover:bg-blue-200"
        title={showCode ? 'Hide Code' : 'Show Code'}
      >
        <CodeIcon className="w-4 h-4" />
        <span className="text-sm font-medium [@media(max-width:1300px)]:hidden block">
          {showCode ? 'Hide Code' : 'Show Code'}
        </span>
      </Button>
      
      <Button
        onClick={handleGitLabClick}
        className="flex items-center space-x-2 rounded transition-colors text-black! bg-orange-200 hover:bg-orange-300"
        title="View on GitLab"
      >
        <GitLabIconSingle />
        <span className="text-sm font-medium [@media(max-width:1300px)]:hidden block">
          GitLab
        </span>
      </Button>
    </div>
  );
}