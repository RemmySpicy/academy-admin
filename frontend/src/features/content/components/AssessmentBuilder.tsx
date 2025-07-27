/**
 * Assessment Builder - Create and manage assessments with multiple question types
 */

import { useState, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { 
  Plus,
  Trash2,
  Edit,
  Copy,
  Save,
  X,
  Eye,
  GripVertical,
  CheckCircle,
  Circle,
  Square,
  Type,
  FileText,
  Code,
  Image,
  Video,
  Clock,
  Target,
  Award,
  Settings,
  HelpCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Layers,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';
import type { Assessment, AssessmentQuestion, Course } from '../api/courseApiService';

interface AssessmentBuilderProps {
  course: Course;
  assessment?: Assessment;
  onSave: (data: AssessmentFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  className?: string;
}

const questionTypes = [
  {
    value: 'multiple_choice',
    label: 'Multiple Choice',
    icon: Circle,
    description: 'Single correct answer from multiple options',
  },
  {
    value: 'multiple_select',
    label: 'Multiple Select',
    icon: CheckCircle,
    description: 'Multiple correct answers from options',
  },
  {
    value: 'true_false',
    label: 'True/False',
    icon: Square,
    description: 'Simple true or false question',
  },
  {
    value: 'short_answer',
    label: 'Short Answer',
    icon: Type,
    description: 'Brief text response',
  },
  {
    value: 'essay',
    label: 'Essay',
    icon: FileText,
    description: 'Long-form written response',
  },
  {
    value: 'code',
    label: 'Code',
    icon: Code,
    description: 'Programming code response',
  },
];

const assessmentSchema = z.object({
  course_id: z.string().min(1, 'Course is required'),
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z.string().optional(),
  type: z.enum(['quiz', 'exam', 'assignment', 'practice']),
  duration_minutes: z.coerce.number().min(1, 'Duration must be at least 1 minute'),
  total_points: z.coerce.number().min(1, 'Total points must be at least 1'),
  passing_score: z.coerce.number().min(0).max(100, 'Passing score must be between 0-100'),
  attempts_allowed: z.coerce.number().min(1, 'At least 1 attempt must be allowed'),
  is_timed: z.boolean().default(false),
  shuffle_questions: z.boolean().default(false),
  show_results_immediately: z.boolean().default(true),
  require_webcam: z.boolean().default(false),
  instructions: z.string().optional(),
  questions: z.array(z.object({
    id: z.string().optional(),
    type: z.enum(['multiple_choice', 'multiple_select', 'true_false', 'short_answer', 'essay', 'code']),
    question: z.string().min(1, 'Question is required'),
    points: z.coerce.number().min(1, 'Points must be at least 1'),
    explanation: z.string().optional(),
    options: z.array(z.object({
      id: z.string().optional(),
      text: z.string().min(1, 'Option text is required'),
      is_correct: z.boolean().default(false),
    })).optional(),
    correct_answer: z.string().optional(),
    code_language: z.string().optional(),
    image_url: z.string().optional(),
    video_url: z.string().optional(),
    sequence: z.number().default(0),
  })).min(1, 'At least one question is required'),
});

type AssessmentFormData = z.infer<typeof assessmentSchema>;

export function AssessmentBuilder({
  course,
  assessment,
  onSave,
  onCancel,
  isLoading = false,
  className,
}: AssessmentBuilderProps) {
  const [activeTab, setActiveTab] = useState('details');
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<AssessmentQuestion | null>(null);
  const [selectedQuestionType, setSelectedQuestionType] = useState<string>('multiple_choice');

  const form = useForm<AssessmentFormData>({
    resolver: zodResolver(assessmentSchema),
    defaultValues: {
      course_id: course.id,
      title: assessment?.title || '',
      description: assessment?.description || '',
      type: assessment?.type || 'quiz',
      duration_minutes: assessment?.duration_minutes || 30,
      total_points: assessment?.total_points || 100,
      passing_score: assessment?.passing_score || 70,
      attempts_allowed: assessment?.attempts_allowed || 3,
      is_timed: assessment?.is_timed || false,
      shuffle_questions: assessment?.shuffle_questions || false,
      show_results_immediately: assessment?.show_results_immediately || true,
      require_webcam: assessment?.require_webcam || false,
      instructions: assessment?.instructions || '',
      questions: assessment?.questions || [],
    },
  });

  const { fields: questions, append, remove, move } = useFieldArray({
    control: form.control,
    name: 'questions',
  });

  const handleSubmit = async (data: AssessmentFormData) => {
    try {
      await onSave(data);
      toast.success(assessment ? 'Assessment updated successfully' : 'Assessment created successfully');
    } catch (error) {
      toast.error(`Failed to ${assessment ? 'update' : 'create'} assessment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex !== destinationIndex) {
      move(sourceIndex, destinationIndex);
    }
  }, [move]);

  const addQuestion = useCallback((type: string) => {
    const newQuestion: any = {
      id: `temp-${Date.now()}`,
      type,
      question: '',
      points: 1,
      explanation: '',
      sequence: questions.length,
    };

    // Add type-specific fields
    if (type === 'multiple_choice' || type === 'multiple_select') {
      newQuestion.options = [
        { id: `opt-1`, text: '', is_correct: false },
        { id: `opt-2`, text: '', is_correct: false },
      ];
    } else if (type === 'true_false') {
      newQuestion.options = [
        { id: `true`, text: 'True', is_correct: false },
        { id: `false`, text: 'False', is_correct: false },
      ];
    } else if (type === 'code') {
      newQuestion.code_language = 'javascript';
      newQuestion.correct_answer = '';
    }

    append(newQuestion);
    setShowQuestionDialog(false);
  }, [append, questions.length]);

  const duplicateQuestion = useCallback((index: number) => {
    const question = questions[index];
    const duplicated = {
      ...question,
      id: `temp-${Date.now()}`,
      sequence: questions.length,
    };
    append(duplicated);
  }, [append, questions]);

  const renderQuestionTypeSelector = () => (
    <div className="grid grid-cols-2 gap-4">
      {questionTypes.map((type) => {
        const Icon = type.icon;
        return (
          <Button
            key={type.value}
            variant={selectedQuestionType === type.value ? "default" : "outline"}
            className="h-auto p-4 flex flex-col items-start gap-2"
            onClick={() => setSelectedQuestionType(type.value)}
          >
            <div className="flex items-center gap-2">
              <Icon className="h-5 w-5" />
              <span className="font-medium">{type.label}</span>
            </div>
            <span className="text-xs text-left opacity-75">{type.description}</span>
          </Button>
        );
      })}
    </div>
  );

  const renderQuestionCard = (question: any, index: number) => {
    const questionType = questionTypes.find(t => t.type === question.type);
    const Icon = questionType?.icon || HelpCircle;

    return (
      <Draggable draggableId={question.id || `question-${index}`} index={index} key={question.id || `question-${index}`}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={`
              group relative border rounded-lg p-4 transition-all
              ${snapshot.isDragging ? 'shadow-lg' : 'hover:shadow-md'}
            `}
          >
            <div className="flex items-start gap-4">
              <div
                {...provided.dragHandleProps}
                className="mt-1 cursor-move text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <GripVertical className="h-5 w-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="h-5 w-5 text-blue-600" />
                  <Badge variant="outline">{questionType?.label}</Badge>
                  <Badge variant="secondary">{question.points} pt{question.points !== 1 ? 's' : ''}</Badge>
                </div>

                <h4 className="font-medium text-sm mb-2">
                  {question.question || 'Untitled Question'}
                </h4>

                {question.options && question.options.length > 0 && (
                  <div className="space-y-1 mb-2">
                    {question.options.map((option: any, optIndex: number) => (
                      <div key={optIndex} className="flex items-center gap-2 text-sm">
                        <div className={`w-3 h-3 rounded-full border-2 ${
                          option.is_correct ? 'bg-green-500 border-green-500' : 'border-gray-300'
                        }`} />
                        <span className={option.is_correct ? 'font-medium' : ''}>{option.text}</span>
                      </div>
                    ))}
                  </div>
                )}

                {question.explanation && (
                  <p className="text-xs text-gray-600 mt-2">
                    Explanation: {question.explanation}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingQuestion(question);
                    setShowQuestionDialog(true);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => duplicateQuestion(index)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </Draggable>
    );
  };

  const calculateStats = () => {
    const totalQuestions = questions.length;
    const totalPoints = questions.reduce((sum, q) => sum + (q.points || 0), 0);
    const questionTypes = questions.reduce((acc, q) => {
      acc[q.type] = (acc[q.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { totalQuestions, totalPoints, questionTypes };
  };

  const stats = calculateStats();

  return (
    <div className={`space-y-6 ${className}`}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                {assessment ? 'Edit Assessment' : 'Create Assessment'}
              </h2>
              <p className="text-gray-600">Course: {course.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button type="button" variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button type="submit" disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Saving...' : assessment ? 'Update Assessment' : 'Create Assessment'}
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="questions">Questions ({stats.totalQuestions})</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Assessment Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assessment Title *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter assessment title" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assessment Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="quiz">Quiz</SelectItem>
                              <SelectItem value="exam">Exam</SelectItem>
                              <SelectItem value="assignment">Assignment</SelectItem>
                              <SelectItem value="practice">Practice</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Brief description of the assessment"
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="instructions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instructions</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Instructions for students taking the assessment"
                            rows={4}
                          />
                        </FormControl>
                        <FormDescription>
                          These instructions will be shown to students before they start the assessment
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="duration_minutes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration (minutes)</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" min="1" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="total_points"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Points</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" min="1" />
                          </FormControl>
                          <FormDescription>
                            Calculated: {stats.totalPoints} pts
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="passing_score"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Passing Score (%)</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" min="0" max="100" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="questions" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Questions</CardTitle>
                    <Dialog open={showQuestionDialog} onOpenChange={setShowQuestionDialog}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Question
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Question</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Question Type</Label>
                            <div className="mt-2">
                              {renderQuestionTypeSelector()}
                            </div>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setShowQuestionDialog(false)}>
                              Cancel
                            </Button>
                            <Button onClick={() => addQuestion(selectedQuestionType)}>
                              Add Question
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {questions.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Layers className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2">No questions yet</h3>
                      <p className="mb-4">Add your first question to get started</p>
                      <Button onClick={() => setShowQuestionDialog(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Question
                      </Button>
                    </div>
                  ) : (
                    <DragDropContext onDragEnd={handleDragEnd}>
                      <Droppable droppableId="questions">
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="space-y-4"
                          >
                            {questions.map((question, index) => renderQuestionCard(question, index))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Assessment Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="attempts_allowed"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Attempts Allowed</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" min="1" />
                            </FormControl>
                            <FormDescription>
                              Number of attempts students can make
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="is_timed"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Timed Assessment</FormLabel>
                              <FormDescription>
                                Enforce time limit for the assessment
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="shuffle_questions"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Shuffle Questions</FormLabel>
                              <FormDescription>
                                Randomize question order for each attempt
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="show_results_immediately"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Show Results Immediately</FormLabel>
                              <FormDescription>
                                Show results and score after completion
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="require_webcam"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Require Webcam</FormLabel>
                              <FormDescription>
                                Enable webcam monitoring during assessment
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <Card>
                <CardHeader>
                  <CardTitle>Assessment Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{stats.totalQuestions}</div>
                      <div className="text-sm text-gray-600">Total Questions</div>
                    </div>
                    <div className="text-center p-6 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{stats.totalPoints}</div>
                      <div className="text-sm text-gray-600">Total Points</div>
                    </div>
                    <div className="text-center p-6 border rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{form.watch('duration_minutes')}</div>
                      <div className="text-sm text-gray-600">Duration (min)</div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-medium mb-4">Question Type Distribution</h4>
                    <div className="space-y-2">
                      {Object.entries(stats.questionTypes).map(([type, count]) => {
                        const questionType = questionTypes.find(t => t.value === type);
                        return (
                          <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              {questionType && <questionType.icon className="h-4 w-4" />}
                              <span className="text-sm">{questionType?.label || type}</span>
                            </div>
                            <Badge variant="outline">{count}</Badge>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </div>
  );
}