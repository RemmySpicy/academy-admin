'use client';

import { useEffect } from 'react';
import { usePageHeader } from '@/contexts/PageHeaderContext';

/**
 * Hook to set the page title and description in the global header
 */
export function usePageTitle(title?: string, description?: string) {
  const { setPageHeader } = usePageHeader();

  useEffect(() => {
    setPageHeader(title, description);
    
    // Cleanup on unmount
    return () => {
      setPageHeader(undefined, undefined);
    };
  }, [title, description, setPageHeader]);
}