'use client';

/**
 * RelationshipManager Component
 * Reusable component for managing parent-child relationships
 */

import React, { useState } from 'react';
import { Users, Plus, X, UserCheck, Baby, ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import PersonSearchAndSelect from './PersonSearchAndSelect';

// Types
interface UserProfile {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  profile_type: 'full_user' | 'profile_only';
  roles: string[];
}

interface ParentChildRelationship {
  id?: string; // For existing relationships
  parent_id: string;
  child_id: string;
  parent: UserProfile;
  child: UserProfile;
  relationship_type: 'father' | 'mother' | 'guardian' | 'stepfather' | 'stepmother' | 'grandparent' | 'other';
  is_primary_contact: boolean;
  can_pickup: boolean;
  emergency_contact: boolean;
}

interface RelationshipManagerProps {
  relationships: ParentChildRelationship[];
  onRelationshipAdd: (relationship: Omit<ParentChildRelationship, 'id'>) => void;
  onRelationshipUpdate: (relationshipId: string, updates: Partial<ParentChildRelationship>) => void;
  onRelationshipRemove: (relationshipId: string) => void;
  onSearchParents?: (query: string) => Promise<UserProfile[]>;
  onSearchChildren?: (query: string) => Promise<UserProfile[]>;
  className?: string;
  disabled?: boolean;
  allowAddRelationships?: boolean;
  mode?: 'parent-focused' | 'child-focused' | 'bidirectional'; // Different display modes
  title?: string;
  description?: string;
}

const RELATIONSHIP_TYPES = [
  { value: 'father', label: 'Father' },
  { value: 'mother', label: 'Mother' },
  { value: 'guardian', label: 'Guardian' },
  { value: 'stepfather', label: 'Stepfather' },
  { value: 'stepmother', label: 'Stepmother' },
  { value: 'grandparent', label: 'Grandparent' },
  { value: 'other', label: 'Other' },
];

export function RelationshipManager({
  relationships,
  onRelationshipAdd,
  onRelationshipUpdate,
  onRelationshipRemove,
  onSearchParents,
  onSearchChildren,
  className,
  disabled = false,
  allowAddRelationships = true,
  mode = 'bidirectional',
  title = 'Parent-Child Relationships',
  description = 'Manage family relationships between parents and children'
}: RelationshipManagerProps) {
  const [isAddingRelationship, setIsAddingRelationship] = useState(false);
  const [newRelationship, setNewRelationship] = useState<Partial<ParentChildRelationship>>({
    relationship_type: 'father',
    is_primary_contact: false,
    can_pickup: true,
    emergency_contact: false
  });
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Group relationships for display
  const groupedRelationships = React.useMemo(() => {
    if (mode === 'parent-focused') {
      // Group by parent
      const groups = new Map<string, { parent: UserProfile; relationships: ParentChildRelationship[] }>();
      relationships.forEach(rel => {
        const key = rel.parent_id;
        if (!groups.has(key)) {
          groups.set(key, { parent: rel.parent, relationships: [] });
        }
        groups.get(key)!.relationships.push(rel);
      });
      return Array.from(groups.values());
    } else if (mode === 'child-focused') {
      // Group by child
      const groups = new Map<string, { child: UserProfile; relationships: ParentChildRelationship[] }>();
      relationships.forEach(rel => {
        const key = rel.child_id;
        if (!groups.has(key)) {
          groups.set(key, { child: rel.child, relationships: [] });
        }
        groups.get(key)!.relationships.push(rel);
      });
      return Array.from(groups.values());
    } else {
      // Bidirectional - show all relationships ungrouped
      return [{ relationships }];
    }
  }, [relationships, mode]);

  const handleStartAddRelationship = () => {
    setIsAddingRelationship(true);
    setNewRelationship({
      relationship_type: 'father',
      is_primary_contact: false,
      can_pickup: true,
      emergency_contact: false
    });
  };

  const handleCancelAddRelationship = () => {
    setIsAddingRelationship(false);
    setNewRelationship({});
  };

  const handleSaveRelationship = () => {
    if (!newRelationship.parent || !newRelationship.child || !newRelationship.relationship_type) {
      return;
    }

    onRelationshipAdd({
      parent_id: newRelationship.parent.id,
      child_id: newRelationship.child.id,
      parent: newRelationship.parent,
      child: newRelationship.child,
      relationship_type: newRelationship.relationship_type,
      is_primary_contact: newRelationship.is_primary_contact || false,
      can_pickup: newRelationship.can_pickup || true,
      emergency_contact: newRelationship.emergency_contact || false
    });

    setIsAddingRelationship(false);
    setNewRelationship({});
  };

  const handleParentSelect = (parent: UserProfile) => {
    setNewRelationship(prev => ({ ...prev, parent }));
  };

  const handleChildSelect = (child: UserProfile) => {
    setNewRelationship(prev => ({ ...prev, child }));
  };

  const handleParentRemove = () => {
    setNewRelationship(prev => ({ ...prev, parent: undefined }));
  };

  const handleChildRemove = () => {
    setNewRelationship(prev => ({ ...prev, child: undefined }));
  };

  const toggleGroupExpanded = (groupKey: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey);
    } else {
      newExpanded.add(groupKey);
    }
    setExpandedGroups(newExpanded);
  };

  const getRelationshipTypeLabel = (type: string) => {
    return RELATIONSHIP_TYPES.find(t => t.value === type)?.label || type;
  };

  const getUserDisplayName = (user: UserProfile): string => {
    return user.full_name || user.email || user.phone || 'Unknown User';
  };

  const getUserSubtext = (user: UserProfile): string => {
    const parts = [];
    if (user.email) parts.push(user.email);
    if (user.phone) parts.push(user.phone);
    return parts.join(' • ');
  };

  const canSaveNewRelationship = newRelationship.parent && newRelationship.child && newRelationship.relationship_type;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
        </div>
        {allowAddRelationships && !disabled && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleStartAddRelationship}
            disabled={isAddingRelationship}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Relationship
          </Button>
        )}
      </div>

      {/* Add New Relationship Form */}
      {isAddingRelationship && (
        <Card className="border-dashed">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Add New Relationship
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Parent Selection */}
            {onSearchParents && (
              <PersonSearchAndSelect
                searchLabel="Select Parent"
                placeholder="Search for parent by name, email, or phone..."
                selectedPersons={newRelationship.parent ? [newRelationship.parent] : []}
                onPersonSelect={handleParentSelect}
                onPersonRemove={handleParentRemove}
                onSearchFunction={onSearchParents}
                allowMultiple={false}
                filterRoles={['parent']}
                required
              />
            )}

            {/* Child Selection */}
            {onSearchChildren && (
              <PersonSearchAndSelect
                searchLabel="Select Child"
                placeholder="Search for child by name, email, or phone..."
                selectedPersons={newRelationship.child ? [newRelationship.child] : []}
                onPersonSelect={handleChildSelect}
                onPersonRemove={handleChildRemove}
                onSearchFunction={onSearchChildren}
                allowMultiple={false}
                filterRoles={['student']}
                required
              />
            )}

            {/* Relationship Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Relationship Type <span className="text-red-500">*</span>
              </label>
              <Select
                value={newRelationship.relationship_type}
                onValueChange={(value) => setNewRelationship(prev => ({ ...prev, relationship_type: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select relationship type" />
                </SelectTrigger>
                <SelectContent>
                  {RELATIONSHIP_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Relationship Settings */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Permissions</label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={newRelationship.is_primary_contact || false}
                    onChange={(e) => setNewRelationship(prev => ({ ...prev, is_primary_contact: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <span>Primary Contact</span>
                </label>
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={newRelationship.can_pickup || false}
                    onChange={(e) => setNewRelationship(prev => ({ ...prev, can_pickup: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <span>Can Pick Up</span>
                </label>
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={newRelationship.emergency_contact || false}
                    onChange={(e) => setNewRelationship(prev => ({ ...prev, emergency_contact: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <span>Emergency Contact</span>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancelAddRelationship}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSaveRelationship}
                disabled={!canSaveNewRelationship}
              >
                Save Relationship
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Relationships */}
      {relationships.length > 0 ? (
        <div className="space-y-3">
          {mode === 'bidirectional' ? (
            // Show all relationships in a simple list
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {relationships.map((relationship, index) => (
                    <div
                      key={relationship.id || index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4 min-w-0 flex-1">
                        {/* Parent Info */}
                        <div className="flex items-center space-x-2 min-w-0 flex-1">
                          <UserCheck className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {getUserDisplayName(relationship.parent)}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {getUserSubtext(relationship.parent)}
                            </p>
                          </div>
                        </div>

                        {/* Relationship */}
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="text-xs">
                            {getRelationshipTypeLabel(relationship.relationship_type)}
                          </Badge>
                          <span className="text-gray-400">→</span>
                        </div>

                        {/* Child Info */}
                        <div className="flex items-center space-x-2 min-w-0 flex-1">
                          <Baby className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {getUserDisplayName(relationship.child)}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {getUserSubtext(relationship.child)}
                            </p>
                          </div>
                        </div>

                        {/* Permissions */}
                        <div className="flex space-x-1">
                          {relationship.is_primary_contact && (
                            <Badge variant="outline" className="text-xs">Primary</Badge>
                          )}
                          {relationship.can_pickup && (
                            <Badge variant="outline" className="text-xs">Pickup</Badge>
                          )}
                          {relationship.emergency_contact && (
                            <Badge variant="outline" className="text-xs text-red-700 border-red-200">Emergency</Badge>
                          )}
                        </div>
                      </div>

                      {/* Remove Button */}
                      {!disabled && relationship.id && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onRelationshipRemove(relationship.id!)}
                          className="flex-shrink-0 ml-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            // Show grouped relationships (parent-focused or child-focused)
            groupedRelationships.map((group, groupIndex) => {
              const groupKey = mode === 'parent-focused' 
                ? `parent-${(group as any).parent.id}`
                : `child-${(group as any).child.id}`;
              const isExpanded = expandedGroups.has(groupKey);
              
              return (
                <Card key={groupKey}>
                  <Collapsible
                    open={isExpanded}
                    onOpenChange={() => toggleGroupExpanded(groupKey)}
                  >
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {mode === 'parent-focused' ? (
                              <UserCheck className="h-5 w-5 text-blue-600" />
                            ) : (
                              <Baby className="h-5 w-5 text-green-600" />
                            )}
                            <div>
                              <CardTitle className="text-base">
                                {mode === 'parent-focused' 
                                  ? getUserDisplayName((group as any).parent)
                                  : getUserDisplayName((group as any).child)
                                }
                              </CardTitle>
                              <p className="text-sm text-gray-500">
                                {(group as any).relationships.length} relationship{(group as any).relationships.length !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          {(group as any).relationships.map((relationship: ParentChildRelationship, index: number) => (
                            <div
                              key={relationship.id || index}
                              className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
                            >
                              <div className="flex items-center space-x-3 min-w-0 flex-1">
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-gray-900">
                                    {mode === 'parent-focused' 
                                      ? getUserDisplayName(relationship.child)
                                      : getUserDisplayName(relationship.parent)
                                    }
                                  </p>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <Badge variant="secondary" className="text-xs">
                                      {getRelationshipTypeLabel(relationship.relationship_type)}
                                    </Badge>
                                    {relationship.is_primary_contact && (
                                      <Badge variant="outline" className="text-xs">Primary</Badge>
                                    )}
                                    {relationship.can_pickup && (
                                      <Badge variant="outline" className="text-xs">Pickup</Badge>
                                    )}
                                    {relationship.emergency_contact && (
                                      <Badge variant="outline" className="text-xs text-red-700 border-red-200">Emergency</Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                              {!disabled && relationship.id && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onRelationshipRemove(relationship.id!)}
                                  className="flex-shrink-0 ml-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              );
            })
          )}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Relationships</h3>
            <p className="text-gray-500 mb-4">
              No parent-child relationships have been established yet.
            </p>
            {allowAddRelationships && !disabled && (
              <Button
                type="button"
                variant="outline"
                onClick={handleStartAddRelationship}
                disabled={isAddingRelationship}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Relationship
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default RelationshipManager;