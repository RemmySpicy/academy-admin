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
      <div className="flex items-center space-x-2 px-3 py-1.5 bg-muted rounded-md">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Loading programs...</span>
      </div>
    );
  }

  if (!availablePrograms.length) {
    return (
      <div className="flex items-center space-x-2 px-3 py-1.5 bg-destructive/10 rounded-md">
        <AlertCircle className="h-4 w-4 text-destructive" />
        <span className="text-sm text-destructive">No programs available</span>
      </div>
    );
  }

  if (!canSwitchPrograms) {
    return (
      <div className="flex items-center space-x-2 px-3 py-1.5 bg-primary/10 rounded-md">
        <div className="h-2 w-2 bg-primary rounded-full" />
        <span className="text-sm font-medium text-primary">
          {currentProgramName}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      {(error || lastSwitchError) && (
        <div className="flex items-center space-x-1 px-2 py-1 bg-destructive/10 rounded-md">
          <AlertCircle className="h-3 w-3 text-destructive" />
          <span className="text-xs text-destructive">{error || lastSwitchError}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearError}
            className="h-4 w-4 p-0 hover:bg-destructive/20"
          >
            ×
          </Button>
        </div>
      )}

      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center space-x-2 hover:bg-accent px-3 py-1.5"
            disabled={isSwitching || !canSwitch}
            title={!canSwitch ? "You have unsaved changes. Save or discard them before switching programs." : undefined}
          >
            <div className="flex items-center space-x-2">
              <div className={`h-2 w-2 rounded-full ${canSwitch ? 'bg-primary' : 'bg-orange-500'}`} />
              <span className="text-sm font-medium text-foreground">
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
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
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
                  <span className="font-medium text-foreground">
                    {program.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
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
                  <Check className="h-4 w-4 text-primary" />
                )}
              </div>
            </DropdownMenuItem>
          ))}
          {availablePrograms.length === 0 && (
            <DropdownMenuItem disabled>
              <span className="text-muted-foreground">No programs available</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default ProgramSwitcher;