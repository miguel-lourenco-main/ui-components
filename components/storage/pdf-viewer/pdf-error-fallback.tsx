import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Trans } from '@/components/ui/trans';

/**
 * Props interface for PDFErrorFallback component
 */
interface PDFErrorFallbackProps {
  error: Error;                    // Error object from error boundary
  resetErrorBoundary: () => void;  // Function to reset error state
}

/**
 * PDFErrorFallback Component
 * Displays a user-friendly error message when PDF rendering fails
 * 
 * Features:
 * - Shows error alert with icon
 * - Provides retry button
 * - Internationalized error messages
 */
export function PDFErrorFallback({ resetErrorBoundary }: PDFErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center p-4 space-y-4 h-full">
      {/* Error alert with icon and messages */}
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>
          <Trans i18nKey="ui:errorLoadingPDF" />
        </AlertTitle>
        <AlertDescription>
          <Trans i18nKey="ui:errorLoadingPDFDescription" />
        </AlertDescription>
      </Alert>
      
      {/* Retry button */}
      <Button variant="outline" onClick={resetErrorBoundary}>
        <Trans i18nKey="ui:retry" />
      </Button>
    </div>
  );
}