'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';

interface FacilitySpecificationTabProps {
  data: any;
  updateData: (updates: any) => void;
}

export function FacilitySpecificationTab({ data, updateData }: FacilitySpecificationTabProps) {
  const specifications = data.specifications || {};
  const equipment = data.equipment || {};
  const [newAmenityInput, setNewAmenityInput] = useState('');
  const [newEquipmentInput, setNewEquipmentInput] = useState('');

  const handleSpecificationChange = (field: string, value: string | number) => {
    const updatedSpecs = { ...specifications, [field]: value };
    updateData({ specifications: updatedSpecs });
  };

  // Equipment and Amenities Management
  const getAmenities = (): string[] => {
    return equipment.amenities || [];
  };

  const getEquipmentList = (): string[] => {
    return equipment.equipment || [];
  };

  const addAmenity = () => {
    if (newAmenityInput.trim()) {
      const currentAmenities = getAmenities();
      const updatedAmenities = [...currentAmenities, newAmenityInput.trim()];
      const updatedEquipment = { ...equipment, amenities: updatedAmenities };
      updateData({ equipment: updatedEquipment });
      setNewAmenityInput('');
    }
  };

  const removeAmenity = (index: number) => {
    const currentAmenities = getAmenities();
    const updatedAmenities = currentAmenities.filter((_, i) => i !== index);
    const updatedEquipment = { ...equipment, amenities: updatedAmenities };
    updateData({ equipment: updatedEquipment });
  };

  const addEquipment = () => {
    if (newEquipmentInput.trim()) {
      const currentEquipment = getEquipmentList();
      const updatedEquipmentList = [...currentEquipment, newEquipmentInput.trim()];
      const updatedEquipment = { ...equipment, equipment: updatedEquipmentList };
      updateData({ equipment: updatedEquipment });
      setNewEquipmentInput('');
    }
  };

  const removeEquipment = (index: number) => {
    const currentEquipment = getEquipmentList();
    const updatedEquipmentList = currentEquipment.filter((_, i) => i !== index);
    const updatedEquipment = { ...equipment, equipment: updatedEquipmentList };
    updateData({ equipment: updatedEquipment });
  };

  const handleInputKeyPress = (e: React.KeyboardEvent, type: 'amenity' | 'equipment') => {
    if (e.key === 'Enter') {
      if (type === 'amenity') {
        addAmenity();
      } else {
        addEquipment();
      }
    }
  };

  // Common amenities suggestions
  const commonAmenities = [
    'Locker Rooms', 'Parking', 'Viewing Gallery', 'Changing Rooms', 'Restrooms',
    'Concession Stand', 'First Aid Station', 'Storage', 'Seating Area', 'Waiting Area',
    'Reception Desk', 'Pro Shop', 'Equipment Rental', 'Shower Facilities', 'Spectator Seating'
  ];

  const commonEquipment = [
    'Sound System', 'Lighting System', 'Security Cameras', 'Scoreboard', 'Timer System',
    'Projector', 'Microphone', 'WiFi', 'Air Conditioning', 'Heating System',
    'Emergency Equipment', 'Cleaning Equipment', 'Maintenance Tools'
  ];

  const addCommonAmenity = (amenity: string) => {
    if (!getAmenities().includes(amenity)) {
      const updatedAmenities = [...getAmenities(), amenity];
      const updatedEquipment = { ...equipment, amenities: updatedAmenities };
      updateData({ equipment: updatedEquipment });
    }
  };

  const addCommonEquipment = (item: string) => {
    if (!getEquipmentList().includes(item)) {
      const updatedEquipmentList = [...getEquipmentList(), item];
      const updatedEquipment = { ...equipment, equipment: updatedEquipmentList };
      updateData({ equipment: updatedEquipment });
    }
  };

  const renderPoolSpecifications = () => (
    <Card>
      <CardHeader>
        <CardTitle>Swimming Pool Specifications</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="pool_length">Length (meters)</Label>
            <Input
              id="pool_length"
              value={specifications.pool_length || ''}
              onChange={(e) => handleSpecificationChange('pool_length', parseFloat(e.target.value || '0'))}
              placeholder="25"
              type="number"
              step="0.1"
              min="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pool_width">Width (meters)</Label>
            <Input
              id="pool_width"
              value={specifications.pool_width || ''}
              onChange={(e) => handleSpecificationChange('pool_width', parseFloat(e.target.value || '0'))}
              placeholder="12.5"
              type="number"
              step="0.1"
              min="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pool_depth">Depth (meters)</Label>
            <Input
              id="pool_depth"
              value={specifications.pool_depth || ''}
              onChange={(e) => handleSpecificationChange('pool_depth', parseFloat(e.target.value || '0'))}
              placeholder="2.0"
              type="number"
              step="0.1"
              min="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pool_lanes">Number of Lanes</Label>
            <Input
              id="pool_lanes"
              value={specifications.pool_lanes || ''}
              onChange={(e) => handleSpecificationChange('pool_lanes', parseInt(e.target.value || '0'))}
              placeholder="8"
              type="number"
              min="1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pool_type">Pool Type</Label>
            <Select 
              value={specifications.pool_type || ''} 
              onValueChange={(value) => handleSpecificationChange('pool_type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select pool type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="indoor">Indoor</SelectItem>
                <SelectItem value="outdoor">Outdoor</SelectItem>
                <SelectItem value="semi_outdoor">Semi-Outdoor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="water_temperature">Water Temperature (°C)</Label>
            <Input
              id="water_temperature"
              value={specifications.water_temperature || ''}
              onChange={(e) => handleSpecificationChange('water_temperature', parseFloat(e.target.value || '0'))}
              placeholder="26"
              type="number"
              step="0.1"
              min="0"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderCourtsSpecifications = () => (
    <Card>
      <CardHeader>
        <CardTitle>Courts Specifications</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="court_type">Court Type</Label>
            <Select 
              value={specifications.court_type || ''} 
              onValueChange={(value) => handleSpecificationChange('court_type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select court type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tennis">Tennis</SelectItem>
                <SelectItem value="basketball">Basketball</SelectItem>
                <SelectItem value="volleyball">Volleyball</SelectItem>
                <SelectItem value="badminton">Badminton</SelectItem>
                <SelectItem value="multi_purpose">Multi-Purpose</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="surface_type">Surface Type</Label>
            <Select 
              value={specifications.surface_type || ''} 
              onValueChange={(value) => handleSpecificationChange('surface_type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select surface type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hardcourt">Hardcourt</SelectItem>
                <SelectItem value="clay">Clay</SelectItem>
                <SelectItem value="grass">Grass</SelectItem>
                <SelectItem value="synthetic">Synthetic</SelectItem>
                <SelectItem value="wood">Wood</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="court_count">Number of Courts</Label>
            <Input
              id="court_count"
              value={specifications.court_count || ''}
              onChange={(e) => handleSpecificationChange('court_count', parseInt(e.target.value || '0'))}
              placeholder="4"
              type="number"
              min="1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lighting">Lighting</Label>
            <Select 
              value={specifications.lighting || ''} 
              onValueChange={(value) => handleSpecificationChange('lighting', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select lighting type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="natural">Natural Only</SelectItem>
                <SelectItem value="artificial">Artificial</SelectItem>
                <SelectItem value="both">Natural + Artificial</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderGymSpecifications = () => (
    <Card>
      <CardHeader>
        <CardTitle>Gymnasium Specifications</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="ceiling_height">Ceiling Height (meters)</Label>
            <Input
              id="ceiling_height"
              value={specifications.ceiling_height || ''}
              onChange={(e) => handleSpecificationChange('ceiling_height', parseFloat(e.target.value || '0'))}
              placeholder="8.0"
              type="number"
              step="0.1"
              min="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="flooring_type">Flooring Type</Label>
            <Select 
              value={specifications.flooring_type || ''} 
              onValueChange={(value) => handleSpecificationChange('flooring_type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select flooring type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hardwood">Hardwood</SelectItem>
                <SelectItem value="synthetic">Synthetic</SelectItem>
                <SelectItem value="rubber">Rubber</SelectItem>
                <SelectItem value="vinyl">Vinyl</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hvac_system">HVAC System</Label>
            <Select 
              value={specifications.hvac_system || ''} 
              onValueChange={(value) => handleSpecificationChange('hvac_system', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select HVAC system" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="central_ac">Central AC</SelectItem>
                <SelectItem value="split_ac">Split AC</SelectItem>
                <SelectItem value="natural_ventilation">Natural Ventilation</SelectItem>
                <SelectItem value="mixed">Mixed System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sound_system">Sound System</Label>
            <Select 
              value={specifications.sound_system || ''} 
              onValueChange={(value) => handleSpecificationChange('sound_system', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select sound system" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderFieldSpecifications = () => (
    <Card>
      <CardHeader>
        <CardTitle>Sports Field Specifications</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="field_type">Field Type</Label>
            <Select 
              value={specifications.field_type || ''} 
              onValueChange={(value) => handleSpecificationChange('field_type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select field type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="soccer">Soccer</SelectItem>
                <SelectItem value="football">Football</SelectItem>
                <SelectItem value="baseball">Baseball</SelectItem>
                <SelectItem value="track">Track & Field</SelectItem>
                <SelectItem value="multi_sport">Multi-Sport</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="field_surface">Field Surface</Label>
            <Select 
              value={specifications.field_surface || ''} 
              onValueChange={(value) => handleSpecificationChange('field_surface', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select field surface" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="natural_grass">Natural Grass</SelectItem>
                <SelectItem value="artificial_turf">Artificial Turf</SelectItem>
                <SelectItem value="dirt">Dirt</SelectItem>
                <SelectItem value="track_surface">Track Surface</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="field_length">Field Length (meters)</Label>
            <Input
              id="field_length"
              value={specifications.field_length || ''}
              onChange={(e) => handleSpecificationChange('field_length', parseFloat(e.target.value || '0'))}
              placeholder="100"
              type="number"
              step="0.1"
              min="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="field_width">Field Width (meters)</Label>
            <Input
              id="field_width"
              value={specifications.field_width || ''}
              onChange={(e) => handleSpecificationChange('field_width', parseFloat(e.target.value || '0'))}
              placeholder="60"
              type="number"
              step="0.1"
              min="0"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderClassroomSpecifications = () => (
    <Card>
      <CardHeader>
        <CardTitle>Classroom Specifications</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="seating_arrangement">Seating Arrangement</Label>
            <Select 
              value={specifications.seating_arrangement || ''} 
              onValueChange={(value) => handleSpecificationChange('seating_arrangement', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select seating arrangement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="theater">Theater Style</SelectItem>
                <SelectItem value="classroom">Classroom Style</SelectItem>
                <SelectItem value="u_shape">U-Shape</SelectItem>
                <SelectItem value="conference">Conference</SelectItem>
                <SelectItem value="flexible">Flexible</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="av_equipment">A/V Equipment</Label>
            <Select 
              value={specifications.av_equipment || ''} 
              onValueChange={(value) => handleSpecificationChange('av_equipment', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select A/V equipment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Basic (Projector)</SelectItem>
                <SelectItem value="standard">Standard (Projector + Audio)</SelectItem>
                <SelectItem value="advanced">Advanced (Interactive Board)</SelectItem>
                <SelectItem value="premium">Premium (Full A/V Suite)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="whiteboard_type">Whiteboard Type</Label>
            <Select 
              value={specifications.whiteboard_type || ''} 
              onValueChange={(value) => handleSpecificationChange('whiteboard_type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select whiteboard type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="traditional">Traditional Whiteboard</SelectItem>
                <SelectItem value="interactive">Interactive Whiteboard</SelectItem>
                <SelectItem value="smart_board">Smart Board</SelectItem>
                <SelectItem value="multiple">Multiple Boards</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="internet_access">Internet Access</Label>
            <Select 
              value={specifications.internet_access || ''} 
              onValueChange={(value) => handleSpecificationChange('internet_access', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select internet access" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wifi">WiFi</SelectItem>
                <SelectItem value="ethernet">Ethernet</SelectItem>
                <SelectItem value="both">WiFi + Ethernet</SelectItem>
                <SelectItem value="none">No Internet</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderSpecificationsByType = () => {
    switch (data.facility_type) {
      case 'POOL':
        return renderPoolSpecifications();
      case 'COURTS':
        return renderCourtsSpecifications();
      case 'GYM':
        return renderGymSpecifications();
      case 'FIELD':
        return renderFieldSpecifications();
      case 'CLASSROOM':
        return renderClassroomSpecifications();
      default:
        return (
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground text-center">
                Please select a facility type in the Details tab to configure specific specifications.
              </p>
            </CardContent>
          </Card>
        );
    }
  };

  // Amenities and Equipment Management Components
  const renderAmenitiesManagement = () => (
    <Card>
      <CardHeader>
        <CardTitle>Amenities</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="amenities">Add Amenities</Label>
          <p className="text-sm text-muted-foreground">
            Add amenities available at this facility (e.g., Locker Rooms, Parking, Viewing Gallery)
          </p>
          <div className="flex space-x-2">
            <Input
              id="amenities"
              placeholder="Enter amenity name"
              value={newAmenityInput}
              onChange={(e) => setNewAmenityInput(e.target.value)}
              onKeyPress={(e) => handleInputKeyPress(e, 'amenity')}
              className="flex-1"
            />
            <Button onClick={addAmenity} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </div>
        
        {getAmenities().length > 0 && (
          <div className="space-y-2">
            <Label>Current Amenities</Label>
            <div className="flex flex-wrap gap-2">
              {getAmenities().map((amenity, index) => (
                <Badge key={index} variant="secondary" className="text-sm">
                  {amenity}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAmenity(index)}
                    className="ml-2 h-4 w-4 p-0 hover:bg-transparent"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* Common Amenities Suggestions */}
        <div className="space-y-2">
          <Label>Common Amenities</Label>
          <p className="text-sm text-muted-foreground">
            Click to add common amenities to your facility
          </p>
          <div className="flex flex-wrap gap-2">
            {commonAmenities.map((amenity, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => addCommonAmenity(amenity)}
                disabled={getAmenities().includes(amenity)}
                className="text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                {amenity}
              </Button>
            ))}
          </div>
        </div>

        {getAmenities().length === 0 && (
          <div className="text-sm text-muted-foreground text-center py-4">
            No amenities added yet. Add amenities to help users understand what's available at this facility.
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderEquipmentManagement = () => (
    <Card>
      <CardHeader>
        <CardTitle>Equipment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="equipment">Add Equipment</Label>
          <p className="text-sm text-muted-foreground">
            Add equipment available at this facility (e.g., Starting Blocks, Timing System, Sound System)
          </p>
          <div className="flex space-x-2">
            <Input
              id="equipment"
              placeholder="Enter equipment name"
              value={newEquipmentInput}
              onChange={(e) => setNewEquipmentInput(e.target.value)}
              onKeyPress={(e) => handleInputKeyPress(e, 'equipment')}
              className="flex-1"
            />
            <Button onClick={addEquipment} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </div>
        
        {getEquipmentList().length > 0 && (
          <div className="space-y-2">
            <Label>Current Equipment</Label>
            <div className="flex flex-wrap gap-2">
              {getEquipmentList().map((item, index) => (
                <Badge key={index} variant="outline" className="text-sm">
                  {item}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEquipment(index)}
                    className="ml-2 h-4 w-4 p-0 hover:bg-transparent"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* Common Equipment Suggestions */}
        <div className="space-y-2">
          <Label>Common Equipment</Label>
          <p className="text-sm text-muted-foreground">
            Click to add common equipment to your facility
          </p>
          <div className="flex flex-wrap gap-2">
            {commonEquipment.map((item, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => addCommonEquipment(item)}
                disabled={getEquipmentList().includes(item)}
                className="text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                {item}
              </Button>
            ))}
          </div>
        </div>

        {getEquipmentList().length === 0 && (
          <div className="text-sm text-muted-foreground text-center py-4">
            No equipment added yet. Add equipment to help users understand what's available at this facility.
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Facility Specifications</h2>
        <p className="text-muted-foreground">
          Configure amenities, equipment, and activity-specific specifications for your facility.
        </p>
      </div>

      {/* Amenities and Equipment Management */}
      {renderAmenitiesManagement()}
      {renderEquipmentManagement()}

      {/* Activity-Specific Specifications */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Activity-Specific Specifications</h3>
        <p className="text-muted-foreground mb-4">
          Configure specifications based on the selected facility type ({data.facility_type || 'None selected'}).
        </p>
        {renderSpecificationsByType()}
      </div>
    </div>
  );
}