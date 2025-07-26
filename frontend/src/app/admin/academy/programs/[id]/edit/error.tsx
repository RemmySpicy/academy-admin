'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function EditProgramError({ error, reset }: ErrorProps) {
  const params = useParams();
  const programId = params.id as string;

  useEffect(() => {
    console.error('Program edit error:', error);
  }, [error]);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/admin/academy/programs">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Programs
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            <CardTitle>Error Editing Program</CardTitle>
          </div>
          <CardDescription>
            Something went wrong while loading the program editor
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              {error.message || 'An unexpected error occurred'}
            </p>
            {error.digest && (
              <p className="text-xs text-muted-foreground mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
          
          <div className="flex space-x-2">
            <Button onClick={reset}>
              Try Again
            </Button>
            <Link href={`/admin/academy/programs/${programId}`}>
              <Button variant="outline">
                View Program Details
              </Button>
            </Link>
            <Link href="/admin/academy/programs">
              <Button variant="outline">
                Return to Programs
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}