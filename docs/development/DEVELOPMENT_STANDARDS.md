# Academy Admin Development Standards

## Program Context Filtering - Mandatory Implementation Guide

**⚠️ CRITICAL: All new features MUST implement program context filtering for security and data isolation.**

---

## 🏗️ Architecture Overview

Academy Admin uses a **program-centric architecture** where all data is scoped to specific programs. Every feature must implement program context filtering to ensure users can only access data from their assigned programs.

### Core Principles

1. **Database-Level Filtering**: All data filtering happens at the database level using SQL WHERE clauses
2. **Service Layer Validation**: All service methods accept and validate `program_context` parameter
3. **Route Level Injection**: Program context is injected via HTTP headers and middleware
4. **Consistent Patterns**: All services follow the same implementation pattern

---

## 📋 Mandatory Implementation Checklist

### ✅ **1. Database Model Requirements**

**REQUIRED**: Every model that stores program-specific data MUST include:

```python
# MANDATORY: Program ID foreign key
program_id: Mapped[str] = mapped_column(
    String(36),
    ForeignKey("programs.id"),
    nullable=False,
    comment="Reference to the program this entity belongs to",
)

# MANDATORY: Program context indexes
__table_args__ = (
    # ... other indexes
    Index("idx_[model_name]_program_id", "program_id"),
    Index("idx_[model_name]_program_status", "program_id", "status"),  # if has status
)
```

**Exception**: Only global/system-wide models (like `Program`, `User`) should NOT have `program_id`.

### ✅ **2. Service Layer Requirements**

**REQUIRED**: All service methods MUST accept `program_context` parameter:

```python
from typing import Optional
from sqlalchemy.orm import Session

class YourService(BaseService[YourModel, YourCreateSchema, YourUpdateSchema]):
    """Service for managing your feature."""
    
    def __init__(self):
        super().__init__(YourModel)
    
    # MANDATORY: All methods must accept program_context
    def create_entity(self, 
                     db: Session, 
                     entity_data: YourCreateSchema, 
                     created_by: Optional[str] = None,
                     program_context: Optional[str] = None) -> YourResponseSchema:
        """Create a new entity."""
        # MANDATORY: Validate program access
        if program_context and entity_data.program_id != program_context:
            raise ValueError("Cannot create entity in different program context")
        
        # MANDATORY: Validate program exists
        program = db.query(Program).filter(Program.id == entity_data.program_id).first()
        if not program:
            raise ValueError(f"Program {entity_data.program_id} not found")
        
        # Create entity
        entity = self.create(db, entity_data, created_by)
        return self._to_response(db, entity)
    
    def get_entity(self, 
                  db: Session, 
                  entity_id: str,
                  program_context: Optional[str] = None) -> Optional[YourResponseSchema]:
        """Get entity by ID."""
        query = db.query(YourModel).filter(YourModel.id == entity_id)
        
        # MANDATORY: Apply program context filtering
        if program_context:
            query = query.filter(YourModel.program_id == program_context)
        
        entity = query.first()
        if not entity:
            return None
        
        return self._to_response(db, entity)
    
    def list_entities(self, 
                     db: Session,
                     search_params: Optional[YourSearchParams] = None,
                     page: int = 1,
                     per_page: int = 20,
                     program_context: Optional[str] = None) -> Tuple[List[YourResponseSchema], int]:
        """List entities with filtering."""
        query = db.query(YourModel)
        
        # MANDATORY: Apply program context filtering first
        if program_context:
            query = query.filter(YourModel.program_id == program_context)
        
        # Apply other filters...
        if search_params:
            # Filter implementation
            pass
        
        # Pagination and return
        total_count = query.count()
        entities = query.offset((page - 1) * per_page).limit(per_page).all()
        
        return [self._to_response(db, entity) for entity in entities], total_count
    
    def update_entity(self, 
                     db: Session, 
                     entity_id: str, 
                     entity_data: YourUpdateSchema,
                     updated_by: Optional[str] = None,
                     program_context: Optional[str] = None) -> Optional[YourResponseSchema]:
        """Update entity."""
        # MANDATORY: Validate entity exists and is accessible
        entity_response = self.get_entity(db, entity_id, program_context)
        if not entity_response:
            return None
        
        # Get entity for updating
        entity = self.get(db, entity_id)
        if not entity:
            return None
        
        # Update entity
        updated_entity = self.update(db, entity, entity_data, updated_by)
        return self._to_response(db, updated_entity)
    
    def delete_entity(self, 
                     db: Session, 
                     entity_id: str,
                     program_context: Optional[str] = None) -> bool:
        """Delete entity."""
        # MANDATORY: Validate entity exists and is accessible
        entity_response = self.get_entity(db, entity_id, program_context)
        if not entity_response:
            return False
        
        return self.delete(db, entity_id)
```

