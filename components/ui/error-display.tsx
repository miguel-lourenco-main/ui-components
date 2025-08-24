import { AlertTriangleIcon, RefreshCwIcon } from 'lucide-react';
import { CodeBlock } from '@/components/code-block'

interface ErrorDisplayProps {
  title: string;
  message: string;
  onRetry: () => void;
  details?: string;
  variant?: 'error' | 'warning';
}

export function ErrorDisplay({ 
  title, 
  message, 
  onRetry, 
  details, 
  variant = 'error' 
}: ErrorDisplayProps) {
  const colorClasses = variant === 'error' 
    ? 'border-red-300 text-red-700 bg-red-600 hover:bg-red-700 text-red-600' 
    : 'border-orange-300 text-orange-700 bg-orange-600 hover:bg-orange-700 text-orange-600';
  
  return (
    <div className={`border-2 border-dashed rounded-lg p-8 ${colorClasses.split(' ')[0]}`}>
      <div className="text-center">
        <AlertTriangleIcon className={`w-12 h-12 ${colorClasses.split(' ')[1]} mx-auto mb-4`} />
        <h3 className={`text-lg font-semibold ${colorClasses.split(' ')[1]} mb-2`}>
          {title}
        </h3>
        <p className={`${colorClasses.split(' ')[1]} mb-4`}>
          {message}
        </p>
        <button
          onClick={onRetry}
          className={`inline-flex items-center px-4 py-2 ${colorClasses.split(' ')[2]} ${colorClasses.split(' ')[3]} text-white rounded-lg`}
        >
          <RefreshCwIcon className="w-4 h-4 mr-2" />
          Retry
        </button>
      </div>
      {details && (
        <details className="mt-4">
          <summary className={`cursor-pointer text-sm ${colorClasses.split(' ')[4]}`}>
            Show error details
          </summary>
          <CodeBlock code={details} language="text" className="mt-2 text-xs" />
        </details>
      )}
    </div>
  );
} 