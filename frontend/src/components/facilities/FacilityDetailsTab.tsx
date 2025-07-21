'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CURRENCY } from '@/lib/constants';

interface FacilityDetailsTabProps {
  data: any;
  updateData: (updates: any) => void;
}

export function FacilityDetailsTab({ data, updateData }: FacilityDetailsTabProps) {
  const handleInputChange = (field: string, value: string | number) => {
    updateData({ [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Facility Name *</Label>
          <Input
            id="name"
            value={data.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter facility name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="facility_type">Facility Type *</Label>
          <Select value={data.facility_type} onValueChange={(value) => handleInputChange('facility_type', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select facility type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="POOL">Swimming Pool</SelectItem>
              <SelectItem value="COURTS">Courts</SelectItem>
              <SelectItem value="GYM">Gymnasium</SelectItem>
              <SelectItem value="FIELD">Sports Field</SelectItem>
              <SelectItem value="CLASSROOM">Classroom</SelectItem>
              <SelectItem value="EXTERNAL">External Facility</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={data.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Enter facility description"
            rows={3}
          />
        </div>
      </div>

      {/* Location Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Location Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              value={data.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Enter full address"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={data.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              placeholder="Enter city"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">State/Province</Label>
            <Input
              id="state"
              value={data.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              placeholder="Enter state or province"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="postal_code">Postal Code</Label>
            <Input
              id="postal_code"
              value={data.postal_code}
              onChange={(e) => handleInputChange('postal_code', e.target.value)}
              placeholder="Enter postal code"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={data.country}
              onChange={(e) => handleInputChange('country', e.target.value)}
              placeholder="Enter country"
            />
          </div>
        </div>
      </div>

      {/* Facility Head Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Facility Head Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="facility_head_name">Facility Head Name</Label>
            <Input
              id="facility_head_name"
              value={data.facility_head_name}
              onChange={(e) => handleInputChange('facility_head_name', e.target.value)}
              placeholder="Enter facility head name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="facility_head_phone">Facility Head Phone</Label>
            <Input
              id="facility_head_phone"
              value={data.facility_head_phone}
              onChange={(e) => handleInputChange('facility_head_phone', e.target.value)}
              placeholder="Enter facility head phone number"
              type="tel"
            />
          </div>
        </div>
      </div>

      {/* Access Fees */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Access Fees (Nigerian Naira)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="access_fee_kids">Kids Access Fee ({CURRENCY.SYMBOL})</Label>
            <Input
              id="access_fee_kids"
              value={data.access_fee_kids || ''} // Store as whole number in NGN
              onChange={(e) => handleInputChange('access_fee_kids', parseFloat(e.target.value || '0'))}
              placeholder="0"
              type="number"
              step="1"
              min="0"
            />
            <p className="text-xs text-muted-foreground">Enter amount in Nigerian Naira</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="access_fee_adults">Adults Access Fee ({CURRENCY.SYMBOL})</Label>
            <Input
              id="access_fee_adults"
              value={data.access_fee_adults || ''} // Store as whole number in NGN
              onChange={(e) => handleInputChange('access_fee_adults', parseFloat(e.target.value || '0'))}
              placeholder="0"
              type="number"
              step="1"
              min="0"
            />
            <p className="text-xs text-muted-foreground">Enter amount in Nigerian Naira</p>
          </div>
        </div>
      </div>

      {/* Basic Properties */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Basic Properties</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="capacity">Capacity</Label>
            <Input
              id="capacity"
              value={data.capacity}
              onChange={(e) => handleInputChange('capacity', parseInt(e.target.value || '0'))}
              placeholder="0"
              type="number"
              min="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="area_sqft">Area (sq ft)</Label>
            <Input
              id="area_sqft"
              value={data.area_sqft}
              onChange={(e) => handleInputChange('area_sqft', parseInt(e.target.value || '0'))}
              placeholder="0"
              type="number"
              min="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="facility_code">Facility Code</Label>
            <Input
              id="facility_code"
              value={data.facility_code}
              onChange={(e) => handleInputChange('facility_code', e.target.value.toUpperCase())}
              placeholder="e.g., POOL-01"
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="contact_phone">Contact Phone</Label>
            <Input
              id="contact_phone"
              value={data.contact_phone}
              onChange={(e) => handleInputChange('contact_phone', e.target.value)}
              placeholder="Enter contact phone"
              type="tel"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_email">Contact Email</Label>
            <Input
              id="contact_email"
              value={data.contact_email}
              onChange={(e) => handleInputChange('contact_email', e.target.value)}
              placeholder="Enter contact email"
              type="email"
            />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Additional Notes</Label>
        <Textarea
          id="notes"
          value={data.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          placeholder="Enter any additional notes about the facility"
          rows={3}
        />
      </div>
    </div>
  );
}