### ✅ **3. Route Layer Requirements**

**REQUIRED**: All routes MUST use program context dependency injection:

```python
from app.middleware import create_program_filter_dependency
from app.features.authentication.routes.auth import get_current_active_user

# MANDATORY: Create program filter dependency
get_program_filter = create_program_filter_dependency(get_current_active_user)

@router.get("/", response_model=YourListResponse)
async def list_entities(
    db: Annotated[Session, Depends(get_db)],
    program_context: Annotated[Optional[str], Depends(get_program_filter)],  # MANDATORY
    current_user: Annotated[dict, Depends(get_current_active_user)],
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    search_params: YourSearchParams = Depends()
):
    """List entities with program context filtering."""
    entities, total_count = your_service.list_entities(
        db=db,
        search_params=search_params,
        page=page,
        per_page=per_page,
        program_context=program_context  # MANDATORY: Pass program context
    )
    
    # Return paginated response
    return YourListResponse(
        items=entities,
        total=total_count,
        page=page,
        limit=per_page,
        # ... pagination fields
    )

@router.post("/", response_model=YourResponse)
async def create_entity(
    entity_data: YourCreateSchema,
    db: Annotated[Session, Depends(get_db)],
    program_context: Annotated[Optional[str], Depends(get_program_filter)],  # MANDATORY
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """Create entity with program context validation."""
    return your_service.create_entity(
        db=db,
        entity_data=entity_data,
        created_by=current_user["id"],
        program_context=program_context  # MANDATORY: Pass program context
    )
```

### ✅ **4. Schema Requirements**

**REQUIRED**: All schemas MUST include program context fields:

```python
from pydantic import BaseModel, Field

class YourCreateSchema(BaseModel):
    """Schema for creating new entity."""
    program_id: str = Field(..., description="Program ID this entity belongs to")  # MANDATORY
    # ... other fields

class YourUpdateSchema(BaseModel):
    """Schema for updating entity."""
    # Don't include program_id in update schema (prevent program moves)
    # ... other fields

class YourResponseSchema(BaseModel):
    """Schema for entity response."""
    id: str = Field(..., description="Entity ID")
    program_id: str = Field(..., description="Program ID")  # MANDATORY
    program_name: Optional[str] = Field(None, description="Program name")  # RECOMMENDED
    # ... other fields

class YourSearchParams(BaseModel):
    """Search parameters for entity."""
    search: Optional[str] = Field(None, description="Search query")
    program_id: Optional[str] = Field(None, description="Filter by program ID")  # MANDATORY
    # ... other filters
```

---

## 🚫 Common Mistakes to Avoid

### ❌ **DON'T DO THIS**

```python
# ❌ WRONG: No program context filtering
def get_entity(self, db: Session, entity_id: str):
    return db.query(YourModel).filter(YourModel.id == entity_id).first()

# ❌ WRONG: Application-level filtering
def list_entities(self, db: Session, program_context: str):
    entities = db.query(YourModel).all()
    return [e for e in entities if e.program_id == program_context]  # INSECURE!

# ❌ WRONG: No program context parameter
@router.get("/")
async def list_entities(db: Session = Depends(get_db)):
    return your_service.list_entities(db)

# ❌ WRONG: Missing program_id in model
class YourModel(BaseModel):
    name: str
    # Missing program_id field - SECURITY VULNERABILITY!
```

