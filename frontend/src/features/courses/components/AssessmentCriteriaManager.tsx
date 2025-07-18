/**
 * AssessmentCriteriaManager component for managing assessment criteria
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  GripVertical, 
  Target, 
  Award,
  Move,
  ChevronUp,
  ChevronDown
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
import { AssessmentCriteria, AssessmentCriteriaCreate, AssessmentCriteriaUpdate } from '@/lib/api/types';

const criteriaSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name must be less than 255 characters'),
  description: z.string().optional(),
  max_score: z.number().min(1, 'Max score must be at least 1'),
  weight: z.number().min(0, 'Weight cannot be negative').max(100, 'Weight cannot exceed 100').optional(),
  sequence: z.number().min(0, 'Sequence cannot be negative').default(0),
});

type CriteriaFormData = z.infer<typeof criteriaSchema>;

interface AssessmentCriteriaManagerProps {
  assessmentId: string;
  criteria: AssessmentCriteria[];
  onAddCriteria: (data: AssessmentCriteriaCreate) => void;
  onUpdateCriteria: (id: string, data: AssessmentCriteriaUpdate) => void;
  onDeleteCriteria: (id: string) => void;
  onReorderCriteria: (reorderData: Array<{ id: string; sequence: number }>) => void;
  isLoading?: boolean;
}

export function AssessmentCriteriaManager({
  assessmentId,
  criteria,
  onAddCriteria,
  onUpdateCriteria,
  onDeleteCriteria,
  onReorderCriteria,
  isLoading = false,
}: AssessmentCriteriaManagerProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingCriteria, setEditingCriteria] = useState<AssessmentCriteria | null>(null);
  const [deletingCriteria, setDeletingCriteria] = useState<AssessmentCriteria | null>(null);

  const form = useForm<CriteriaFormData>({
    resolver: zodResolver(criteriaSchema),
    defaultValues: {
      name: '',
      description: '',
      max_score: 10,
      weight: 0,
      sequence: criteria.length,
    },
  });

  const handleSubmit = (data: CriteriaFormData) => {
    if (editingCriteria) {
      onUpdateCriteria(editingCriteria.id, data);
      setEditingCriteria(null);
    } else {
      onAddCriteria({
        ...data,
        assessment_id: assessmentId,
      });
      setShowAddDialog(false);
    }
    form.reset();
  };

  const handleEdit = (criteria: AssessmentCriteria) => {
    setEditingCriteria(criteria);
    form.reset({
      name: criteria.name,
      description: criteria.description || '',
      max_score: criteria.max_score,
      weight: criteria.weight || 0,
      sequence: criteria.sequence,
    });
    setShowAddDialog(true);
  };

  const handleDelete = (criteria: AssessmentCriteria) => {
    setDeletingCriteria(criteria);
  };

  const confirmDelete = () => {
    if (deletingCriteria) {
      onDeleteCriteria(deletingCriteria.id);
      setDeletingCriteria(null);
    }
  };

  const handleCancel = () => {
    setShowAddDialog(false);
    setEditingCriteria(null);
    form.reset();
  };

  const moveUp = (index: number) => {
    if (index > 0) {
      const newCriteria = [...criteria];
      [newCriteria[index], newCriteria[index - 1]] = [newCriteria[index - 1], newCriteria[index]];
      const reorderData = newCriteria.map((c, i) => ({ id: c.id, sequence: i }));
      onReorderCriteria(reorderData);
    }
  };

  const moveDown = (index: number) => {
    if (index < criteria.length - 1) {
      const newCriteria = [...criteria];
      [newCriteria[index], newCriteria[index + 1]] = [newCriteria[index + 1], newCriteria[index]];
      const reorderData = newCriteria.map((c, i) => ({ id: c.id, sequence: i }));
      onReorderCriteria(reorderData);
    }
  };

  const totalMaxScore = criteria.reduce((sum, c) => sum + c.max_score, 0);
  const totalWeight = criteria.reduce((sum, c) => sum + (c.weight || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Assessment Criteria</h3>
          <p className="text-sm text-muted-foreground">
            Define the criteria and rubric for evaluating this assessment
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Criteria
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingCriteria ? 'Edit Criteria' : 'Add New Criteria'}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Criteria Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter criteria name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe what this criteria evaluates"
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Explain what students need to demonstrate for this criteria
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="max_score"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Score *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="10"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 0)}
                          />
                        </FormControl>
                        <FormDescription>
                          Maximum points for this criteria
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight (%)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="25"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 0)}
                          />
                        </FormControl>
                        <FormDescription>
                          Weight in overall assessment score
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Saving...' : (editingCriteria ? 'Update' : 'Add')} Criteria
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {criteria.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3 text-sm">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Total Criteria</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{criteria.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Total Max Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMaxScore}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Total Weight</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalWeight}%</div>
            </CardContent>
          </Card>
        </div>
      )}

      {criteria.length === 0 ? (
        <div className="text-center py-8">
          <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Criteria Defined</h3>
          <p className="text-muted-foreground mb-4">
            Add criteria to define how this assessment will be evaluated
          </p>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add First Criteria
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {criteria.map((criterion, index) => (
            <Card key={criterion.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{criterion.name}</h4>
                      <Badge variant="secondary" className="text-xs">
                        <Award className="h-3 w-3 mr-1" />
                        {criterion.max_score} pts
                      </Badge>
                      {criterion.weight && (
                        <Badge variant="outline" className="text-xs">
                          {criterion.weight}% weight
                        </Badge>
                      )}
                    </div>
                    {criterion.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {criterion.description}
                      </p>
                    )}
                    <div className="text-xs text-muted-foreground">
                      Sequence: {criterion.sequence + 1}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveDown(index)}
                      disabled={index === criteria.length - 1}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(criterion)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(criterion)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingCriteria} onOpenChange={() => setDeletingCriteria(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the criteria "{deletingCriteria?.name}".
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