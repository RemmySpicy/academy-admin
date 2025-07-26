'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, X, GripVertical, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DifficultyLevel {
  id: string;
  name: string;
  weight: number;
}

interface DifficultyLevelsManagerProps {
  value: DifficultyLevel[];
  onChange: (difficultyLevels: DifficultyLevel[]) => void;
}

export function DifficultyLevelsManager({ value, onChange }: DifficultyLevelsManagerProps) {
  const [newName, setNewName] = useState('');
  const [error, setError] = useState<string>('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const generateId = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  };

  const validateDifficultyLevel = (name: string) => {
    if (!name.trim()) {
      return 'Difficulty level name is required';
    }
    if (name.length > 50) {
      return 'Name must be 50 characters or less';
    }
    if (value.some(level => level.name.toLowerCase() === name.toLowerCase())) {
      return 'A difficulty level with this name already exists';
    }
    if (value.length >= 10) {
      return 'Maximum 10 difficulty levels allowed';
    }
    return null;
  };

  const handleAddDifficultyLevel = () => {
    setError('');

    const validationError = validateDifficultyLevel(newName);
    if (validationError) {
      setError(validationError);
      return;
    }

    const newWeight = value.length > 0 ? Math.max(...value.map(l => l.weight)) + 1 : 1;
    const newLevel: DifficultyLevel = {
      id: generateId(newName),
      name: newName.trim(),
      weight: newWeight,
    };

    onChange([...value, newLevel]);
    setNewName('');
  };

  const handleRemoveDifficultyLevel = (id: string) => {
    const updatedLevels = value.filter(level => level.id !== id);
    // Reassign weights to maintain continuous sequence
    const reweightedLevels = updatedLevels
      .sort((a, b) => a.weight - b.weight)
      .map((level, index) => ({ ...level, weight: index + 1 }));
    onChange(reweightedLevels);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;

    const draggedItem = sortedLevels[draggedIndex];
    const newOrder = [...sortedLevels];
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(dropIndex, 0, draggedItem);

    // Reassign weights based on new order
    const reweightedLevels = newOrder.map((level, index) => ({
      ...level,
      weight: index + 1,
    }));

    onChange(reweightedLevels);
    setDraggedIndex(null);
  };

  const sortedLevels = [...value].sort((a, b) => a.weight - b.weight);

  // Default suggestions
  const defaultSuggestions = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
  const availableSuggestions = defaultSuggestions.filter(
    suggestion => !value.some(level => level.name.toLowerCase() === suggestion.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Existing Difficulty Levels */}
      {sortedLevels.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Current Difficulty Levels (drag to reorder)</Label>
          <div className="space-y-2">
            {sortedLevels.map((level, index) => (
              <div
                key={level.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className={`flex items-center gap-3 p-3 bg-secondary rounded-lg cursor-move ${
                  draggedIndex === index ? 'opacity-50' : ''
                }`}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <Badge variant="outline" className="min-w-0">
                  {level.weight}
                </Badge>
                <span className="flex-1">{level.name}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveDifficultyLevel(level.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add New Difficulty Level */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Add Difficulty Level</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="difficulty-name">Level Name</Label>
            <Input
              id="difficulty-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter difficulty level name"
              maxLength={50}
            />
          </div>

          {/* Suggestions */}
          {availableSuggestions.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Quick Add:</Label>
              <div className="flex flex-wrap gap-2">
                {availableSuggestions.map((suggestion) => (
                  <Button
                    key={suggestion}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setNewName(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="button"
            onClick={handleAddDifficultyLevel}
            disabled={!newName.trim() || value.length >= 10}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Level
          </Button>
        </CardContent>
      </Card>

      {/* Help Text */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>• Drag levels to reorder them (weight is automatically assigned)</p>
        <p>• Difficulty levels will be available in curriculum creation and course assignment</p>
        <p>• Each level must have a unique name within the program</p>
        <p>• Maximum 10 difficulty levels per program</p>
      </div>
    </div>
  );
}