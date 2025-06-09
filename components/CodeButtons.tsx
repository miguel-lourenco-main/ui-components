'use client';

import { CodeIcon, ExternalLinkIcon } from 'lucide-react';
import { Component, LocalComponent } from '@/types';
import Image from 'next/image';

interface CodeButtonsProps {
  component: Component | LocalComponent | null;
  showCode: boolean;
  onToggleCode: () => void;
}

export default function CodeButtons({ component, showCode, onToggleCode }: CodeButtonsProps) {
  if (!component) {
    return null;
  }

  const getGitLabUrl = (component: Component | LocalComponent) => {
    // Base GitLab repository URL - you can make this configurable
    const baseRepoUrl = 'https://gitlab.com/miguel-lourenco-main/ui-components';
    
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
      <button
        onClick={onToggleCode}
        className={`flex items-center space-x-2 px-3 py-2 rounded transition-colors ${
          showCode 
            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
        title="Toggle Code Viewer"
      >
        <CodeIcon className="w-4 h-4" />
        <span className="text-sm font-medium">
          {showCode ? 'Hide Code' : 'Show Code'}
        </span>
      </button>
      
      <button
        onClick={handleGitLabClick}
        className="flex items-center space-x-2 rounded bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors"
        title="View on GitLab"
      >
        <Image className="h-9" src="/gitlab-logo-100.svg" alt="GitLab" width={85} height={85} />
      </button>
    </div>
  );
} 