### ✅ **DO THIS INSTEAD**

```python
# ✅ CORRECT: Database-level filtering
def get_entity(self, db: Session, entity_id: str, program_context: Optional[str] = None):
    query = db.query(YourModel).filter(YourModel.id == entity_id)
    if program_context:
        query = query.filter(YourModel.program_id == program_context)
    return query.first()

# ✅ CORRECT: Program context dependency injection
@router.get("/")
async def list_entities(
    db: Annotated[Session, Depends(get_db)],
    program_context: Annotated[Optional[str], Depends(get_program_filter)]
):
    return your_service.list_entities(db, program_context=program_context)
```

---

## 🔧 Implementation Templates

### **New Feature Checklist**

When creating a new feature, follow this checklist:

- [ ] **Model**: Added `program_id` foreign key field
- [ ] **Model**: Added program context indexes
- [ ] **Service**: All methods accept `program_context` parameter
- [ ] **Service**: Database-level filtering implemented
- [ ] **Service**: Program access validation implemented
- [ ] **Routes**: Program context dependency injection added
- [ ] **Routes**: Program context passed to all service methods
- [ ] **Schemas**: `program_id` field added to create/response schemas
- [ ] **Schemas**: Search parameters include `program_id` filter
- [ ] **Tests**: Program context filtering tests added
- [ ] **Tests**: Cross-program access prevention tests added

### **File Structure Template**

```
backend/app/features/your_feature/
├── models/
│   └── your_model.py          # ✅ Include program_id field
├── schemas/
│   └── your_schema.py         # ✅ Include program_id in schemas
├── services/
│   └── your_service.py        # ✅ Program context in all methods
├── routes/
│   └── your_routes.py         # ✅ Program context dependency injection
└── tests/
    ├── test_your_model.py     # ✅ Program context filtering tests
    ├── test_your_service.py   # ✅ Cross-program access tests
    └── test_your_routes.py    # ✅ Route-level security tests
```

---

## 🧪 Testing Requirements

### **Mandatory Test Cases**

Every feature MUST include these test cases:

```python
import pytest
from sqlalchemy.orm import Session

class TestYourFeatureProgramContext:
    """Test program context filtering for your feature."""
    
    def test_create_entity_with_program_context(self, db: Session):
        """Test entity creation within program context."""
        # Test valid program context
        entity = your_service.create_entity(
            db=db,
            entity_data=YourCreateSchema(program_id="valid-program-id"),
            program_context="valid-program-id"
        )
        assert entity.program_id == "valid-program-id"
        
        # Test invalid program context
        with pytest.raises(ValueError):
            your_service.create_entity(
                db=db,
                entity_data=YourCreateSchema(program_id="other-program-id"),
                program_context="valid-program-id"
            )
    
    def test_get_entity_program_filtering(self, db: Session):
        """Test entity retrieval respects program context."""
        # Create entity in program A
        entity_a = create_test_entity(db, program_id="program-a")
        
        # Can access from program A context
        result = your_service.get_entity(db, entity_a.id, program_context="program-a")
        assert result is not None
        
        # Cannot access from program B context
        result = your_service.get_entity(db, entity_a.id, program_context="program-b")
        assert result is None
    
    def test_list_entities_program_filtering(self, db: Session):
        """Test entity listing respects program context."""
        # Create entities in different programs
        entity_a = create_test_entity(db, program_id="program-a")
        entity_b = create_test_entity(db, program_id="program-b")
        
        # List with program A context
        entities_a, count_a = your_service.list_entities(db, program_context="program-a")
        assert len(entities_a) == 1
        assert entities_a[0].id == entity_a.id
        
        # List with program B context
        entities_b, count_b = your_service.list_entities(db, program_context="program-b")
        assert len(entities_b) == 1
        assert entities_b[0].id == entity_b.id
    
    def test_update_entity_program_filtering(self, db: Session):
        """Test entity updates respect program context."""
        # Create entity in program A
        entity_a = create_test_entity(db, program_id="program-a")
        
        # Can update from program A context
        result = your_service.update_entity(
            db, entity_a.id, 
            YourUpdateSchema(name="updated"), 
            program_context="program-a"
        )
        assert result is not None
        
        # Cannot update from program B context
        result = your_service.update_entity(
            db, entity_a.id, 
            YourUpdateSchema(name="updated"), 
            program_context="program-b"
        )
        assert result is None
    
    def test_delete_entity_program_filtering(self, db: Session):
        """Test entity deletion respects program context."""
        # Create entity in program A
        entity_a = create_test_entity(db, program_id="program-a")
        
        # Cannot delete from program B context
        result = your_service.delete_entity(db, entity_a.id, program_context="program-b")
        assert result is False
        
        # Can delete from program A context
        result = your_service.delete_entity(db, entity_a.id, program_context="program-a")
        assert result is True
```

