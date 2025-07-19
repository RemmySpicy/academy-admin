#!/usr/bin/env python3
"""
Academy Admin - Service Template Generator
Generates complete service implementations with program context filtering
"""

import os
import sys
import argparse
from pathlib import Path
from datetime import datetime


class ServiceTemplateGenerator:
    """Generates backend service templates with program context filtering."""
    
    def __init__(self, feature_name: str, base_path: str = "backend/app/features"):
        self.feature_name = feature_name
        self.feature_snake = feature_name.lower().replace(' ', '_').replace('-', '_')
        self.feature_pascal = ''.join(word.capitalize() for word in self.feature_snake.split('_'))
        self.base_path = Path(base_path)
        self.feature_path = self.base_path / self.feature_snake
        
    def generate_all(self):
        """Generate complete service structure."""
        print(f"🔧 Generating service templates for '{self.feature_name}'...")
        
        # Create directory structure
        self.create_directory_structure()
        
        # Generate files
        self.generate_model()
        self.generate_schema()
        self.generate_service()
        self.generate_routes()
        self.generate_init_files()
        
        print(f"✅ Generated complete service structure at: {self.feature_path}")
        print("\n📋 Next steps:")
        print("1. Review generated files for business logic customization")
        print("2. Add specific field validations in schemas")
        print("3. Implement custom business methods in service")
        print("4. Add routes to main API router")
        print("5. Run quality checks: npm run quality:academy")
        
    def create_directory_structure(self):
        """Create the directory structure for the feature."""
        directories = [
            self.feature_path,
            self.feature_path / "models",
            self.feature_path / "schemas", 
            self.feature_path / "services",
            self.feature_path / "routes",
        ]
        
        for directory in directories:
            directory.mkdir(parents=True, exist_ok=True)
            
    def generate_model(self):
        """Generate SQLAlchemy model with program context."""
        model_content = f'''"""
{self.feature_pascal} model with program context filtering support.
"""

from datetime import datetime
from typing import Optional
from sqlalchemy import String, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.core.database import Base


class {self.feature_pascal}(Base):
    """
    {self.feature_pascal} model with program context filtering.
    
    ⚠️  CRITICAL: This model includes program_id for program context filtering.
    All operations must filter by program context for security.
    """
    
    __tablename__ = "{self.feature_snake}"
    
    # Primary key
    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        comment="Unique identifier for the {self.feature_snake}"
    )
    
    # 🔒 PROGRAM CONTEXT FILTERING - MANDATORY
    program_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("programs.id"),
        nullable=False,
        index=True,
        comment="Program this {self.feature_snake} belongs to - REQUIRED for security"
    )
    
    # Core fields (customize as needed)
    name: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
        comment="{self.feature_pascal} name"
    )
    
    description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="{self.feature_pascal} description"
    )
    
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
        comment="Whether this {self.feature_snake} is active"
    )
    
    # Audit fields
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        comment="When this {self.feature_snake} was created"
    )
    
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
        comment="When this {self.feature_snake} was last updated"
    )
    
    created_by: Mapped[Optional[str]] = mapped_column(
        String(36),
        nullable=True,
        comment="User who created this {self.feature_snake}"
    )
    
    updated_by: Mapped[Optional[str]] = mapped_column(
        String(36),
        nullable=True,
        comment="User who last updated this {self.feature_snake}"
    )
    
    # 🔗 RELATIONSHIPS
    # Program relationship (for program context filtering)
    program: Mapped["Program"] = relationship(
        "Program",
        back_populates="{self.feature_snake}",
        lazy="select"
    )
    
    # Add more relationships as needed
    # Example:
    # items: Mapped[List["RelatedItem"]] = relationship(
    #     "RelatedItem",
    #     back_populates="{self.feature_snake}",
    #     cascade="all, delete-orphan"
    # )
    
    def __repr__(self) -> str:
        return f"<{self.feature_pascal}(id='{self.id}', name='{self.name}', program_id='{self.program_id}')>"
        
    def __str__(self) -> str:
        return f"{{self.name}} ({{self.program_id}})"
'''
        
        model_file = self.feature_path / "models" / f"{self.feature_snake}.py"
        with open(model_file, 'w') as f:
            f.write(model_content)
            
    def generate_schema(self):
        """Generate Pydantic schemas with program context."""
        schema_content = f'''"""
{self.feature_pascal} schemas with program context support.
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, validator


class {self.feature_pascal}Base(BaseModel):
    """Base {self.feature_snake} schema with common fields."""
    
    name: str = Field(..., min_length=1, max_length=200, description="{self.feature_pascal} name")
    description: Optional[str] = Field(None, description="{self.feature_pascal} description")
    is_active: bool = Field(default=True, description="Whether this {self.feature_snake} is active")
    
    @validator('name')
    def validate_name(cls, v):
        """Validate name field."""
        if not v or not v.strip():
            raise ValueError('Name cannot be empty')
        return v.strip()


class {self.feature_pascal}Create(BaseModel):
    """Schema for creating a new {self.feature_snake}."""
    
    # 🔒 PROGRAM CONTEXT - MANDATORY for security
    program_id: str = Field(..., description="Program ID this {self.feature_snake} belongs to")
    
    # Core fields
    name: str = Field(..., min_length=1, max_length=200, description="{self.feature_pascal} name")
    description: Optional[str] = Field(None, description="{self.feature_pascal} description")
    is_active: bool = Field(default=True, description="Whether this {self.feature_snake} is active")
    
    # Add custom fields as needed
    # Example:
    # category: str = Field(..., description="Category of the {self.feature_snake}")
    # priority: int = Field(default=1, ge=1, le=5, description="Priority level")
    
    @validator('name')
    def validate_name(cls, v):
        """Validate name field."""
        if not v or not v.strip():
            raise ValueError('Name cannot be empty')
        return v.strip()
        
    @validator('program_id')
    def validate_program_id(cls, v):
        """Validate program_id field."""
        if not v or not v.strip():
            raise ValueError('Program ID is required')
        return v.strip()


class {self.feature_pascal}Update(BaseModel):
    """Schema for updating {self.feature_snake} information."""
    
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None)
    is_active: Optional[bool] = Field(None)
    
    # Add custom fields as needed
    # Example:
    # category: Optional[str] = Field(None)
    # priority: Optional[int] = Field(None, ge=1, le=5)
    
    @validator('name')
    def validate_name(cls, v):
        """Validate name field."""
        if v is not None and (not v or not v.strip()):
            raise ValueError('Name cannot be empty')
        return v.strip() if v else v


class {self.feature_pascal}Response(BaseModel):
    """Schema for {self.feature_snake} response."""
    
    id: str = Field(..., description="{self.feature_pascal} ID")
    
    # 🔒 PROGRAM CONTEXT - Always included for reference
    program_id: str = Field(..., description="Program this {self.feature_snake} belongs to")
    program_name: Optional[str] = Field(None, description="Program name")
    program_code: Optional[str] = Field(None, description="Program code")
    
    # Core fields
    name: str = Field(..., description="{self.feature_pascal} name")
    description: Optional[str] = Field(None, description="{self.feature_pascal} description")
    is_active: bool = Field(..., description="Whether this {self.feature_snake} is active")
    
    # Add custom fields as needed
    # Example:
    # category: str = Field(..., description="Category")
    # priority: int = Field(..., description="Priority level")
    
    # Audit fields
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    created_by: Optional[str] = Field(None, description="Created by user ID")
    updated_by: Optional[str] = Field(None, description="Updated by user ID")
    
    class Config:
        from_attributes = True
        json_encoders = {{
            datetime: lambda v: v.isoformat()
        }}


class {self.feature_pascal}ListResponse(BaseModel):
    """Schema for paginated {self.feature_snake} list response."""
    
    items: List[{self.feature_pascal}Response] = Field(..., description="List of {self.feature_snake}")
    total: int = Field(..., description="Total number of items")
    page: int = Field(..., description="Current page number")
    per_page: int = Field(..., description="Items per page")
    pages: int = Field(..., description="Total number of pages")
    has_next: bool = Field(..., description="Whether there are more pages")
    has_prev: bool = Field(..., description="Whether there are previous pages")


class {self.feature_pascal}SearchParams(BaseModel):
    """Parameters for {self.feature_snake} search and filtering."""
    
    # 🔒 PROGRAM CONTEXT - For filtering (optional, auto-injected by middleware)
    program_id: Optional[str] = Field(None, description="Filter by program ID")
    
    # Search and filter params
    search: Optional[str] = Field(None, min_length=1, max_length=255, description="Search query")
    is_active: Optional[bool] = Field(None, description="Filter by active status")
    
    # Add custom search fields as needed
    # Example:
    # category: Optional[str] = Field(None, description="Filter by category")
    # priority_min: Optional[int] = Field(None, ge=1, le=5, description="Minimum priority")
    
    # Pagination
    page: int = Field(default=1, ge=1, description="Page number")
    per_page: int = Field(default=20, ge=1, le=100, description="Items per page")
    
    # Sorting
    sort_by: str = Field(default="name", description="Sort field")
    sort_order: str = Field(default="asc", regex="^(asc|desc)$", description="Sort order")


class {self.feature_pascal}Stats(BaseModel):
    """Schema for {self.feature_snake} statistics."""
    
    total_{self.feature_snake}: int = Field(..., description="Total number of {self.feature_snake}")
    active_{self.feature_snake}: int = Field(..., description="Number of active {self.feature_snake}")
    inactive_{self.feature_snake}: int = Field(..., description="Number of inactive {self.feature_snake}")
    
    # Add custom stats as needed
    # Example:
    # by_category: Dict[str, int] = Field(..., description="Count by category")
    # by_priority: Dict[str, int] = Field(..., description="Count by priority")
    
    # Program context stats
    by_program: Dict[str, int] = Field(..., description="Count by program")
    
    # Time-based stats
    created_today: int = Field(..., description="Created today")
    created_this_week: int = Field(..., description="Created this week")
    created_this_month: int = Field(..., description="Created this month")


class {self.feature_pascal}BulkUpdateRequest(BaseModel):
    """Schema for bulk {self.feature_snake} updates."""
    
    {self.feature_snake}_ids: List[str] = Field(..., min_items=1, description="List of {self.feature_snake} IDs")
    updates: Dict[str, Any] = Field(..., description="Fields to update")
    
    @validator('updates')
    def validate_updates(cls, v):
        """Validate update fields."""
        allowed_fields = {{
            'name', 'description', 'is_active'
            # Add more allowed fields as needed
        }}
        for field in v.keys():
            if field not in allowed_fields:
                raise ValueError(f'Field {{field}} is not allowed for bulk updates')
        return v
'''
        
        schema_file = self.feature_path / "schemas" / f"{self.feature_snake}.py"
        with open(schema_file, 'w') as f:
            f.write(schema_content)
            
    def generate_service(self):
        """Generate service with program context filtering."""
        service_content = f'''"""
{self.feature_pascal} service with program context filtering.
"""

from typing import List, Optional, Dict, Any
from sqlalchemy import and_, or_, func
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.features.{self.feature_snake}.models.{self.feature_snake} import {self.feature_pascal}
from app.features.{self.feature_snake}.schemas.{self.feature_snake} import (
    {self.feature_pascal}Create,
    {self.feature_pascal}Update,
    {self.feature_pascal}Response,
    {self.feature_pascal}SearchParams,
    {self.feature_pascal}Stats,
    {self.feature_pascal}ListResponse,
)
from app.features.programs.models.program import Program


class {self.feature_pascal}Service:
    """
    {self.feature_pascal} service with program context filtering.
    
    ⚠️  CRITICAL: All methods must use program_context parameter for security.
    This ensures data isolation between programs.
    """
    
    def __init__(self, db: Session):
        self.db = db
        
    def create_{self.feature_snake}(
        self,
        {self.feature_snake}_data: {self.feature_pascal}Create,
        program_context: Optional[str] = None,
        current_user_id: Optional[str] = None
    ) -> {self.feature_pascal}Response:
        """
        Create a new {self.feature_snake} with program context filtering.
        
        Args:
            {self.feature_snake}_data: {self.feature_pascal} creation data
            program_context: Program context for filtering (REQUIRED for security)
            current_user_id: ID of the user creating the {self.feature_snake}
            
        Returns:
            {self.feature_pascal}Response: Created {self.feature_snake} data
            
        Raises:
            ValueError: If program_context is required but not provided
            PermissionError: If user doesn't have access to the program
        """
        # 🔒 PROGRAM CONTEXT VALIDATION
        if program_context and {self.feature_snake}_data.program_id != program_context:
            raise PermissionError(f"Cannot create {self.feature_snake} for program {{{self.feature_snake}_data.program_id}} with context {{program_context}}")
        
        # Create new {self.feature_snake}
        db_{self.feature_snake} = {self.feature_pascal}(
            **{self.feature_snake}_data.dict(),
            created_by=current_user_id,
            updated_by=current_user_id
        )
        
        self.db.add(db_{self.feature_snake})
        self.db.commit()
        self.db.refresh(db_{self.feature_snake})
        
        # Return with program info
        return self._to_response(db_{self.feature_snake})
        
    def get_{self.feature_snake}(
        self,
        {self.feature_snake}_id: str,
        program_context: Optional[str] = None
    ) -> Optional[{self.feature_pascal}Response]:
        """
        Get a {self.feature_snake} by ID with program context filtering.
        
        Args:
            {self.feature_snake}_id: {self.feature_pascal} ID
            program_context: Program context for filtering (REQUIRED for security)
            
        Returns:
            Optional[{self.feature_pascal}Response]: {self.feature_pascal} data if found and accessible
        """
        query = self.db.query({self.feature_pascal}).options(
            joinedload({self.feature_pascal}.program)
        ).filter({self.feature_pascal}.id == {self.feature_snake}_id)
        
        # 🔒 PROGRAM CONTEXT FILTERING
        if program_context:
            query = query.filter({self.feature_pascal}.program_id == program_context)
            
        db_{self.feature_snake} = query.first()
        
        if not db_{self.feature_snake}:
            return None
            
        return self._to_response(db_{self.feature_snake})
        
    def update_{self.feature_snake}(
        self,
        {self.feature_snake}_id: str,
        {self.feature_snake}_data: {self.feature_pascal}Update,
        program_context: Optional[str] = None,
        current_user_id: Optional[str] = None
    ) -> Optional[{self.feature_pascal}Response]:
        """
        Update a {self.feature_snake} with program context filtering.
        
        Args:
            {self.feature_snake}_id: {self.feature_pascal} ID
            {self.feature_snake}_data: {self.feature_pascal} update data
            program_context: Program context for filtering (REQUIRED for security)
            current_user_id: ID of the user updating the {self.feature_snake}
            
        Returns:
            Optional[{self.feature_pascal}Response]: Updated {self.feature_snake} data if found and accessible
        """
        query = self.db.query({self.feature_pascal}).filter({self.feature_pascal}.id == {self.feature_snake}_id)
        
        # 🔒 PROGRAM CONTEXT FILTERING
        if program_context:
            query = query.filter({self.feature_pascal}.program_id == program_context)
            
        db_{self.feature_snake} = query.first()
        
        if not db_{self.feature_snake}:
            return None
            
        # Update fields
        update_data = {self.feature_snake}_data.dict(exclude_unset=True)
        if current_user_id:
            update_data['updated_by'] = current_user_id
            
        for field, value in update_data.items():
            setattr(db_{self.feature_snake}, field, value)
            
        self.db.commit()
        self.db.refresh(db_{self.feature_snake})
        
        return self._to_response(db_{self.feature_snake})
        
    def delete_{self.feature_snake}(
        self,
        {self.feature_snake}_id: str,
        program_context: Optional[str] = None
    ) -> bool:
        """
        Delete a {self.feature_snake} with program context filtering.
        
        Args:
            {self.feature_snake}_id: {self.feature_pascal} ID
            program_context: Program context for filtering (REQUIRED for security)
            
        Returns:
            bool: True if deleted, False if not found
        """
        query = self.db.query({self.feature_pascal}).filter({self.feature_pascal}.id == {self.feature_snake}_id)
        
        # 🔒 PROGRAM CONTEXT FILTERING
        if program_context:
            query = query.filter({self.feature_pascal}.program_id == program_context)
            
        db_{self.feature_snake} = query.first()
        
        if not db_{self.feature_snake}:
            return False
            
        self.db.delete(db_{self.feature_snake})
        self.db.commit()
        
        return True
        
    def list_{self.feature_snake}(
        self,
        params: {self.feature_pascal}SearchParams,
        program_context: Optional[str] = None
    ) -> {self.feature_pascal}ListResponse:
        """
        List {self.feature_snake} with search, filtering, and program context.
        
        Args:
            params: Search and filter parameters
            program_context: Program context for filtering (REQUIRED for security)
            
        Returns:
            {self.feature_pascal}ListResponse: Paginated {self.feature_snake} list
        """
        query = self.db.query({self.feature_pascal}).options(
            joinedload({self.feature_pascal}.program)
        )
        
        # 🔒 PROGRAM CONTEXT FILTERING
        if program_context:
            query = query.filter({self.feature_pascal}.program_id == program_context)
        elif params.program_id:
            query = query.filter({self.feature_pascal}.program_id == params.program_id)
        
        # Apply search
        if params.search:
            search_filter = or_(
                {self.feature_pascal}.name.ilike(f"%{{params.search}}%"),
                {self.feature_pascal}.description.ilike(f"%{{params.search}}%")
            )
            query = query.filter(search_filter)
            
        # Apply filters
        if params.is_active is not None:
            query = query.filter({self.feature_pascal}.is_active == params.is_active)
            
        # Add custom filters as needed
        # Example:
        # if params.category:
        #     query = query.filter({self.feature_pascal}.category == params.category)
        
        # Apply sorting
        if params.sort_by == "name":
            sort_column = {self.feature_pascal}.name
        elif params.sort_by == "created_at":
            sort_column = {self.feature_pascal}.created_at
        else:
            sort_column = {self.feature_pascal}.name
            
        if params.sort_order == "desc":
            query = query.order_by(sort_column.desc())
        else:
            query = query.order_by(sort_column.asc())
            
        # Get total count
        total = query.count()
        
        # Apply pagination
        offset = (params.page - 1) * params.per_page
        {self.feature_snake}_list = query.offset(offset).limit(params.per_page).all()
        
        # Calculate pagination info
        pages = (total + params.per_page - 1) // params.per_page
        has_next = params.page < pages
        has_prev = params.page > 1
        
        # Convert to response format
        items = [self._to_response(item) for item in {self.feature_snake}_list]
        
        return {self.feature_pascal}ListResponse(
            items=items,
            total=total,
            page=params.page,
            per_page=params.per_page,
            pages=pages,
            has_next=has_next,
            has_prev=has_prev
        )
        
    def get_{self.feature_snake}_stats(
        self,
        program_context: Optional[str] = None
    ) -> {self.feature_pascal}Stats:
        """
        Get {self.feature_snake} statistics with program context filtering.
        
        Args:
            program_context: Program context for filtering (REQUIRED for security)
            
        Returns:
            {self.feature_pascal}Stats: {self.feature_pascal} statistics
        """
        query = self.db.query({self.feature_pascal})
        
        # 🔒 PROGRAM CONTEXT FILTERING
        if program_context:
            query = query.filter({self.feature_pascal}.program_id == program_context)
            
        # Basic counts
        total = query.count()
        active = query.filter({self.feature_pascal}.is_active == True).count()
        inactive = total - active
        
        # Program-based stats
        program_stats = dict(
            self.db.query(
                Program.name,
                func.count({self.feature_pascal}.id)
            )
            .join({self.feature_pascal}, Program.id == {self.feature_pascal}.program_id)
            .group_by(Program.name)
            .all()
        )
        
        if program_context:
            program_stats = {{k: v for k, v in program_stats.items() if k in [program_context]}}
            
        # Time-based stats
        from datetime import datetime, timedelta
        today = datetime.now().date()
        week_ago = today - timedelta(days=7)
        month_ago = today - timedelta(days=30)
        
        base_query = query if program_context else self.db.query({self.feature_pascal})
        
        created_today = base_query.filter(
            func.date({self.feature_pascal}.created_at) == today
        ).count()
        
        created_this_week = base_query.filter(
            func.date({self.feature_pascal}.created_at) >= week_ago
        ).count()
        
        created_this_month = base_query.filter(
            func.date({self.feature_pascal}.created_at) >= month_ago
        ).count()
        
        return {self.feature_pascal}Stats(
            total_{self.feature_snake}=total,
            active_{self.feature_snake}=active,
            inactive_{self.feature_snake}=inactive,
            by_program=program_stats,
            created_today=created_today,
            created_this_week=created_this_week,
            created_this_month=created_this_month
        )
        
    def bulk_update_{self.feature_snake}(
        self,
        {self.feature_snake}_ids: List[str],
        updates: Dict[str, Any],
        program_context: Optional[str] = None,
        current_user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Bulk update {self.feature_snake} with program context filtering.
        
        Args:
            {self.feature_snake}_ids: List of {self.feature_snake} IDs
            updates: Fields to update
            program_context: Program context for filtering (REQUIRED for security)
            current_user_id: ID of the user performing the update
            
        Returns:
            Dict[str, Any]: Results of the bulk update
        """
        query = self.db.query({self.feature_pascal}).filter({self.feature_pascal}.id.in_({self.feature_snake}_ids))
        
        # 🔒 PROGRAM CONTEXT FILTERING
        if program_context:
            query = query.filter({self.feature_pascal}.program_id == program_context)
            
        {self.feature_snake}_list = query.all()
        found_ids = [item.id for item in {self.feature_snake}_list]
        
        # Update each {self.feature_snake}
        if current_user_id:
            updates['updated_by'] = current_user_id
            
        for {self.feature_snake} in {self.feature_snake}_list:
            for field, value in updates.items():
                if hasattr({self.feature_snake}, field):
                    setattr({self.feature_snake}, field, value)
                    
        self.db.commit()
        
        return {{
            'updated_count': len(found_ids),
            'updated_ids': found_ids,
            'not_found_ids': [id for id in {self.feature_snake}_ids if id not in found_ids],
            'total_requested': len({self.feature_snake}_ids)
        }}
        
    def _to_response(self, db_{self.feature_snake}: {self.feature_pascal}) -> {self.feature_pascal}Response:
        """Convert database model to response schema."""
        return {self.feature_pascal}Response(
            id=db_{self.feature_snake}.id,
            program_id=db_{self.feature_snake}.program_id,
            program_name=db_{self.feature_snake}.program.name if db_{self.feature_snake}.program else None,
            program_code=db_{self.feature_snake}.program.code if db_{self.feature_snake}.program else None,
            name=db_{self.feature_snake}.name,
            description=db_{self.feature_snake}.description,
            is_active=db_{self.feature_snake}.is_active,
            created_at=db_{self.feature_snake}.created_at,
            updated_at=db_{self.feature_snake}.updated_at,
            created_by=db_{self.feature_snake}.created_by,
            updated_by=db_{self.feature_snake}.updated_by
        )


# Service factory function
def get_{self.feature_snake}_service(db: Session = None) -> {self.feature_pascal}Service:
    """Get {self.feature_snake} service instance."""
    if db is None:
        db = next(get_db())
    return {self.feature_pascal}Service(db)
'''
        
        service_file = self.feature_path / "services" / f"{self.feature_snake}_service.py"
        with open(service_file, 'w') as f:
            f.write(service_content)
            
    def generate_routes(self):
        """Generate FastAPI routes with program context."""
        routes_content = f'''"""
{self.feature_pascal} routes with program context filtering.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.auth import get_current_active_user
from app.middleware.program_context import create_program_filter_dependency
from app.features.{self.feature_snake}.services.{self.feature_snake}_service import get_{self.feature_snake}_service
from app.features.{self.feature_snake}.schemas.{self.feature_snake} import (
    {self.feature_pascal}Create,
    {self.feature_pascal}Update,
    {self.feature_pascal}Response,
    {self.feature_pascal}SearchParams,
    {self.feature_pascal}Stats,
    {self.feature_pascal}ListResponse,
    {self.feature_pascal}BulkUpdateRequest,
)

router = APIRouter()

# Create program filter dependency
get_program_filter = create_program_filter_dependency()


@router.post("/", response_model={self.feature_pascal}Response, status_code=status.HTTP_201_CREATED)
async def create_{self.feature_snake}(
    {self.feature_snake}_data: {self.feature_pascal}Create,
    program_context: Optional[str] = Depends(get_program_filter),
    current_user: dict = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Create a new {self.feature_snake} with program context filtering.
    
    🔒 PROGRAM CONTEXT: Automatically filtered by program context middleware.
    """
    service = get_{self.feature_snake}_service(db)
    
    try:
        return service.create_{self.feature_snake}(
            {self.feature_snake}_data="{self.feature_snake}_data",
            program_context=program_context,
            current_user_id=current_user.get("user_id")
        )
    except PermissionError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create {self.feature_snake}: {{str(e)}}"
        )


@router.get("/", response_model={self.feature_pascal}ListResponse)
async def list_{self.feature_snake}(
    search: Optional[str] = None,
    is_active: Optional[bool] = None,
    page: int = 1,
    per_page: int = 20,
    sort_by: str = "name",
    sort_order: str = "asc",
    program_context: Optional[str] = Depends(get_program_filter),
    current_user: dict = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    List {self.feature_snake} with search, filtering, and program context.
    
    🔒 PROGRAM CONTEXT: Automatically filtered by program context middleware.
    """
    service = get_{self.feature_snake}_service(db)
    
    params = {self.feature_pascal}SearchParams(
        search=search,
        is_active=is_active,
        page=page,
        per_page=per_page,
        sort_by=sort_by,
        sort_order=sort_order
    )
    
    return service.list_{self.feature_snake}(
        params=params,
        program_context=program_context
    )


@router.get("/stats", response_model={self.feature_pascal}Stats)
async def get_{self.feature_snake}_stats(
    program_context: Optional[str] = Depends(get_program_filter),
    current_user: dict = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get {self.feature_snake} statistics with program context filtering.
    
    🔒 PROGRAM CONTEXT: Automatically filtered by program context middleware.
    """
    service = get_{self.feature_snake}_service(db)
    
    return service.get_{self.feature_snake}_stats(program_context=program_context)


@router.get("/{{id}}", response_model={self.feature_pascal}Response)
async def get_{self.feature_snake}(
    id: str,
    program_context: Optional[str] = Depends(get_program_filter),
    current_user: dict = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get a {self.feature_snake} by ID with program context filtering.
    
    🔒 PROGRAM CONTEXT: Automatically filtered by program context middleware.
    """
    service = get_{self.feature_snake}_service(db)
    
    {self.feature_snake} = service.get_{self.feature_snake}(
        {self.feature_snake}_id=id,
        program_context=program_context
    )
    
    if not {self.feature_snake}:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{self.feature_pascal} not found"
        )
    
    return {self.feature_snake}


@router.put("/{{id}}", response_model={self.feature_pascal}Response)
async def update_{self.feature_snake}(
    id: str,
    {self.feature_snake}_data: {self.feature_pascal}Update,
    program_context: Optional[str] = Depends(get_program_filter),
    current_user: dict = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Update a {self.feature_snake} with program context filtering.
    
    🔒 PROGRAM CONTEXT: Automatically filtered by program context middleware.
    """
    service = get_{self.feature_snake}_service(db)
    
    {self.feature_snake} = service.update_{self.feature_snake}(
        {self.feature_snake}_id=id,
        {self.feature_snake}_data={self.feature_snake}_data,
        program_context=program_context,
        current_user_id=current_user.get("user_id")
    )
    
    if not {self.feature_snake}:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{self.feature_pascal} not found"
        )
    
    return {self.feature_snake}


@router.delete("/{{id}}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_{self.feature_snake}(
    id: str,
    program_context: Optional[str] = Depends(get_program_filter),
    current_user: dict = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Delete a {self.feature_snake} with program context filtering.
    
    🔒 PROGRAM CONTEXT: Automatically filtered by program context middleware.
    """
    service = get_{self.feature_snake}_service(db)
    
    success = service.delete_{self.feature_snake}(
        {self.feature_snake}_id=id,
        program_context=program_context
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{self.feature_pascal} not found"
        )


@router.patch("/bulk-update")
async def bulk_update_{self.feature_snake}(
    bulk_request: {self.feature_pascal}BulkUpdateRequest,
    program_context: Optional[str] = Depends(get_program_filter),
    current_user: dict = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Bulk update {self.feature_snake} with program context filtering.
    
    🔒 PROGRAM CONTEXT: Automatically filtered by program context middleware.
    """
    service = get_{self.feature_snake}_service(db)
    
    result = service.bulk_update_{self.feature_snake}(
        {self.feature_snake}_ids=bulk_request.{self.feature_snake}_ids,
        updates=bulk_request.updates,
        program_context=program_context,
        current_user_id=current_user.get("user_id")
    )
    
    return {{
        "message": f"Bulk update completed",
        "results": result
    }}
'''
        
        routes_file = self.feature_path / "routes" / f"{self.feature_snake}.py"
        with open(routes_file, 'w') as f:
            f.write(routes_content)
            
    def generate_init_files(self):
        """Generate __init__.py files for proper imports."""
        
        # Main feature __init__.py
        feature_init = f'''"""
{self.feature_pascal} feature module.
"""

from .models.{self.feature_snake} import {self.feature_pascal}
from .services.{self.feature_snake}_service import {self.feature_pascal}Service, get_{self.feature_snake}_service
from .schemas.{self.feature_snake} import (
    {self.feature_pascal}Create,
    {self.feature_pascal}Update,
    {self.feature_pascal}Response,
    {self.feature_pascal}SearchParams,
    {self.feature_pascal}Stats,
    {self.feature_pascal}ListResponse,
    {self.feature_pascal}BulkUpdateRequest,
)

__all__ = [
    "{self.feature_pascal}",
    "{self.feature_pascal}Service",
    "get_{self.feature_snake}_service",
    "{self.feature_pascal}Create",
    "{self.feature_pascal}Update",
    "{self.feature_pascal}Response",
    "{self.feature_pascal}SearchParams",
    "{self.feature_pascal}Stats",
    "{self.feature_pascal}ListResponse",
    "{self.feature_pascal}BulkUpdateRequest",
]
'''
        
        with open(self.feature_path / "__init__.py", 'w') as f:
            f.write(feature_init)
            
        # Models __init__.py
        with open(self.feature_path / "models" / "__init__.py", 'w') as f:
            f.write(f'from .{self.feature_snake} import {self.feature_pascal}')
            
        # Schemas __init__.py
        with open(self.feature_path / "schemas" / "__init__.py", 'w') as f:
            f.write(f'from .{self.feature_snake} import *')
            
        # Services __init__.py
        with open(self.feature_path / "services" / "__init__.py", 'w') as f:
            f.write(f'from .{self.feature_snake}_service import {self.feature_pascal}Service, get_{self.feature_snake}_service')
            
        # Routes __init__.py
        with open(self.feature_path / "routes" / "__init__.py", 'w') as f:
            f.write(f'from .{self.feature_snake} import router')


def main():
    """Main entry point for the service template generator."""
    parser = argparse.ArgumentParser(
        description="Generate Academy Admin service templates with program context filtering"
    )
    parser.add_argument(
        "feature_name",
        help="Name of the feature to generate (e.g., 'User Management', 'inventory-items')"
    )
    parser.add_argument(
        "--base-path",
        default="backend/app/features",
        help="Base path for feature generation (default: backend/app/features)"
    )
    
    args = parser.parse_args()
    
    try:
        generator = ServiceTemplateGenerator(args.feature_name, args.base_path)
        generator.generate_all()
        
        print(f"\\n🎉 Successfully generated service templates for '{{args.feature_name}}'!")
        print(f"\\n📁 Generated at: {{generator.feature_path}}")
        
    except Exception as e:
        print(f"❌ Error generating service templates: {{e}}")
        sys.exit(1)


if __name__ == "__main__":
    main()