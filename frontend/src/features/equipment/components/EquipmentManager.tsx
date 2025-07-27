/**
 * EquipmentManager component for managing lesson and assessment equipment requirements
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { 
  Plus, 
  Wrench, 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  Edit, 
  Trash2,
  Search,
  Filter,
  ShoppingCart,
  Laptop,
  Users,
  BookOpen
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useEquipmentManagement } from '../hooks/useEquipmentManagement';

// Equipment types and categories
export interface Equipment {
  id: string;
  name: string;
  description?: string;
  category: 'hardware' | 'software' | 'material' | 'tool' | 'safety' | 'other';
  type: 'required' | 'optional' | 'recommended';
  quantity_required: number;
  quantity_available?: number;
  status: 'available' | 'limited' | 'unavailable' | 'ordered';
  location?: string;
  supplier?: string;
  cost_per_unit?: number;
  created_at: string;
  updated_at: string;
}

export interface EquipmentRequirement {
  id: string;
  content_id: string; // lesson or assessment ID
  content_type: 'lesson' | 'assessment';
  equipment_id: string;
  equipment: Equipment;
  quantity_needed: number;
  is_critical: boolean;
  alternatives?: string;
  notes?: string;
  created_at: string;
}

const equipmentSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name must be less than 255 characters'),
  description: z.string().optional(),
  category: z.enum(['hardware', 'software', 'material', 'tool', 'safety', 'other']),
  type: z.enum(['required', 'optional', 'recommended']),
  quantity_required: z.number().min(1, 'Quantity must be at least 1'),
  location: z.string().optional(),
  supplier: z.string().optional(),
  cost_per_unit: z.number().min(0, 'Cost cannot be negative').optional(),
});

const requirementSchema = z.object({
  equipment_id: z.string().min(1, 'Equipment is required'),
  quantity_needed: z.number().min(1, 'Quantity must be at least 1'),
  is_critical: z.boolean().default(false),
  alternatives: z.string().optional(),
  notes: z.string().optional(),
});

type EquipmentFormData = z.infer<typeof equipmentSchema>;
type RequirementFormData = z.infer<typeof requirementSchema>;

interface EquipmentManagerProps {
  contentId?: string;
  contentType?: 'lesson' | 'assessment';
  mode?: 'requirements' | 'inventory';
  onEquipmentSelect?: (equipment: Equipment) => void;
  className?: string;
}

const categoryIcons = {
  hardware: Laptop,
  software: Package,
  material: BookOpen,
  tool: Wrench,
  safety: AlertTriangle,
  other: Package,
};

const categoryColors = {
  hardware: 'bg-blue-100 text-blue-800',
  software: 'bg-green-100 text-green-800',
  material: 'bg-orange-100 text-orange-800',
  tool: 'bg-purple-100 text-purple-800',
  safety: 'bg-red-100 text-red-800',
  other: 'bg-gray-100 text-gray-800',
};

const statusColors = {
  available: 'bg-green-100 text-green-800',
  limited: 'bg-yellow-100 text-yellow-800',
  unavailable: 'bg-red-100 text-red-800',
  ordered: 'bg-blue-100 text-blue-800',
};

const typeColors = {
  required: 'bg-red-100 text-red-800',
  optional: 'bg-gray-100 text-gray-800',
  recommended: 'bg-blue-100 text-blue-800',
};

export function EquipmentManager({ 
  contentId, 
  contentType, 
  mode = 'requirements',
  onEquipmentSelect,
  className 
}: EquipmentManagerProps) {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showEquipmentForm, setShowEquipmentForm] = useState(false);
  const [showRequirementForm, setShowRequirementForm] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [editingRequirement, setEditingRequirement] = useState<EquipmentRequirement | null>(null);
  const [deletingItem, setDeletingItem] = useState<Equipment | EquipmentRequirement | null>(null);

  const {
    equipment,
    requirements,
    isLoading,
    createEquipment,
    updateEquipment,
    deleteEquipment,
    createRequirement,
    updateRequirement,
    deleteRequirement,
  } = useEquipmentManagement({
    content_id: contentId,
    content_type: contentType,
    search: searchQuery,
    category: selectedCategory === 'all' ? undefined : selectedCategory as any,
    status: selectedStatus === 'all' ? undefined : selectedStatus as any,
  });

  const equipmentForm = useForm<EquipmentFormData>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: {
      name: '',
      description: '',
      category: 'hardware',
      type: 'required',
      quantity_required: 1,
      location: '',
      supplier: '',
      cost_per_unit: 0,
    },
  });

  const requirementForm = useForm<RequirementFormData>({
    resolver: zodResolver(requirementSchema),
    defaultValues: {
      equipment_id: '',
      quantity_needed: 1,
      is_critical: false,
      alternatives: '',
      notes: '',
    },
  });

  const handleCreateEquipment = (data: EquipmentFormData) => {
    createEquipment.mutate(data, {
      onSuccess: () => {
        setShowEquipmentForm(false);
        equipmentForm.reset();
      },
    });
  };

  const handleUpdateEquipment = (data: EquipmentFormData) => {
    if (editingEquipment) {
      updateEquipment.mutate(
        { id: editingEquipment.id, data },
        {
          onSuccess: () => {
            setShowEquipmentForm(false);
            setEditingEquipment(null);
            equipmentForm.reset();
          },
        }
      );
    }
  };

  const handleCreateRequirement = (data: RequirementFormData) => {
    if (contentId && contentType) {
      createRequirement.mutate(
        { ...data, content_id: contentId, content_type: contentType },
        {
          onSuccess: () => {
            setShowRequirementForm(false);
            requirementForm.reset();
          },
        }
      );
    }
  };

  const handleUpdateRequirement = (data: RequirementFormData) => {
    if (editingRequirement) {
      updateRequirement.mutate(
        { id: editingRequirement.id, data },
        {
          onSuccess: () => {
            setShowRequirementForm(false);
            setEditingRequirement(null);
            requirementForm.reset();
          },
        }
      );
    }
  };

  const handleEditEquipment = (equipment: Equipment) => {
    setEditingEquipment(equipment);
    equipmentForm.reset({
      name: equipment.name,
      description: equipment.description || '',
      category: equipment.category,
      type: equipment.type,
      quantity_required: equipment.quantity_required,
      location: equipment.location || '',
      supplier: equipment.supplier || '',
      cost_per_unit: equipment.cost_per_unit || 0,
    });
    setShowEquipmentForm(true);
  };

  const handleEditRequirement = (requirement: EquipmentRequirement) => {
    setEditingRequirement(requirement);
    requirementForm.reset({
      equipment_id: requirement.equipment_id,
      quantity_needed: requirement.quantity_needed,
      is_critical: requirement.is_critical,
      alternatives: requirement.alternatives || '',
      notes: requirement.notes || '',
    });
    setShowRequirementForm(true);
  };

  const handleDelete = (item: Equipment | EquipmentRequirement) => {
    setDeletingItem(item);
  };

  const confirmDelete = () => {
    if (deletingItem) {
      if ('equipment_id' in deletingItem) {
        // It's a requirement
        deleteRequirement.mutate(deletingItem.id);
      } else {
        // It's equipment
        deleteEquipment.mutate(deletingItem.id);
      }
      setDeletingItem(null);
    }
  };

  const getCategoryIcon = (category: Equipment['category']) => {
    const IconComponent = categoryIcons[category];
    return <IconComponent className="h-4 w-4" />;
  };

  const filteredEquipment = equipment?.filter(item => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (selectedStatus !== 'all' && item.status !== selectedStatus) return false;
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  }) || [];

  const filteredRequirements = requirements || [];

  const displayItems = mode === 'requirements' ? filteredRequirements : filteredEquipment;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            {mode === 'requirements' ? 'Equipment Requirements' : 'Equipment Inventory'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {mode === 'requirements' 
              ? 'Manage equipment needed for this content'
              : 'Manage your equipment inventory and availability'
            }
          </p>
        </div>
        <div className="flex items-center gap-2">
          {mode === 'requirements' && contentId && (
            <Dialog open={showRequirementForm} onOpenChange={setShowRequirementForm}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Requirement
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingRequirement ? 'Edit Requirement' : 'Add Equipment Requirement'}
                  </DialogTitle>
                </DialogHeader>
                <Form {...requirementForm}>
                  <form 
                    onSubmit={requirementForm.handleSubmit(
                      editingRequirement ? handleUpdateRequirement : handleCreateRequirement
                    )} 
                    className="space-y-4"
                  >
                    <FormField
                      control={requirementForm.control}
                      name="equipment_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Equipment *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select equipment" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {equipment?.map((item) => (
                                <SelectItem key={item.id} value={item.id}>
                                  <div className="flex items-center gap-2">
                                    {getCategoryIcon(item.category)}
                                    <span>{item.name}</span>
                                    <Badge
                                      variant="secondary"
                                      className={`${categoryColors[item.category]} text-xs`}
                                    >
                                      {item.category}
                                    </Badge>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={requirementForm.control}
                        name="quantity_needed"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantity Needed *</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={requirementForm.control}
                        name="is_critical"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel>Critical Requirement</FormLabel>
                              <FormDescription className="text-xs">
                                Cannot proceed without this equipment
                              </FormDescription>
                            </div>
                            <FormControl>
                              <input 
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="rounded"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={requirementForm.control}
                      name="alternatives"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alternatives</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="List alternative equipment or substitutions"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Alternative equipment that can be used instead
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={requirementForm.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Additional notes about this requirement"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setShowRequirementForm(false);
                          setEditingRequirement(null);
                          requirementForm.reset();
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">
                        {editingRequirement ? 'Update' : 'Add'} Requirement
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}

          <Dialog open={showEquipmentForm} onOpenChange={setShowEquipmentForm}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                {mode === 'requirements' ? 'New Equipment' : 'Add Equipment'}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>
                  {editingEquipment ? 'Edit Equipment' : 'Add New Equipment'}
                </DialogTitle>
              </DialogHeader>
              <Form {...equipmentForm}>
                <form 
                  onSubmit={equipmentForm.handleSubmit(
                    editingEquipment ? handleUpdateEquipment : handleCreateEquipment
                  )} 
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={equipmentForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Equipment Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter equipment name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={equipmentForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="hardware">Hardware</SelectItem>
                              <SelectItem value="software">Software</SelectItem>
                              <SelectItem value="material">Material</SelectItem>
                              <SelectItem value="tool">Tool</SelectItem>
                              <SelectItem value="safety">Safety</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={equipmentForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe the equipment and its purpose"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={equipmentForm.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="required">Required</SelectItem>
                              <SelectItem value="recommended">Recommended</SelectItem>
                              <SelectItem value="optional">Optional</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={equipmentForm.control}
                      name="quantity_required"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={equipmentForm.control}
                      name="cost_per_unit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cost per Unit</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={equipmentForm.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="Storage location" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={equipmentForm.control}
                      name="supplier"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Supplier</FormLabel>
                          <FormControl>
                            <Input placeholder="Equipment supplier" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setShowEquipmentForm(false);
                        setEditingEquipment(null);
                        equipmentForm.reset();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingEquipment ? 'Update' : 'Add'} Equipment
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search equipment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="hardware">Hardware</SelectItem>
            <SelectItem value="software">Software</SelectItem>
            <SelectItem value="material">Material</SelectItem>
            <SelectItem value="tool">Tool</SelectItem>
            <SelectItem value="safety">Safety</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
        {mode === 'inventory' && (
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="limited">Limited</SelectItem>
              <SelectItem value="unavailable">Unavailable</SelectItem>
              <SelectItem value="ordered">Ordered</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Equipment List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : displayItems.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {mode === 'requirements' ? 'No Requirements' : 'No Equipment Found'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {mode === 'requirements'
              ? 'Add equipment requirements for this content'
              : 'Add equipment to your inventory to get started'
            }
          </p>
          <Button onClick={() => mode === 'requirements' ? setShowRequirementForm(true) : setShowEquipmentForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {mode === 'requirements' ? 'Add Requirement' : 'Add Equipment'}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {mode === 'requirements' 
            ? filteredRequirements.map((requirement) => (
                <Card key={requirement.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                          {getCategoryIcon(requirement.equipment.category)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{requirement.equipment.name}</h4>
                            <Badge
                              variant="secondary"
                              className={`${categoryColors[requirement.equipment.category]} text-xs`}
                            >
                              {requirement.equipment.category}
                            </Badge>
                            {requirement.is_critical && (
                              <Badge variant="destructive" className="text-xs">
                                Critical
                              </Badge>
                            )}
                          </div>
                          {requirement.equipment.description && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {requirement.equipment.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Quantity: {requirement.quantity_needed}</span>
                            {requirement.equipment.location && (
                              <span>Location: {requirement.equipment.location}</span>
                            )}
                          </div>
                          {requirement.alternatives && (
                            <p className="text-sm text-blue-600 mt-1">
                              Alternatives: {requirement.alternatives}
                            </p>
                          )}
                          {requirement.notes && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {requirement.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditRequirement(requirement)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(requirement)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            : filteredEquipment.map((item) => (
                <Card 
                  key={item.id} 
                  className={`hover:shadow-md transition-shadow ${
                    onEquipmentSelect ? 'cursor-pointer hover:bg-accent' : ''
                  }`}
                  onClick={() => onEquipmentSelect?.(item)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                          {getCategoryIcon(item.category)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{item.name}</h4>
                            <Badge
                              variant="secondary"
                              className={`${categoryColors[item.category]} text-xs`}
                            >
                              {item.category}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={`${typeColors[item.type]} text-xs`}
                            >
                              {item.type}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={`${statusColors[item.status]} text-xs`}
                            >
                              {item.status}
                            </Badge>
                          </div>
                          {item.description && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {item.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Required: {item.quantity_required}</span>
                            {item.quantity_available && (
                              <span>Available: {item.quantity_available}</span>
                            )}
                            {item.location && (
                              <span>Location: {item.location}</span>
                            )}
                            {item.cost_per_unit && (
                              <span>Cost: ${item.cost_per_unit}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      {!onEquipmentSelect && (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditEquipment(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(item)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
          }
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingItem} onOpenChange={() => setDeletingItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this {deletingItem && 'equipment_id' in deletingItem ? 'requirement' : 'equipment item'}.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}