'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface PageHeaderContextType {
  title?: string;
  description?: string;
  setPageHeader: (title?: string, description?: string) => void;
}

const PageHeaderContext = createContext<PageHeaderContextType | undefined>(undefined);

export function PageHeaderProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState<string | undefined>();
  const [description, setDescription] = useState<string | undefined>();

  const setPageHeader = (newTitle?: string, newDescription?: string) => {
    setTitle(newTitle);
    setDescription(newDescription);
  };

  return (
    <PageHeaderContext.Provider value={{ title, description, setPageHeader }}>
      {children}
    </PageHeaderContext.Provider>
  );
}

export function usePageHeader() {
  const context = useContext(PageHeaderContext);
  if (context === undefined) {
    throw new Error('usePageHeader must be used within a PageHeaderProvider');
  }
  return context;
}