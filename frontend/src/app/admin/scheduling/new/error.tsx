'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CreateSessionError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error('Create session page error:', error);
  }, [error]);

  const handleBack = () => {
    router.push('/admin/scheduling');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Schedule
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Create New Session</h1>
          <p className="text-gray-600">An error occurred while loading the session creation form</p>
        </div>
      </div>

      {/* Error Card */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <span>Something went wrong</span>
          </CardTitle>
          <CardDescription>
            We encountered an error while trying to load the session creation form.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-red-50 rounded-md">
            <p className="text-sm text-red-700">
              <strong>Error:</strong> {error.message || 'An unexpected error occurred'}
            </p>
            {error.digest && (
              <p className="text-xs text-red-600 mt-1">
                Error ID: {error.digest}
              </p>
            )}
          </div>

          <div className="flex space-x-2">
            <Button onClick={reset} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to Schedule
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}