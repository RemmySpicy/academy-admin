'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, X, AlertCircle, Users } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SessionType {
  id: string;
  name: string;
  capacity: number;
}

interface SessionTypesManagerProps {
  value: SessionType[];
  onChange: (sessionTypes: SessionType[]) => void;
}

export function SessionTypesManager({ value, onChange }: SessionTypesManagerProps) {
  const [newName, setNewName] = useState('');
  const [newCapacity, setNewCapacity] = useState<number | ''>('');
  const [error, setError] = useState<string>('');

  const generateId = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  };

  const validateSessionType = (name: string, capacity: number) => {
    if (!name.trim()) {
      return 'Session type name is required';
    }
    if (name.length > 50) {
      return 'Name must be 50 characters or less';
    }
    if (value.some(type => type.name.toLowerCase() === name.toLowerCase())) {
      return 'A session type with this name already exists';
    }
    if (capacity < 1 || capacity > 100) {
      return 'Capacity must be between 1 and 100';
    }
    if (value.length >= 20) {
      return 'Maximum 20 session types allowed';
    }
    return null;
  };

  const handleAddSessionType = () => {
    setError('');

    if (newCapacity === '') {
      setError('Please enter a capacity');
      return;
    }

    const capacity = Number(newCapacity);
    const validationError = validateSessionType(newName, capacity);
    if (validationError) {
      setError(validationError);
      return;
    }

    const newSessionType: SessionType = {
      id: generateId(newName),
      name: newName.trim(),
      capacity: capacity,
    };

    onChange([...value, newSessionType]);
    setNewName('');
    setNewCapacity('');
  };

  const handleRemoveSessionType = (id: string) => {
    onChange(value.filter(type => type.id !== id));
  };

  const handleUpdateCapacity = (id: string, newCapacity: number) => {
    if (newCapacity < 1 || newCapacity > 100) return;
    
    onChange(value.map(type => 
      type.id === id ? { ...type, capacity: newCapacity } : type
    ));
  };

  // Default session types
  const defaultTypes = [
    { name: 'Private', capacity: 2 },
    { name: 'Group', capacity: 5 },
    { name: 'School Group', capacity: 50 },
  ];

  const getCapacityColor = (capacity: number) => {
    if (capacity <= 2) return 'bg-blue-100 text-blue-800';
    if (capacity <= 10) return 'bg-green-100 text-green-800';
    return 'bg-purple-100 text-purple-800';
  };

  const getCapacityIcon = (capacity: number) => {
    return <Users className="h-3 w-3" />;
  };

  return (
    <div className="space-y-4">
      {/* Existing Session Types */}
      {value.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Current Session Types</Label>
          <div className="grid gap-3">
            {value.map((sessionType) => (
              <div
                key={sessionType.id}
                className="flex items-center justify-between p-3 bg-secondary rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium">{sessionType.name}</span>
                  <Badge 
                    variant="secondary" 
                    className={`${getCapacityColor(sessionType.capacity)} flex items-center gap-1`}
                  >
                    {getCapacityIcon(sessionType.capacity)}
                    {sessionType.capacity} {sessionType.capacity === 1 ? 'person' : 'people'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Label htmlFor={`capacity-${sessionType.id}`} className="sr-only">
                      Capacity for {sessionType.name}
                    </Label>
                    <Input
                      id={`capacity-${sessionType.id}`}
                      type="number"
                      min="1"
                      max="100"
                      value={sessionType.capacity}
                      onChange={(e) => handleUpdateCapacity(sessionType.id, parseInt(e.target.value) || 1)}
                      className="w-20 h-8"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSessionType(sessionType.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add New Session Type */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Add Session Type</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="session-name">Type Name</Label>
              <Input
                id="session-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Enter session type name"
                maxLength={50}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="session-capacity">Capacity</Label>
              <Input
                id="session-capacity"
                type="number"
                min="1"
                max="100"
                value={newCapacity}
                onChange={(e) => setNewCapacity(e.target.value ? parseInt(e.target.value) : '')}
                placeholder="Enter capacity"
              />
            </div>
          </div>

          {/* Default Type Quick Add */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Quick Add Defaults:</Label>
            <div className="flex flex-wrap gap-2">
              {defaultTypes
                .filter(defaultType => !value.some(type => type.name === defaultType.name))
                .map((defaultType) => (
                  <Button
                    key={defaultType.name}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setNewName(defaultType.name);
                      setNewCapacity(defaultType.capacity);
                    }}
                  >
                    {defaultType.name} ({defaultType.capacity})
                  </Button>
                ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="button"
            onClick={handleAddSessionType}
            disabled={!newName.trim() || newCapacity === '' || value.length >= 20}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Session Type
          </Button>
        </CardContent>
      </Card>

      {/* Help Text */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>• Session types will be available when creating sessions in the scheduling system</p>
        <p>• Capacity determines the maximum number of participants per session</p>
        <p>• You can adjust capacity for existing types by editing the number field</p>
        <p>• Maximum 20 session types per program</p>
      </div>
    </div>
  );
}