---

## 🔍 Code Review Guidelines

### **Mandatory Review Checklist**

Before merging any new feature, reviewers MUST verify:

- [ ] **Database Model**: `program_id` field exists and is properly indexed
- [ ] **Service Methods**: All methods accept `program_context` parameter
- [ ] **Database Filtering**: All queries filter by `program_context` when provided
- [ ] **Route Handlers**: Program context dependency injection is used
- [ ] **Schema Validation**: Program context fields are included in schemas
- [ ] **Test Coverage**: Program context filtering tests are comprehensive
- [ ] **Security Testing**: Cross-program access prevention is tested
- [ ] **Documentation**: Implementation follows this standard

### **Automated Checks**

The following automated checks will be implemented:

1. **Linting Rules**: Enforce program context parameter in service methods
2. **Schema Validation**: Ensure program_id fields in create/response schemas
3. **Test Coverage**: Require program context filtering tests
4. **Security Scanning**: Check for potential program context bypasses

---

## 📚 Reference Examples

### **Perfect Implementation Examples**

- ✅ **Facilities Service**: `backend/app/features/facilities/services/facility_service.py`
- ✅ **Courses Service**: `backend/app/features/courses/services/course_service.py`
- ✅ **Students Service**: `backend/app/features/students/services/student_service.py`
- ✅ **Media Service**: `backend/app/features/courses/services/media_service.py`
- ✅ **Equipment Service**: `backend/app/features/courses/services/equipment_service.py`

### **Route Implementation Examples**

- ✅ **Facilities Routes**: `backend/app/features/facilities/routes/facilities.py`
- ✅ **Courses Routes**: `backend/app/features/courses/routes/courses.py`

---

## 🚨 Security Warnings

### **Critical Security Rules**

1. **NEVER** implement application-level filtering - always use database-level filtering
2. **NEVER** trust frontend-provided program context - always use server-side validation
3. **NEVER** skip program context validation in service methods
4. **NEVER** expose cross-program data in API responses
5. **ALWAYS** validate program access before any database operations

### **Common Security Vulnerabilities**

- **Data Leakage**: Returning data from multiple programs in a single response
- **Privilege Escalation**: Allowing users to access data from unassigned programs
- **Injection Attacks**: Not properly validating program context parameters
- **Bypass Attempts**: Accepting program context from untrusted sources

---

## 📝 Documentation Requirements

### **Required Documentation**

Every new feature MUST include:

1. **API Documentation**: OpenAPI/Swagger specs with program context examples
2. **Implementation Guide**: How the feature implements program context filtering
3. **Security Notes**: Any security considerations specific to the feature
4. **Test Documentation**: Description of program context test coverage

### **Example Documentation**

```markdown
## Program Context Implementation

This feature implements program context filtering as follows:

- **Database Model**: Includes `program_id` foreign key to `programs` table
- **Service Layer**: All methods accept `program_context` parameter and filter data accordingly
- **Route Layer**: Uses `create_program_filter_dependency` for automatic context injection
- **Security**: Users can only access data from their assigned programs

### Security Considerations

- All database queries filter by `program_context` to prevent cross-program data access
- Program context is validated at the route level using middleware
- No user-provided program context is trusted - only server-generated context is used
```

---

## 🎯 Summary

By following these standards, every new feature will:

