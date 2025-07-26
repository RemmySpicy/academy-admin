'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, X, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AgeGroup {
  id: string;
  name: string;
  from_age: number;
  to_age: number;
}

interface AgeGroupsManagerProps {
  value: AgeGroup[];
  onChange: (ageGroups: AgeGroup[]) => void;
}

export function AgeGroupsManager({ value, onChange }: AgeGroupsManagerProps) {
  const [newFromAge, setNewFromAge] = useState<number | ''>('');
  const [newToAge, setNewToAge] = useState<number | ''>('');
  const [error, setError] = useState<string>('');

  const generateId = (fromAge: number, toAge: number) => {
    if (toAge >= 99) {
      return `${fromAge}+`;
    }
    return `${fromAge}-${toAge}`;
  };

  const generateName = (fromAge: number, toAge: number) => {
    if (toAge >= 99) {
      return `${fromAge}+ years`;
    }
    return `${fromAge}-${toAge} years`;
  };

  const validateAgeGroup = (fromAge: number, toAge: number) => {
    // Basic validation
    if (fromAge >= toAge && toAge < 99) {
      return 'From age must be less than to age';
    }
    if (fromAge < 3 || fromAge > 99) {
      return 'From age must be between 3 and 99';
    }
    if (toAge < 3 || toAge > 99) {
      return 'To age must be between 3 and 99';
    }

    // Check for overlaps with existing age groups
    for (const ageGroup of value) {
      const existingFrom = ageGroup.from_age;
      const existingTo = ageGroup.to_age;

      // Check if new range overlaps with existing range
      if (
        (fromAge >= existingFrom && fromAge <= existingTo) ||
        (toAge >= existingFrom && toAge <= existingTo) ||
        (fromAge <= existingFrom && toAge >= existingTo)
      ) {
        return `Age range overlaps with existing range: ${ageGroup.name}`;
      }
    }

    return null;
  };

  const handleAddAgeGroup = () => {
    setError('');

    if (newFromAge === '' || newToAge === '') {
      setError('Please enter both from and to ages');
      return;
    }

    const fromAge = Number(newFromAge);
    const toAge = Number(newToAge);

    const validationError = validateAgeGroup(fromAge, toAge);
    if (validationError) {
      setError(validationError);
      return;
    }

    const newAgeGroup: AgeGroup = {
      id: generateId(fromAge, toAge),
      name: generateName(fromAge, toAge),
      from_age: fromAge,
      to_age: toAge,
    };

    onChange([...value, newAgeGroup]);
    setNewFromAge('');
    setNewToAge('');
  };

  const handleRemoveAgeGroup = (id: string) => {
    onChange(value.filter(group => group.id !== id));
  };

  const sortedAgeGroups = [...value].sort((a, b) => a.from_age - b.from_age);

  return (
    <div className="space-y-4">
      {/* Existing Age Groups */}
      {sortedAgeGroups.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Current Age Groups</Label>
          <div className="flex flex-wrap gap-2">
            {sortedAgeGroups.map((ageGroup) => (
              <Badge
                key={ageGroup.id}
                variant="secondary"
                className="flex items-center gap-2 px-3 py-1"
              >
                {ageGroup.name}
                <button
                  type="button"
                  onClick={() => handleRemoveAgeGroup(ageGroup.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Add New Age Group */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Add Age Group</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="from-age">From Age</Label>
              <Input
                id="from-age"
                type="number"
                min="3"
                max="99"
                value={newFromAge}
                onChange={(e) => setNewFromAge(e.target.value ? parseInt(e.target.value) : '')}
                placeholder="6"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="to-age">To Age</Label>
              <Input
                id="to-age"
                type="number"
                min="3"
                max="99"
                value={newToAge}
                onChange={(e) => setNewToAge(e.target.value ? parseInt(e.target.value) : '')}
                placeholder="8"
              />
            </div>
          </div>

          {/* Preview */}
          {newFromAge !== '' && newToAge !== '' && (
            <div className="text-sm text-muted-foreground">
              Preview: {generateName(Number(newFromAge), Number(newToAge))}
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
            onClick={handleAddAgeGroup}
            disabled={newFromAge === '' || newToAge === ''}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Age Group
          </Button>
        </CardContent>
      </Card>

      {/* Help Text */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>• Age groups cannot overlap with each other</p>
        <p>• Use 99 as the "to age" for open-ended ranges (e.g., "18+ years")</p>
        <p>• Age groups will be available for course creation and curriculum targeting</p>
      </div>
    </div>
  );
}