"""
Base service class for common database operations.
"""

from typing import TypeVar, Generic, List, Optional, Any, Dict
from datetime import datetime, date
from sqlalchemy.orm import Session

from app.features.common.models.base import BaseModel

ModelType = TypeVar("ModelType", bound=BaseModel)


class BaseService(Generic[ModelType]):
    """Base service class providing common CRUD operations."""
    
    def __init__(self, db: Session, model_class: type[ModelType]):
        self.db = db
        self.model_class = model_class
    
    def create(self, **data) -> ModelType:
        """Create a new record."""
        instance = self.model_class(**data)
        self.db.add(instance)
        self.db.commit()
        self.db.refresh(instance)
        return instance
    
    def get_by_id(self, record_id: str) -> Optional[ModelType]:
        """Get a record by ID."""
        return self.db.query(self.model_class).filter(
            self.model_class.id == record_id
        ).first()
    
    def get_all(
        self, 
        limit: Optional[int] = None, 
        offset: Optional[int] = None
    ) -> List[ModelType]:
        """Get all records with optional pagination."""
        query = self.db.query(self.model_class)
        
        if offset:
            query = query.offset(offset)
        if limit:
            query = query.limit(limit)
        
        return query.all()
    
    def update(self, record_id: str, **update_data) -> Optional[ModelType]:
        """Update a record by ID."""
        instance = self.get_by_id(record_id)
        if instance:
            for key, value in update_data.items():
                if hasattr(instance, key):
                    setattr(instance, key, value)
            
            # Update the updated_at timestamp if the model has it
            if hasattr(instance, 'updated_at'):
                instance.updated_at = datetime.utcnow()
            
            self.db.commit()
            self.db.refresh(instance)
        
        return instance
    
    def delete(self, record_id: str) -> bool:
        """Delete a record by ID."""
        instance = self.get_by_id(record_id)
        if instance:
            self.db.delete(instance)
            self.db.commit()
            return True
        return False
    
    def count(self) -> int:
        """Count total records."""
        return self.db.query(self.model_class).count()
    
    def exists(self, record_id: str) -> bool:
        """Check if a record exists by ID."""
        return self.db.query(self.model_class).filter(
            self.model_class.id == record_id
        ).first() is not None
    
    def get_current_datetime(self) -> datetime:
        """Get current datetime."""
        return datetime.utcnow()
    
    def get_current_date(self) -> date:
        """Get current date."""
        return date.today()
    
    def bulk_create(self, records_data: List[Dict[str, Any]]) -> List[ModelType]:
        """Create multiple records in bulk."""
        instances = [self.model_class(**data) for data in records_data]
        self.db.add_all(instances)
        self.db.commit()
        
        for instance in instances:
            self.db.refresh(instance)
        
        return instances
    
    def bulk_update(self, updates: List[Dict[str, Any]]) -> List[ModelType]:
        """Update multiple records in bulk."""
        updated_instances = []
        
        for update_data in updates:
            record_id = update_data.pop('id')
            instance = self.update(record_id, **update_data)
            if instance:
                updated_instances.append(instance)
        
        return updated_instances