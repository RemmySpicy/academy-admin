'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Edit, Trash2, Copy, DollarSign, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useProgramContext } from '@/store/programContext';
import { coursesApi } from '@/features/courses/api/courseApiService';
import { facilityCoursePricingApi } from '@/features/facilities/api/facilityCoursePricingApi';

interface FacilityCoursePriceTabProps {
  data: any;
  updateData: (updates: any) => void;
}

interface PricingEntry {
  id?: string;
  course_id: string;
  course_name: string;
  age_group: string;
  location_type: string;
  session_type: string;
  price: number;
  formatted_price: string;
  is_active: boolean;
  notes?: string;
}

interface CourseData {
  id: string;
  name: string;
  age_groups: string[];
  location_types: string[];
  session_types: string[];
  pricing_ranges: Array<{
    age_group: string;
    price_from: number;
    price_to: number;
  }>;
}

export function FacilityCoursePriceTab({ data, updateData }: FacilityCoursePriceTabProps) {
  const { currentProgram } = useProgramContext();
  const [pricingEntries, setPricingEntries] = useState<PricingEntry[]>([]);
  const [availableCourses, setAvailableCourses] = useState<CourseData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<PricingEntry | null>(null);
  const [formData, setFormData] = useState({
    course_id: '',
    age_group: '',
    location_type: '',
    session_type: '',
    price: '',
    notes: ''
  });

  useEffect(() => {
    loadPricingData();
    loadAvailableCourses();
  }, [data.id, currentProgram]);

  const loadPricingData = async () => {
    if (!data.id) return;
    
    try {
      setIsLoading(true);
      const pricingEntries = await facilityCoursePricingApi.getFacilityPricing(data.id);
      
      // Transform the API response to match our interface
      const transformedEntries: PricingEntry[] = pricingEntries.map((entry) => ({
        id: entry.id,
        course_id: entry.course_id,
        course_name: entry.course?.name || 'Unknown Course',
        age_group: entry.age_group,
        location_type: entry.location_type,
        session_type: entry.session_type,
        price: entry.price,
        formatted_price: entry.formatted_price || facilityCoursePricingApi.formatPrice(entry.price),
        is_active: entry.is_active,
        notes: entry.notes
      }));
      
      setPricingEntries(transformedEntries);
    } catch (error) {
      console.error('Error loading pricing data:', error);
      toast.error('Failed to load pricing data');
      // Set empty array on error so UI still renders
      setPricingEntries([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAvailableCourses = async () => {
    if (!currentProgram?.id) return;
    
    try {
      const courses = await coursesApi.getCourses({ program_id: currentProgram.id });
      setAvailableCourses(courses.items || []);
    } catch (error) {
      console.error('Error loading courses:', error);
    }
  };

  const handleAddPricing = () => {
    setEditingEntry(null);
    setFormData({
      course_id: '',
      age_group: '',
      location_type: '',
      session_type: '',
      price: '',
      notes: ''
    });
    setIsDialogOpen(true);
  };

  const handleEditPricing = (entry: PricingEntry) => {
    setEditingEntry(entry);
    setFormData({
      course_id: entry.course_id,
      age_group: entry.age_group,
      location_type: entry.location_type,
      session_type: entry.session_type,
      price: entry.price.toString(),
      notes: entry.notes || ''
    });
    setIsDialogOpen(true);
  };

  const handleSavePricing = async () => {
    try {
      const pricingData = {
        facility_id: data.id,
        course_id: formData.course_id,
        age_group: formData.age_group,
        location_type: formData.location_type,
        session_type: formData.session_type,
        price: parseInt(formData.price),
        is_active: true,
        notes: formData.notes
      };

      if (editingEntry) {
        await facilityCoursePricingApi.updatePricingEntry(editingEntry.id!, pricingData);
        toast.success('Pricing updated successfully');
      } else {
        await facilityCoursePricingApi.createPricingEntry(pricingData);
        toast.success('Pricing created successfully');
      }

      setIsDialogOpen(false);
      loadPricingData();
    } catch (error) {
      toast.error('Failed to save pricing');
    }
  };

  const handleDeletePricing = async (entry: PricingEntry) => {
    if (!confirm('Are you sure you want to delete this pricing entry?')) return;
    
    try {
      await facilityCoursePricingApi.deletePricingEntry(entry.id!);
      toast.success('Pricing deleted successfully');
      loadPricingData();
    } catch (error) {
      toast.error('Failed to delete pricing');
    }
  };

  const getSelectedCourse = () => {
    return availableCourses.find(course => course.id === formData.course_id);
  };

  const getRecommendedPrice = () => {
    const course = getSelectedCourse();
    if (!course || !formData.age_group) return null;
    
    const priceRange = course.pricing_ranges.find(range => range.age_group === formData.age_group);
    if (!priceRange) return null;
    
    const midPrice = Math.round((priceRange.price_from + priceRange.price_to) / 2);
    return {
      min: priceRange.price_from,
      max: priceRange.price_to,
      recommended: midPrice
    };
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(value).replace('NGN', '₦');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold mb-2">Course Pricing Configuration</h2>
          <p className="text-muted-foreground">
            Set actual prices customers pay for courses at this facility. These override the course price ranges.
          </p>
        </div>
        <Button onClick={handleAddPricing}>
          <Plus className="h-4 w-4 mr-2" />
          Add Course Pricing
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Facility Course Pricing Matrix
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pricingEntries.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Age Group</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Session Type</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pricingEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">{entry.course_name}</TableCell>
                    <TableCell>{entry.age_group}</TableCell>
                    <TableCell className="capitalize">{entry.location_type.replace('-', ' ')}</TableCell>
                    <TableCell className="capitalize">{entry.session_type}</TableCell>
                    <TableCell className="font-semibold">{entry.formatted_price}</TableCell>
                    <TableCell>
                      <Badge variant={entry.is_active ? "default" : "secondary"}>
                        {entry.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditPricing(entry)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePricing(entry)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                <DollarSign className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Course Pricing Configured</h3>
              <p className="text-gray-600 mb-4">
                Set up pricing for courses available at this facility.
              </p>
              <Button onClick={handleAddPricing}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Course Pricing
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Pricing Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingEntry ? 'Edit Course Pricing' : 'Add Course Pricing'}
            </DialogTitle>
            <DialogDescription>
              Configure the actual price customers pay for this course at this facility.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="course">Course *</Label>
              <Select
                value={formData.course_id}
                onValueChange={(value) => setFormData({ ...formData, course_id: value, age_group: '', location_type: '', session_type: '' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {availableCourses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="age_group">Age Group *</Label>
              <Select
                value={formData.age_group}
                onValueChange={(value) => setFormData({ ...formData, age_group: value })}
                disabled={!formData.course_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select age group" />
                </SelectTrigger>
                <SelectContent>
                  {getSelectedCourse()?.age_groups.map((ageGroup) => (
                    <SelectItem key={ageGroup} value={ageGroup}>
                      {ageGroup}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location_type">Location Type *</Label>
              <Select
                value={formData.location_type}
                onValueChange={(value) => setFormData({ ...formData, location_type: value })}
                disabled={!formData.course_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select location type" />
                </SelectTrigger>
                <SelectContent>
                  {getSelectedCourse()?.location_types.map((locationType) => (
                    <SelectItem key={locationType} value={locationType}>
                      {locationType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="session_type">Session Type *</Label>
              <Select
                value={formData.session_type}
                onValueChange={(value) => setFormData({ ...formData, session_type: value })}
                disabled={!formData.course_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select session type" />
                </SelectTrigger>
                <SelectContent>
                  {getSelectedCourse()?.session_types.map((sessionType) => (
                    <SelectItem key={sessionType} value={sessionType}>
                      {sessionType.charAt(0).toUpperCase() + sessionType.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="price">Price (₦) *</Label>
              <div className="relative">
                <Input
                  id="price"
                  type="number"
                  placeholder="Enter price in Naira"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="pl-8"
                />
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">₦</span>
              </div>
              
              {getRecommendedPrice() && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-md">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <div className="text-sm">
                    <p className="text-blue-900 font-medium">Course price range: {formatCurrency(getRecommendedPrice()!.min)} - {formatCurrency(getRecommendedPrice()!.max)}</p>
                    <p className="text-blue-700">Recommended: {formatCurrency(getRecommendedPrice()!.recommended)}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setFormData({ ...formData, price: getRecommendedPrice()!.recommended.toString() })}
                  >
                    Use Recommended
                  </Button>
                </div>
              )}
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes about this pricing"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSavePricing}
              disabled={!formData.course_id || !formData.age_group || !formData.location_type || !formData.session_type || !formData.price}
            >
              {editingEntry ? 'Update Pricing' : 'Create Pricing'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}