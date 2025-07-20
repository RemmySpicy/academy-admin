'use client';

import { useState } from 'react';
import { ChevronDown, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useProgramContextHooks } from '@/store';
import { useSafeProgramSwitch } from '@/hooks/useSafeProgramSwitch';

/**
 * Program Switcher Component
 * 
 * Allows users to switch between programs they have access to.
 * Displays in the header with current program and dropdown for switching.
 */
export function ProgramSwitcher() {
  const {
    currentProgram,
    availablePrograms,
    error,
    clearError,
    isLoading,
    canSwitchPrograms,
    currentProgramName,
  } = useProgramContextHooks();

  const { 
    switchProgram: safeSwitchProgram, 
    isSwitching, 
    canSwitch,
    lastSwitchError 
  } = useSafeProgramSwitch();

  const [isOpen, setIsOpen] = useState(false);

  const handleProgramSwitch = async (programId: string) => {
    if (programId === currentProgram?.id) {
      setIsOpen(false);
      return;
    }

    try {
      const switchSuccess = await safeSwitchProgram(programId);
      if (switchSuccess) {
        setIsOpen(false);
      }
      // If switch failed due to unsaved changes, dropdown stays open
    } catch (error) {
      console.error('Failed to switch program:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-50 rounded-md">
        <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
        <span className="text-sm text-gray-600">Loading programs...</span>
      </div>
    );
  }

  if (!availablePrograms.length) {
    return (
      <div className="flex items-center space-x-2 px-3 py-1.5 bg-red-50 rounded-md">
        <AlertCircle className="h-4 w-4 text-red-500" />
        <span className="text-sm text-red-600">No programs available</span>
      </div>
    );
  }

  if (!canSwitchPrograms) {
    return (
      <div className="flex items-center space-x-2 px-3 py-1.5 bg-blue-50 rounded-md">
        <div className="h-2 w-2 bg-blue-500 rounded-full" />
        <span className="text-sm font-medium text-blue-900">
          {currentProgramName}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      {(error || lastSwitchError) && (
        <div className="flex items-center space-x-1 px-2 py-1 bg-red-50 rounded-md">
          <AlertCircle className="h-3 w-3 text-red-500" />
          <span className="text-xs text-red-600">{error || lastSwitchError}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearError}
            className="h-4 w-4 p-0 hover:bg-red-100"
          >
            ×
          </Button>
        </div>
      )}

      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center space-x-2 hover:bg-gray-50 px-3 py-1.5"
            disabled={isSwitching || !canSwitch}
            title={!canSwitch ? "You have unsaved changes. Save or discard them before switching programs." : undefined}
          >
            <div className="flex items-center space-x-2">
              <div className={`h-2 w-2 rounded-full ${canSwitch ? 'bg-blue-500' : 'bg-orange-500'}`} />
              <span className="text-sm font-medium text-gray-900">
                {currentProgram?.name || 'Select Program'}
              </span>
              {currentProgram?.program_code && (
                <Badge variant="secondary" className="text-xs">
                  {currentProgram.program_code}
                </Badge>
              )}
              {!canSwitch && (
                <Badge variant="outline" className="text-xs text-orange-600">
                  Unsaved
                </Badge>
              )}
            </div>
            {isSwitching ? (
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>Switch Program</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {availablePrograms.map((program) => (
            <DropdownMenuItem
              key={program.id}
              onClick={() => handleProgramSwitch(program.id)}
              className="flex items-center justify-between p-3 cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900">
                    {program.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {program.program_code}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {program.status !== 'ACTIVE' && (
                  <Badge variant="outline" className="text-xs">
                    {program.status}
                  </Badge>
                )}
                {currentProgram?.id === program.id && (
                  <Check className="h-4 w-4 text-blue-600" />
                )}
              </div>
            </DropdownMenuItem>
          ))}
          {availablePrograms.length === 0 && (
            <DropdownMenuItem disabled>
              <span className="text-gray-500">No programs available</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default ProgramSwitcher;