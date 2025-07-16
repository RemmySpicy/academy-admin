'use client';

import { ProgramSwitcher } from '@/features/programs/components';

interface HeaderProps {
  title?: string;
  children?: React.ReactNode;
}

export function Header({ title, children }: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center space-x-4">
        {title && (
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        )}
        {children}
      </div>

      <div className="flex items-center space-x-4">
        {/* Program Switcher */}
        <ProgramSwitcher />
      </div>
    </header>
  );
}