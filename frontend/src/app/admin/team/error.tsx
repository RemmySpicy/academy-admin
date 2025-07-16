'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCheck, AlertCircle } from 'lucide-react';

export default function TeamError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Team management error:', error);
  }, [error]);

  return (
    <div className="p-6">
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-red-600">
              Team Management Error
            </CardTitle>
            <CardDescription>
              There was an error loading the team management page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 text-center">
              {error.message || 'An unexpected error occurred while loading team data'}
            </p>
            <div className="flex gap-2">
              <Button onClick={reset} variant="outline" className="flex-1">
                Try Again
              </Button>
              <Button 
                onClick={() => window.location.href = '/admin'} 
                className="flex-1"
              >
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}