1. **Automatically inherit security** through consistent program context filtering
2. **Maintain data isolation** between different programs
3. **Follow architectural patterns** that are maintainable and scalable
4. **Pass security audits** with comprehensive program context validation
5. **Integrate seamlessly** with existing Academy Admin features

**⚠️ REMEMBER: Program context filtering is not optional - it's a critical security requirement for every feature in Academy Admin.**

---

## 🎨 Frontend Layout Standards

**⚠️ CRITICAL: All new feature pages MUST follow the layout architecture for consistency and user experience.**

### 📋 Mandatory Frontend Implementation Checklist

### ✅ **1. Page Header Requirements**

**REQUIRED**: Every feature page MUST use the global header system:

```typescript
// MANDATORY: Set page title and description in global header
export default function FeaturePage() {
  usePageTitle('Feature Name', 'Feature description for global header');
  
  return (
    <div className="space-y-6">
      {/* Page content */}
    </div>
  );
}
```

**❌ DO NOT**: Wrap pages in `DashboardLayout` or create duplicate headers:

```typescript
// ❌ WRONG - Do not wrap in DashboardLayout
export default function FeaturePage() {
  return (
    <DashboardLayout title="Feature Name">  {/* ❌ Don't do this */}
      <div>
        <h1>Feature Name</h1>  {/* ❌ Don't create duplicate headers */}
        <p>Description</p>
      </div>
    </DashboardLayout>
  );
}
```

### ✅ **2. Action Button Placement Requirements**

**REQUIRED**: Action buttons MUST be placed contextually, never in global header:

#### **For Pages with Tabs:**
```typescript
<TabsContent value="tab">
  <Card>
    <CardHeader>
      <div className="flex justify-between items-center">
        <div>
          <CardTitle>Section Title</CardTitle>
          <CardDescription>Section description</CardDescription>
        </div>
        <Button>  {/* ✅ Beside section header */}
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>
    </CardHeader>
  </Card>
</TabsContent>
```

#### **For Pages without Tabs:**
```typescript
<div className="space-y-6">
  <div className="flex justify-end">
    <Button>  {/* ✅ Top-right of content area */}
      <Plus className="h-4 w-4 mr-2" />
      Add Item
    </Button>
  </div>
  {/* Page content */}
</div>
```

### ✅ **3. Component Structure Requirements**

**REQUIRED**: Feature pages MUST follow this structure:

```typescript
// ✅ CORRECT: Simple container with proper spacing
export default function FeaturePage() {
  usePageTitle('Feature Name', 'Feature description');
  
  return (
    <div className="space-y-6">
      {/* Action buttons (if needed) */}
      {/* Page content (Cards, Tables, etc.) */}
    </div>
  );
}
```

### ✅ **4. Import Requirements**

**REQUIRED**: Feature pages MUST import the page title hook:

```typescript
import { usePageTitle } from '@/hooks/usePageTitle';
```

**❌ DO NOT**: Import or use `DashboardLayout` in feature pages:

```typescript
// ❌ WRONG - Don't import DashboardLayout in feature pages
import { DashboardLayout } from '@/components/layout/DashboardLayout';
```

### 🎯 **Layout Validation Checklist**

Before committing any new feature page, verify:

- [ ] Uses `usePageTitle()` hook for global header
- [ ] No `DashboardLayout` wrapper in the page component
- [ ] No duplicate local headers (h1, page titles)
- [ ] Action buttons positioned contextually (beside sections or top-right)
- [ ] Returns simple `<div className="space-y-6">` container
- [ ] Proper JSX structure with matching opening/closing tags

### 🚨 **Common Layout Mistakes to Avoid**

1. **Nested Layouts**: Never wrap feature pages in `DashboardLayout`
2. **Duplicate Headers**: Don't create local page titles when using `usePageTitle`
3. **Global Header Actions**: Don't put page-specific actions in the global header
4. **Inconsistent Spacing**: Always use `space-y-6` for main container
5. **Missing Page Context**: Always call `usePageTitle()` at component start

### 📖 **Additional Resources**

