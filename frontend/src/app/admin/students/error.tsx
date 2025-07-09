'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function StudentsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Students page error:', error);
  }, [error]);

  return (
    <div className="p-6">
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-red-600">
                Students Error
              </CardTitle>
              <CardDescription>
                Unable to load student data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 text-center">
                {error.message || 'Failed to fetch student information'}
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
    </div>
  );
}