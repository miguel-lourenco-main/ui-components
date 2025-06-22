'use client';

import { CodeIcon, ExternalLinkIcon } from 'lucide-react';
import { Component, LocalComponent } from '@/types';
import Image from 'next/image';
import Button from './display_components/buttons/Button/Button';
import { GitLabIconSingle } from '@/lib/icons';

interface CodeButtonsProps {
  component: Component | LocalComponent;
  showCode: boolean;
  onToggleCode: () => void;
}

export default function CodeButtons({ component, showCode, onToggleCode }: CodeButtonsProps) {

  const getGitLabUrl = (component: Component | LocalComponent) => {
    // Base GitLab repository URL - you can make this configurable
    const baseRepoUrl = 'https://gitlab.com/personal1625516/ui-components';
    
    if ('isLocal' in component && component.isLocal) {
      // For local components, link to the file path
      return `${baseRepoUrl}/-/blob/main/${component.filePath}`;
    } else {
      // For remote/API components, link to a general components directory
      return `${baseRepoUrl}/-/tree/main/components`;
    }
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