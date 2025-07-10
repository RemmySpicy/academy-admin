"""
Base service class for curriculum management operations.
"""

from typing import TypeVar, Generic, List, Optional, Dict, Any, Tuple, Type
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, desc, asc
from sqlalchemy.ext.declarative import DeclarativeMeta

from app.features.common.models.base import BaseModel

# Type variables for generic service
ModelType = TypeVar("ModelType", bound=BaseModel)
CreateSchemaType = TypeVar("CreateSchemaType")
UpdateSchemaType = TypeVar("UpdateSchemaType")


class BaseService(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    """Base service class with common CRUD operations."""
    
    def __init__(self, model: Type[ModelType]):
        self.model = model
    
    def create(self, 
               db: Session, 
               obj_in: CreateSchemaType, 
               created_by: Optional[str] = None) -> ModelType:
        """Create a new object."""
        obj_data = obj_in.dict() if hasattr(obj_in, 'dict') else obj_in
        
        # Add audit fields if available
        if hasattr(self.model, 'created_by') and created_by:
            obj_data['created_by'] = created_by
        
        db_obj = self.model(**obj_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def get(self, db: Session, id: str) -> Optional[ModelType]:
        """Get object by ID."""
        return db.query(self.model).filter(self.model.id == id).first()
    
    def get_multi(self, 
                  db: Session, 
                  skip: int = 0, 
                  limit: int = 100,
                  filters: Optional[Dict[str, Any]] = None,
                  sort_by: Optional[str] = None,
                  sort_order: str = "asc") -> Tuple[List[ModelType], int]:
        """Get multiple objects with pagination and filtering."""
        query = db.query(self.model)
        
        # Apply filters
        if filters:
            for field, value in filters.items():
                if hasattr(self.model, field) and value is not None:
                    if isinstance(value, str):
                        # For string fields, use ILIKE for case-insensitive search
                        query = query.filter(
                            getattr(self.model, field).ilike(f"%{value}%")
                        )
                    else:
                        query = query.filter(getattr(self.model, field) == value)
        
        # Apply sorting
        if sort_by and hasattr(self.model, sort_by):
            sort_column = getattr(self.model, sort_by)
            if sort_order.lower() == "desc":
                query = query.order_by(desc(sort_column))
            else:
                query = query.order_by(asc(sort_column))
        else:
            # Default sort by created_at desc if available
            if hasattr(self.model, 'created_at'):
                query = query.order_by(desc(self.model.created_at))
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        items = query.offset(skip).limit(limit).all()
        
        return items, total
    
    def update(self, 
               db: Session, 
               db_obj: ModelType, 
               obj_in: UpdateSchemaType,
               updated_by: Optional[str] = None) -> ModelType:
        """Update an existing object."""
        obj_data = obj_in.dict(exclude_unset=True) if hasattr(obj_in, 'dict') else obj_in
        
        # Add audit fields if available
        if hasattr(self.model, 'updated_by') and updated_by:
            obj_data['updated_by'] = updated_by
        
        for field, value in obj_data.items():
            if hasattr(db_obj, field):
                setattr(db_obj, field, value)
        
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def delete(self, db: Session, id: str) -> bool:
        """Delete an object by ID."""
        obj = db.query(self.model).filter(self.model.id == id).first()
        if obj:
            db.delete(obj)
            db.commit()
            return True
        return False
    
    def bulk_update(self, 
                    db: Session, 
                    ids: List[str], 
                    update_data: Dict[str, Any],
                    updated_by: Optional[str] = None) -> Dict[str, Any]:
        """Bulk update multiple objects."""
        if updated_by and hasattr(self.model, 'updated_by'):
            update_data['updated_by'] = updated_by
        
        # Perform bulk update
        result = db.query(self.model).filter(
            self.model.id.in_(ids)
        ).update(update_data, synchronize_session=False)
        
        db.commit()
        
        successful_count = result
        failed_count = len(ids) - successful_count
        
        return {
            "successful": ids[:successful_count],  # Approximation
            "failed": [],  # Would need individual updates to track failures
            "total_processed": len(ids),
            "total_successful": successful_count,
            "total_failed": failed_count
        }
    
    def get_stats(self, db: Session, group_by_field: Optional[str] = None) -> Dict[str, Any]:
        """Get basic statistics for the model."""
        total_count = db.query(func.count(self.model.id)).scalar()
        
        stats = {
            "total_count": total_count
        }
        
        # Group by field if specified
        if group_by_field and hasattr(self.model, group_by_field):
            group_stats = db.query(
                getattr(self.model, group_by_field),
                func.count(self.model.id)
            ).group_by(getattr(self.model, group_by_field)).all()
            
            stats[f"by_{group_by_field}"] = dict(group_stats)
        
        return stats
    
    def search(self, 
               db: Session, 
               search_term: str, 
               search_fields: List[str],
               skip: int = 0,
               limit: int = 100) -> Tuple[List[ModelType], int]:
        """Search across multiple fields."""
        query = db.query(self.model)
        
        # Build search conditions
        search_conditions = []
        for field in search_fields:
            if hasattr(self.model, field):
                search_conditions.append(
                    getattr(self.model, field).ilike(f"%{search_term}%")
                )
        
        if search_conditions:
            query = query.filter(or_(*search_conditions))
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        items = query.offset(skip).limit(limit).all()
        
        return items, total