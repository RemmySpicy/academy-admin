/**
 * FacilityCard component for displaying facility information in grid/list views
 * Production-ready component with comprehensive actions and professional styling
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Users, 
  Phone, 
  Mail, 
  Edit, 
  Eye, 
  Trash2, 
  Copy, 
  MoreHorizontal,
  Archive,
  Download,
  UserCheck,
  Building,
  Activity,
  DollarSign,
  Clock,
  Settings,
  CheckCircle,
  AlertCircle,
  Wrench
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { cn } from '@/lib/utils';
import type { Facility } from '../types';

interface FacilityCardProps {
  facility: Facility;
  onView?: (facility: Facility) => void;
  onEdit?: (facility: Facility) => void;
  onDelete?: (facility: Facility) => void;
  onDuplicate?: (facility: Facility) => void;
  onArchive?: (facility: Facility) => void;
  onExportData?: (facility: Facility) => void;
  onAssignManager?: (facility: Facility) => void;
  onManageSchedule?: (facility: Facility) => void;
  viewMode?: 'grid' | 'list';
  showActions?: boolean;
  className?: string;
}

const statusColors = {
  ACTIVE: 'bg-green-100 text-green-800',
  INACTIVE: 'bg-gray-100 text-gray-800',
  MAINTENANCE: 'bg-yellow-100 text-yellow-800',
};

const typeColors = {
  POOL: 'bg-blue-100 text-blue-800',
  COURTS: 'bg-green-100 text-green-800',
  GYM: 'bg-purple-100 text-purple-800',
  FIELD: 'bg-yellow-100 text-yellow-800',
  CLASSROOM: 'bg-orange-100 text-orange-800',
  EXTERNAL: 'bg-gray-100 text-gray-800',
};

const statusIcons = {
  ACTIVE: CheckCircle,
  INACTIVE: AlertCircle,
  MAINTENANCE: Wrench,
};

const typeIcons = {
  POOL: Activity,
  COURTS: Building,
  GYM: Building,
  FIELD: MapPin,
  CLASSROOM: Building,
  EXTERNAL: MapPin,
};

function FacilityCard({
  facility,
  onView,
  onEdit,
  onDelete,
  onDuplicate,
  onArchive,
  onExportData,
  onAssignManager,
  onManageSchedule,
  viewMode = 'grid',
  showActions = true,
  className,
}: FacilityCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const StatusIcon = statusIcons[facility.status];
  const TypeIcon = typeIcons[facility.facility_type];

  const handleAction = (action: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    switch (action) {
      case 'view':
        onView?.(facility);
        break;
      case 'edit':
        onEdit?.(facility);
        break;
      case 'delete':
        setShowDeleteDialog(true);
        break;
      case 'duplicate':
        onDuplicate?.(facility);
        break;
      case 'archive':
        onArchive?.(facility);
        break;
      case 'export':
        onExportData?.(facility);
        break;
      case 'assign-manager':
        onAssignManager?.(facility);
        break;
      case 'manage-schedule':
        onManageSchedule?.(facility);
        break;
    }
  };

  const handleDelete = () => {
    onDelete?.(facility);
    setShowDeleteDialog(false);
  };

  const formatPrice = (fee?: number) => {
    if (!fee || fee === 0) return 'Free';
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(fee);
  };

  const getAmenityCount = () => {
    if (!facility.equipment?.amenities) return 0;
    return Array.isArray(facility.equipment.amenities) ? facility.equipment.amenities.length : 0;
  };

  if (viewMode === 'list') {
    return (
      <Card className={cn("hover:shadow-md transition-shadow cursor-pointer", className)} onClick={() => onView?.(facility)}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              {/* Facility Icon */}
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <TypeIcon className="h-8 w-8 text-gray-400" />
              </div>

              {/* Facility Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{facility.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{facility.facility_code || 'No code'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={cn("text-xs", statusColors[facility.status])}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {facility.status}
                    </Badge>
                    <Badge variant="outline" className={cn("text-xs", typeColors[facility.facility_type])}>
                      {facility.facility_type}
                    </Badge>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {facility.address}
                </p>

                {/* Stats Row */}
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  {facility.capacity && (
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{facility.capacity} capacity</span>
                    </div>
                  )}
                  {facility.area_sqft && (
                    <div className="flex items-center gap-1">
                      <Building className="h-4 w-4" />
                      <span>{facility.area_sqft.toLocaleString()} sqft</span>
                    </div>
                  )}
                  {facility.facility_head_name && (
                    <div className="flex items-center gap-1">
                      <UserCheck className="h-4 w-4" />
                      <span>{facility.facility_head_name}</span>
                    </div>
                  )}
                  {(facility.access_fee_kids || facility.access_fee_adults) && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      <span>
                        {facility.access_fee_kids && facility.access_fee_adults
                          ? `${formatPrice(facility.access_fee_kids)} - ${formatPrice(facility.access_fee_adults)}`
                          : formatPrice(facility.access_fee_kids || facility.access_fee_adults)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            {showActions && (
              <div className="flex items-center gap-1 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleAction('view', e)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleAction('edit', e)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => handleAction('duplicate', e)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => handleAction('manage-schedule', e)}>
                      <Clock className="mr-2 h-4 w-4" />
                      Manage Schedule
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => handleAction('assign-manager', e)}>
                      <UserCheck className="mr-2 h-4 w-4" />
                      Assign Manager
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => handleAction('export', e)}>
                      <Download className="mr-2 h-4 w-4" />
                      Export Data
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={(e) => handleAction('archive', e)}>
                      <Archive className="mr-2 h-4 w-4" />
                      Archive
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-red-600"
                      onClick={(e) => handleAction('delete', e)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid View
  return (
    <>
      <Card className={cn("hover:shadow-lg transition-all duration-200 cursor-pointer group", className)} onClick={() => onView?.(facility)}>
        {/* Facility Header */}
        <div className="relative h-32 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-t-lg overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <TypeIcon className="h-16 w-16 text-blue-400/50" />
          </div>
          
          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className={cn("text-xs", statusColors[facility.status])}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {facility.status}
            </Badge>
          </div>

          {/* Type Badge */}
          <div className="absolute top-3 right-3">
            <Badge variant="outline" className={cn("text-xs bg-white/90", typeColors[facility.facility_type])}>
              {facility.facility_type}
            </Badge>
          </div>

          {/* Access Fee */}
          {(facility.access_fee_kids || facility.access_fee_adults) && (
            <div className="absolute bottom-3 right-3">
              <Badge variant="secondary" className="bg-white/90 text-gray-800 text-sm font-semibold">
                {facility.access_fee_kids && facility.access_fee_adults
                  ? `${formatPrice(facility.access_fee_kids)} - ${formatPrice(facility.access_fee_adults)}`
                  : formatPrice(facility.access_fee_kids || facility.access_fee_adults)}
              </Badge>
            </div>
          )}

          {/* Actions Overlay */}
          {showActions && (
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => handleAction('view', e)}
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => handleAction('edit', e)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </div>
          )}
        </div>

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold mb-1">{facility.name}</CardTitle>
              <CardDescription className="text-sm text-gray-600">{facility.facility_code || 'No code assigned'}</CardDescription>
            </div>
            {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => handleAction('duplicate', e)}>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => handleAction('manage-schedule', e)}>
                    <Clock className="mr-2 h-4 w-4" />
                    Manage Schedule
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => handleAction('assign-manager', e)}>
                    <UserCheck className="mr-2 h-4 w-4" />
                    Assign Manager
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => handleAction('export', e)}>
                    <Download className="mr-2 h-4 w-4" />
                    Export Data
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={(e) => handleAction('archive', e)}>
                    <Archive className="mr-2 h-4 w-4" />
                    Archive
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-red-600"
                    onClick={(e) => handleAction('delete', e)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {facility.address}
          </p>

          {/* Facility Stats */}
          <div className="space-y-3">
            {facility.capacity && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-gray-500">
                  <Users className="h-4 w-4" />
                  <span>Capacity</span>
                </div>
                <span className="font-medium">{facility.capacity} people</span>
              </div>
            )}

            {facility.area_sqft && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-gray-500">
                  <Building className="h-4 w-4" />
                  <span>Area</span>
                </div>
                <span className="font-medium">{facility.area_sqft.toLocaleString()} sqft</span>
              </div>
            )}

            {facility.facility_head_name && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-gray-500">
                  <UserCheck className="h-4 w-4" />
                  <span>Manager</span>
                </div>
                <span className="font-medium truncate ml-2">{facility.facility_head_name}</span>
              </div>
            )}

            {getAmenityCount() > 0 && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-gray-500">
                  <Settings className="h-4 w-4" />
                  <span>Amenities</span>
                </div>
                <span className="font-medium">{getAmenityCount()}</span>
              </div>
            )}
          </div>

          {/* Contact Information */}
          {(facility.contact_phone || facility.contact_email) && (
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="text-xs text-gray-600 space-y-1">
                {facility.contact_phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    <span>{facility.contact_phone}</span>
                  </div>
                )}
                {facility.contact_email && (
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    <span className="truncate">{facility.contact_email}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Amenities Preview */}
          {facility.equipment?.amenities && Array.isArray(facility.equipment.amenities) && facility.equipment.amenities.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="text-xs text-gray-600 space-y-1">
                <div className="font-medium">Amenities:</div>
                <div className="flex flex-wrap gap-1">
                  {facility.equipment.amenities.slice(0, 3).map((amenity: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                  {facility.equipment.amenities.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{facility.equipment.amenities.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Primary Action Buttons */}
          <div className="flex gap-2 pt-4 border-t border-gray-100 mt-4">
            <Button variant="outline" size="sm" onClick={(e) => handleAction('view', e)} className="flex-1">
              <Eye className="h-3 w-3 mr-1" />
              View Details
            </Button>
            <Button variant="outline" size="sm" onClick={(e) => handleAction('edit', e)} className="flex-1">
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Facility</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{facility.name}"? This action cannot be undone and will remove all associated data including schedules, pricing, and course assignments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete Facility
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default FacilityCard;