"""
Equipment requirement schemas for curriculum management.
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, validator

from app.features.courses.schemas.common import (
    CurriculumStatusEnum,
    EquipmentTypeEnum,
    TimestampMixin,
    PaginatedResponse,
)


class EquipmentRequirementBase(BaseModel):
    """Base equipment requirement schema with common fields."""
    
    name: str = Field(..., min_length=1, max_length=200, description="Equipment name")
    description: Optional[str] = Field(None, description="Equipment description")
    lesson_id: Optional[str] = Field(None, description="Lesson ID this equipment is for")
    section_id: Optional[str] = Field(None, description="Section ID this equipment is for")
    module_id: Optional[str] = Field(None, description="Module ID this equipment is for")
    equipment_type: EquipmentTypeEnum = Field(..., description="Type of equipment")
    is_mandatory: bool = Field(default=True, description="Whether this equipment is mandatory")
    quantity_needed: int = Field(default=1, ge=1, description="Quantity needed per student/group")
    specifications: Optional[str] = Field(None, description="Technical specifications")
    brand_preference: Optional[str] = Field(None, max_length=100, description="Preferred brand or model")
    estimated_cost: Optional[float] = Field(None, ge=0, description="Estimated cost per unit")
    supplier_info: Optional[str] = Field(None, description="Supplier information")
    maintenance_notes: Optional[str] = Field(None, description="Maintenance requirements")
    safety_notes: Optional[str] = Field(None, description="Safety considerations")
    storage_requirements: Optional[str] = Field(None, description="Storage requirements")
    
    @validator('estimated_cost')
    def validate_estimated_cost(cls, v):
        """Validate estimated cost is reasonable."""
        if v is not None and v < 0:
            raise ValueError('Estimated cost cannot be negative')
        if v is not None and v > 100000:  # $100k seems unreasonable for a single piece of equipment
            raise ValueError('Estimated cost cannot exceed $100,000')
        return v
    
    @validator('quantity_needed')
    def validate_quantity_needed(cls, v):
        """Validate quantity is reasonable."""
        if v < 1:
            raise ValueError('Quantity needed must be at least 1')
        if v > 1000:  # More than 1000 seems unreasonable
            raise ValueError('Quantity needed cannot exceed 1000')
        return v


class EquipmentRequirementCreate(EquipmentRequirementBase):
    """Schema for creating a new equipment requirement."""
    
    # All required fields are defined in EquipmentRequirementBase
    pass


class EquipmentRequirementUpdate(BaseModel):
    """Schema for updating equipment requirement information."""
    
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None)
    lesson_id: Optional[str] = Field(None)
    section_id: Optional[str] = Field(None)
    module_id: Optional[str] = Field(None)
    equipment_type: Optional[EquipmentTypeEnum] = Field(None)
    is_mandatory: Optional[bool] = Field(None)
    quantity_needed: Optional[int] = Field(None, ge=1)
    specifications: Optional[str] = Field(None)
    brand_preference: Optional[str] = Field(None, max_length=100)
    estimated_cost: Optional[float] = Field(None, ge=0)
    supplier_info: Optional[str] = Field(None)
    maintenance_notes: Optional[str] = Field(None)
    safety_notes: Optional[str] = Field(None)
    storage_requirements: Optional[str] = Field(None)
    
    @validator('estimated_cost')
    def validate_estimated_cost(cls, v):
        """Validate estimated cost is reasonable."""
        if v is not None and v < 0:
            raise ValueError('Estimated cost cannot be negative')
        if v is not None and v > 100000:
            raise ValueError('Estimated cost cannot exceed $100,000')
        return v
    
    @validator('quantity_needed')
    def validate_quantity_needed(cls, v):
        """Validate quantity is reasonable."""
        if v is not None and v < 1:
            raise ValueError('Quantity needed must be at least 1')
        if v is not None and v > 1000:
            raise ValueError('Quantity needed cannot exceed 1000')
        return v


class EquipmentRequirementResponse(EquipmentRequirementBase, TimestampMixin):
    """Schema for equipment requirement response."""
    
    id: str = Field(..., description="Equipment requirement ID (UUID)")
    
    # Related entity information
    lesson_title: Optional[str] = Field(None, description="Lesson title")
    section_name: Optional[str] = Field(None, description="Section name")
    module_name: Optional[str] = Field(None, description="Module name")
    level_name: Optional[str] = Field(None, description="Level name")
    curriculum_name: Optional[str] = Field(None, description="Curriculum name")
    course_name: Optional[str] = Field(None, description="Course name")
    program_name: Optional[str] = Field(None, description="Program name")
    program_code: Optional[str] = Field(None, description="Program code")
    
    # Additional response fields
    usage_count: Optional[int] = Field(None, description="Number of lessons/sections using this equipment")
    availability_status: Optional[str] = Field(None, description="Current availability status")
    last_maintenance: Optional[datetime] = Field(None, description="Last maintenance date")
    next_maintenance: Optional[datetime] = Field(None, description="Next scheduled maintenance")
    
    # Audit information
    created_by: Optional[str] = Field(None, description="Created by user ID")
    updated_by: Optional[str] = Field(None, description="Updated by user ID")
    
    class Config:
        from_attributes = True
        schema_extra = {
            "example": {
                "id": "equipment-id-1",
                "name": "Basic Robot Building Kit",
                "description": "Complete kit for building simple robots with sensors and motors",
                "lesson_id": "lesson-id-1",
                "lesson_title": "What is a Robot?",
                "section_name": "Robot Components Overview",
                "module_name": "Introduction to Robotics",
                "level_name": "Getting Started",
                "curriculum_name": "Basic Robot Building",
                "course_name": "Introduction to Robotics",
                "program_name": "Robotics Engineering",
                "program_code": "ROBOT-ENG",
                "equipment_type": "technology",
                "is_mandatory": True,
                "quantity_needed": 1,
                "specifications": "Arduino-compatible microcontroller, 2 servo motors, ultrasonic sensor, LED strips",
                "brand_preference": "LEGO Mindstorms or VEX Robotics",
                "estimated_cost": 125.99,
                "supplier_info": "Educational robotics suppliers",
                "maintenance_notes": "Check battery connections monthly, clean sensors after each use",
                "safety_notes": "Supervise students when connecting batteries, avoid short circuits",
                "storage_requirements": "Dry environment, organized component storage",
                "usage_count": 8,
                "availability_status": "Available",
                "last_maintenance": "2025-01-01T00:00:00Z",
                "next_maintenance": "2025-03-01T00:00:00Z",
                "created_at": "2025-01-08T12:00:00Z",
                "updated_at": "2025-01-08T12:00:00Z",
                "created_by": "admin-user-id",
                "updated_by": "admin-user-id"
            }
        }


class EquipmentRequirementListResponse(PaginatedResponse):
    """Schema for paginated equipment requirement list response."""
    
    items: List[EquipmentRequirementResponse] = Field(..., description="List of equipment requirements")


class EquipmentSearchParams(BaseModel):
    """Parameters for equipment search and filtering."""
    
    search: Optional[str] = Field(None, min_length=1, max_length=255, description="Search query")
    lesson_id: Optional[str] = Field(None, description="Filter by lesson ID")
    section_id: Optional[str] = Field(None, description="Filter by section ID")
    module_id: Optional[str] = Field(None, description="Filter by module ID")
    level_id: Optional[str] = Field(None, description="Filter by level ID")
    curriculum_id: Optional[str] = Field(None, description="Filter by curriculum ID")
    course_id: Optional[str] = Field(None, description="Filter by course ID")
    program_id: Optional[str] = Field(None, description="Filter by program ID")
    equipment_type: Optional[EquipmentTypeEnum] = Field(None, description="Filter by equipment type")
    is_mandatory: Optional[bool] = Field(None, description="Filter by mandatory status")
    cost_min: Optional[float] = Field(None, ge=0, description="Minimum cost filter")
    cost_max: Optional[float] = Field(None, ge=0, description="Maximum cost filter")
    quantity_min: Optional[int] = Field(None, ge=1, description="Minimum quantity filter")
    quantity_max: Optional[int] = Field(None, ge=1, description="Maximum quantity filter")
    brand_preference: Optional[str] = Field(None, description="Filter by brand preference")
    availability_status: Optional[str] = Field(None, description="Filter by availability status")
    sort_by: Optional[str] = Field("name", description="Sort field")
    sort_order: Optional[str] = Field("asc", pattern="^(asc|desc)$", description="Sort order")


class EquipmentStatsResponse(BaseModel):
    """Schema for equipment statistics response."""
    
    total_equipment: int = Field(..., description="Total number of equipment requirements")
    equipment_by_type: Dict[str, int] = Field(..., description="Equipment grouped by type")
    equipment_by_curriculum: Dict[str, int] = Field(..., description="Equipment grouped by curriculum")
    equipment_by_program: Dict[str, int] = Field(..., description="Equipment grouped by program")
    mandatory_equipment_count: int = Field(..., description="Number of mandatory equipment items")
    optional_equipment_count: int = Field(..., description="Number of optional equipment items")
    total_estimated_cost: float = Field(..., description="Total estimated cost of all equipment")
    average_cost_per_item: float = Field(..., description="Average cost per equipment item")
    equipment_by_brand: Dict[str, int] = Field(..., description="Equipment grouped by brand preference")
    maintenance_due_count: int = Field(..., description="Number of items due for maintenance")


class EquipmentInventoryResponse(BaseModel):
    """Schema for equipment inventory information."""
    
    equipment_id: str = Field(..., description="Equipment requirement ID")
    equipment_name: str = Field(..., description="Equipment name")
    equipment_type: EquipmentTypeEnum = Field(..., description="Equipment type")
    total_needed: int = Field(..., description="Total quantity needed across all curricula")
    currently_available: int = Field(..., description="Currently available quantity")
    on_order: int = Field(..., description="Quantity on order")
    out_of_service: int = Field(..., description="Quantity out of service")
    estimated_total_cost: float = Field(..., description="Estimated total cost for all needed items")
    utilization_rate: float = Field(..., description="Utilization rate percentage")
    next_order_date: Optional[datetime] = Field(None, description="Next scheduled order date")


class EquipmentBulkUpdateRequest(BaseModel):
    """Schema for bulk equipment updates."""
    
    equipment_ids: List[str] = Field(..., min_items=1, description="List of equipment IDs")
    updates: Dict[str, Any] = Field(..., description="Fields to update")
    
    @validator('updates')
    def validate_updates(cls, v):
        """Validate update fields."""
        allowed_fields = {
            'is_mandatory', 'equipment_type', 'estimated_cost', 
            'supplier_info', 'maintenance_notes', 'safety_notes',
            'storage_requirements', 'availability_status'
        }
        for field in v.keys():
            if field not in allowed_fields:
                raise ValueError(f'Field {field} is not allowed for bulk updates')
        return v


class EquipmentMaintenanceRequest(BaseModel):
    """Schema for equipment maintenance scheduling."""
    
    equipment_ids: List[str] = Field(..., min_items=1, description="List of equipment IDs")
    maintenance_type: str = Field(..., description="Type of maintenance")
    scheduled_date: datetime = Field(..., description="Scheduled maintenance date")
    maintenance_notes: Optional[str] = Field(None, description="Maintenance notes")
    estimated_duration_hours: Optional[float] = Field(None, ge=0, description="Estimated duration")


class EquipmentUsageResponse(BaseModel):
    """Schema for equipment usage response."""
    
    equipment_name: str = Field(..., description="Equipment name")
    total_uses: int = Field(..., description="Total number of uses")
    lessons_using: List[Dict[str, Any]] = Field(..., description="Lessons using this equipment")
    sections_using: List[Dict[str, Any]] = Field(..., description="Sections using this equipment")
    modules_using: List[Dict[str, Any]] = Field(..., description="Modules using this equipment")
    usage_frequency: str = Field(..., description="Usage frequency (high/medium/low)")
    last_updated: datetime = Field(..., description="Last updated timestamp")


class EquipmentSearchParams(BaseModel):
    """Schema for equipment search parameters."""
    
    search: Optional[str] = Field(None, description="Search query")
    lesson_id: Optional[str] = Field(None, description="Filter by lesson ID")
    section_id: Optional[str] = Field(None, description="Filter by section ID")
    module_id: Optional[str] = Field(None, description="Filter by module ID")
    level_id: Optional[str] = Field(None, description="Filter by level ID")
    curriculum_id: Optional[str] = Field(None, description="Filter by curriculum ID")
    course_id: Optional[str] = Field(None, description="Filter by course ID")
    program_id: Optional[str] = Field(None, description="Filter by program ID")
    equipment_type: Optional[str] = Field(None, description="Filter by equipment type")
    is_required: Optional[bool] = Field(None, description="Filter by required status")
    is_consumable: Optional[bool] = Field(None, description="Filter by consumable status")
    quantity_min: Optional[int] = Field(None, ge=1, description="Minimum quantity")
    quantity_max: Optional[int] = Field(None, ge=1, description="Maximum quantity")
    sort_by: Optional[str] = Field("equipment_name", description="Sort field")
    sort_order: Optional[str] = Field("asc", pattern="^(asc|desc)$", description="Sort order")
    maintenance_cost: Optional[float] = Field(None, ge=0, description="Estimated maintenance cost")


class EquipmentMaintenanceResponse(BaseModel):
    """Schema for equipment maintenance record."""
    
    id: str = Field(..., description="Maintenance record ID")
    equipment_id: str = Field(..., description="Equipment ID")
    equipment_name: str = Field(..., description="Equipment name")
    maintenance_type: str = Field(..., description="Type of maintenance")
    scheduled_date: datetime = Field(..., description="Scheduled date")
    completed_date: Optional[datetime] = Field(None, description="Completed date")
    maintenance_notes: Optional[str] = Field(None, description="Maintenance notes")
    duration_hours: Optional[float] = Field(None, description="Actual duration")
    actual_cost: Optional[float] = Field(None, description="Actual maintenance cost")
    performed_by: Optional[str] = Field(None, description="Maintenance performed by")
    status: str = Field(..., description="Maintenance status")
    
    class Config:
        from_attributes = True


class EquipmentInventorySummary(BaseModel):
    """Schema for equipment inventory summary."""
    
    equipment_id: str = Field(..., description="Equipment ID")
    equipment_name: str = Field(..., description="Equipment name")
    total_needed: int = Field(..., description="Total quantity needed")
    available: int = Field(..., description="Available quantity")
    on_order: int = Field(..., description="Quantity on order")
    maintenance: int = Field(..., description="Quantity in maintenance")
    shortage: int = Field(..., description="Shortage quantity")
    
    class Config:
        from_attributes = True


class LessonEquipmentSummary(BaseModel):
    """Schema for lesson equipment summary."""
    
    lesson_id: str = Field(..., description="Lesson ID")
    lesson_name: str = Field(..., description="Lesson name")
    total_equipment: int = Field(..., description="Total equipment count")
    mandatory_equipment: int = Field(..., description="Mandatory equipment count")
    optional_equipment: int = Field(..., description="Optional equipment count")
    total_cost: float = Field(..., description="Total estimated cost")
    
    class Config:
        from_attributes = True


class EquipmentOrderRequest(BaseModel):
    """Schema for equipment ordering."""
    
    equipment_requirements: List[Dict[str, Any]] = Field(..., min_items=1, description="Equipment to order")
    supplier: str = Field(..., description="Supplier information")
    priority: str = Field(default="normal", description="Order priority")
    budget_approved: bool = Field(default=False, description="Whether budget is approved")
    delivery_address: Optional[str] = Field(None, description="Delivery address")
    special_instructions: Optional[str] = Field(None, description="Special delivery instructions")
    
    @validator('equipment_requirements')
    def validate_equipment_requirements(cls, v):
        """Validate equipment requirements."""
        for requirement in v:
            if 'equipment_id' not in requirement:
                raise ValueError('Each equipment requirement must have equipment_id')
            if 'quantity' not in requirement:
                raise ValueError('Each equipment requirement must have quantity')
            if not isinstance(requirement['quantity'], int) or requirement['quantity'] < 1:
                raise ValueError('Quantity must be a positive integer')
        return v