'use client';

import { ProgramSwitcher } from '@/features/programs/components';

interface HeaderProps {
  title?: string;
  description?: string;
  children?: React.ReactNode;
}

export function Header({ title, description, children }: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-3 sm:px-6">
      {/* Left section - Legacy children support */}
      <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
        {children}
      </div>

      {/* Left section - Page title and description */}
      <div className="flex-1 flex flex-col justify-center min-w-0 px-2 sm:px-4">
        {title && (
          <div className="min-w-0 w-full">
            <h1 className="text-sm sm:text-lg font-semibold text-gray-900 truncate">
              {title}
            </h1>
            {description && (
              <p className="hidden sm:block text-xs sm:text-sm text-gray-600 truncate mt-0.5">
                {description}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Right section - Program Switcher */}
      <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
        <ProgramSwitcher />
      </div>
    </header>
  );
}