- **Complete Architecture Guide**: [`docs/architecture/FRONTEND_LAYOUT_ARCHITECTURE.md`](../architecture/FRONTEND_LAYOUT_ARCHITECTURE.md)
- **Context Implementation**: `src/contexts/PageHeaderContext.tsx`
- **Hook Documentation**: `src/hooks/usePageTitle.tsx`
- **Example Pages**: All files in `src/app/admin/*/page.tsx`

---

## 🎯 Summary

By following these standards, every new feature will:

### **Backend (Program Context)**
1. **Automatically inherit security** through consistent program context filtering
2. **Maintain data isolation** between different programs
3. **Follow architectural patterns** that are maintainable and scalable
4. **Pass security audits** with comprehensive program context validation
5. **Integrate seamlessly** with existing Academy Admin features

### **Frontend (Layout Architecture)**
1. **Provide consistent user experience** with unified header and navigation
2. **Maintain clean component separation** without duplicate layouts
3. **Position actions contextually** for intuitive user interactions
4. **Follow responsive design principles** across all viewport sizes
5. **Enable maintainable code** through consistent patterns and hooks

**⚠️ REMEMBER: Both program context filtering and layout architecture standards are mandatory requirements for every feature in Academy Admin.**

---

## 🗄️ Database Query Patterns

### **PostgreSQL ARRAY Queries**

When working with PostgreSQL ARRAY fields (like `User.roles`), use the correct SQLAlchemy syntax:

#### ✅ **Correct ARRAY Query Patterns**

```python
from sqlalchemy import func
from app.features.authentication.models.user import User

# ✅ CORRECT: Check if array contains a specific value
query = db.query(User).filter(User.roles.any('parent'))

# ✅ CORRECT: Check if array contains any of multiple values
role_conditions = [User.roles.any(role) for role in role_list]
query = db.query(User).filter(or_(*role_conditions))

# ✅ CORRECT: Complex array operations
query = db.query(User).filter(
    and_(
        User.roles.any('tutor'),
        User.is_active == True
    )
)
```

#### ❌ **Incorrect ARRAY Patterns (Will Cause Errors)**

```python
# ❌ WRONG: This causes PostgreSQL errors
query = db.query(User).filter(User.roles.contains(['parent']))

# ❌ WRONG: Using Python 'in' operator with arrays
query = db.query(User).filter('parent' in User.roles)
```

### **JOIN Query Patterns**

When joining tables with multiple foreign key relationships, be explicit:

#### ✅ **Correct JOIN Patterns**

```python
# ✅ CORRECT: Explicit join condition
query = query.join(
    UserProgramAssignment, 
    User.id == UserProgramAssignment.user_id
).filter(
    UserProgramAssignment.program_id == program_context
)

# ✅ CORRECT: Multiple joins with explicit conditions
query = db.query(Student).join(
    User, Student.user_id == User.id
).join(
    UserProgramAssignment, User.id == UserProgramAssignment.user_id
).filter(
    UserProgramAssignment.program_id == program_context
)
```

#### ❌ **Incorrect JOIN Patterns**

```python
# ❌ WRONG: Ambiguous join (causes "more than one foreign key" error)
query = query.join(UserProgramAssignment).filter(
    UserProgramAssignment.program_id == program_context
)
```

### **Self-Referencing Relationships**

For self-referencing models (like recurring sessions):

#### ✅ **Correct Self-Reference Pattern**

```python
# ✅ CORRECT: String reference for remote_side
recurring_parent = relationship(
    "ScheduledSession", 
    remote_side="ScheduledSession.id",
    back_populates="recurring_children"
)
```

#### ❌ **Incorrect Self-Reference Pattern**

```python
# ❌ WRONG: Lambda function causes runtime errors
recurring_parent = relationship(
    "ScheduledSession", 
    remote_side=[lambda: ScheduledSession.id],  # This breaks!
    back_populates="recurring_children"
)
```

### **Query Performance Tips**

1. **Use `any()` for array containment** - More efficient than `contains()`
2. **Explicit join conditions** - Prevents ambiguous join errors
3. **Program context filtering** - Always filter by program_id early in queries
4. **Index on program_id** - Ensure all program_id columns are indexed