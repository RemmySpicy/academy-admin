# Payment Override System Specification

**Comprehensive specification for organization-based payment overrides and access control in the Academy Admin system.**

## 📖 Table of Contents

- [Overview](#overview)
- [Payment Calculation Logic](#payment-calculation-logic)
- [Organization Sponsorship Models](#organization-sponsorship-models)
- [Payment Override Rules](#payment-override-rules)
- [Access Control System](#access-control-system)
- [API Specifications](#api-specifications)
- [Implementation Examples](#implementation-examples)
- [Edge Cases and Conflict Resolution](#edge-cases-and-conflict-resolution)

## Overview

The Payment Override System determines who is responsible for paying course enrollment fees when students have complex relationships with organizations and parents. The system supports multiple payment models and provides flexible override mechanisms.

### Core Principles

1. **Priority Order**: Organization sponsorship > Parent responsibility > Student payment
2. **Program Context**: All calculations respect program boundaries
3. **Flexibility**: Support for full, partial, and custom payment arrangements
4. **Transparency**: Clear breakdown of payment responsibility
5. **Audit Trail**: Complete tracking of payment override decisions

### Payment Scenarios

| Scenario | Primary Payer | Secondary Payer | Example |
|----------|---------------|-----------------|---------|
| **Full Sponsorship** | Organization (100%) | None | Corporate partner pays all fees |
| **Partial Sponsorship** | Organization (%) | Parent/Student (remaining %) | School pays 70%, parent pays 30% |
| **Custom Pricing** | Organization (fixed amount) | Parent/Student (remainder) | Organization pays $200, parent pays $99 |
| **Parent Responsibility** | Parent (100%) | None | Standard family payment |
| **Mixed Responsibility** | Multiple payers | Split percentages | Organization 50%, Parent 30%, Student 20% |
| **Student Direct** | Student (100%) | None | Independent student payment |

## Payment Calculation Logic

### 1. Primary Calculation Flow

```python
def calculate_payment_responsibility(student_id, course_id, base_amount, program_context):
    """
    Main payment calculation algorithm
    
    Returns PaymentCalculation with breakdown of all payers
    """
    
    # Step 1: Get student and course information
    student = get_student(student_id, program_context)
    course = get_course(course_id, program_context)
    
    # Step 2: Check for organization sponsorships
    org_memberships = get_active_org_memberships(student_id, program_context)
    organization_coverage = calculate_organization_coverage(org_memberships, course_id, base_amount)
    
    # Step 3: Check for parent responsibility
    parent_relationships = get_parent_relationships(student_id, program_context)
    parent_coverage = calculate_parent_coverage(parent_relationships, base_amount, organization_coverage)
    
    # Step 4: Calculate student responsibility (remainder)
    student_coverage = base_amount - organization_coverage.amount - parent_coverage.amount
    
    # Step 5: Build payment breakdown
    payment_breakdown = build_payment_breakdown(
        organization_coverage, parent_coverage, student_coverage, base_amount
    )
    
    return PaymentCalculation(
        payer_type=determine_primary_payer_type(payment_breakdown),
        primary_payer_id=get_primary_payer_id(payment_breakdown),
        payment_breakdown=payment_breakdown,
        total_amount=base_amount,
        discounts_applied=extract_discounts(organization_coverage),
        override_reason=generate_override_reason(payment_breakdown)
    )
```

### 2. Organization Coverage Calculation

```python
def calculate_organization_coverage(memberships, course_id, base_amount):
    """
    Calculate how much organizations will cover for a course
    """
    total_coverage = Decimal('0')
    coverage_details = []
    
    for membership in memberships:
        if not membership.is_sponsored:
            continue
            
        org = membership.organization
        
        # Get organization's payment override for this course/program
        override = org.get_payment_override(membership.program_id, course_id)
        if not override:
            continue
        
        # Calculate coverage amount based on override type
        if override.get('sponsorship_type') == 'full':
            amount = base_amount
            percentage = 100.0
        elif override.get('sponsorship_type') == 'partial':
            percentage = Decimal(str(override.get('percentage', 0)))
            amount = (base_amount * percentage) / 100
        elif override.get('sponsorship_type') == 'fixed':
            amount = min(Decimal(str(override.get('fixed_amount', 0))), base_amount)
            percentage = float((amount / base_amount) * 100) if base_amount > 0 else 0
        else:
            continue
        
        coverage_details.append({
            'organization_id': org.id,
            'organization_name': org.name,
            'amount': amount,
            'percentage': percentage,
            'sponsorship_type': override.get('sponsorship_type'),
            'membership_type': membership.membership_type
        })
        
        total_coverage += amount
        
        # Stop at full coverage (100%)
        if total_coverage >= base_amount:
            total_coverage = base_amount
            break
    
    return OrganizationCoverage(
        total_amount=total_coverage,
        coverage_details=coverage_details,
        has_coverage=total_coverage > 0
    )
```

### 3. Parent Responsibility Calculation

```python
def calculate_parent_coverage(relationships, base_amount, org_coverage):
    """
    Calculate parent payment responsibility after organization coverage
    """
    remaining_amount = base_amount - org_coverage.total_amount
    
    if remaining_amount <= 0:
        return ParentCoverage(total_amount=Decimal('0'), coverage_details=[])
    
    # Find parents with payment responsibility
    responsible_parents = [
        rel for rel in relationships 
        if rel.has_payment_responsibility and rel.is_active
    ]
    
    if not responsible_parents:
        return ParentCoverage(total_amount=Decimal('0'), coverage_details=[])
    
    coverage_details = []
    total_parent_coverage = Decimal('0')
    
    for relationship in responsible_parents:
        # Calculate this parent's share
        if relationship.payment_percentage:
            # Explicit percentage set
            percentage = relationship.payment_percentage
            amount = (remaining_amount * percentage) / 100
        else:
            # Equal split among responsible parents
            percentage = 100.0 / len(responsible_parents)
            amount = remaining_amount / len(responsible_parents)
        
        parent_user = get_user(relationship.parent_user_id)
        coverage_details.append({
            'parent_id': parent_user.id,
            'parent_name': parent_user.full_name,
            'amount': amount,
            'percentage': float(percentage),
            'relationship_type': relationship.relationship_type
        })
        
        total_parent_coverage += amount
    
    return ParentCoverage(
        total_amount=total_parent_coverage,
        coverage_details=coverage_details
    )
```

## Organization Sponsorship Models

### 1. Full Sponsorship Model

Organization pays 100% of enrollment fees.

```json
{
  "sponsorship_type": "full",
  "description": "Complete coverage of all course fees",
  "payment_breakdown": [
    {
      "payer_type": "organization",
      "amount": 299.99,
      "percentage": 100.0,
      "reason": "Full corporate sponsorship"
    }
  ]
}
```

**Configuration Example:**
```python
organization.payment_overrides = {
    "swimming": {
        "sponsorship_type": "full",
        "description": "All swimming courses fully covered"
    },
    "global": {
        "sponsorship_type": "full",
        "max_courses_per_year": 4
    }
}
```

### 2. Partial Sponsorship Model

Organization pays a percentage, remainder covered by parent/student.

```json
{
  "sponsorship_type": "partial",
  "percentage": 70.0,
  "payment_breakdown": [
    {
      "payer_type": "organization",
      "amount": 209.99,
      "percentage": 70.0,
      "reason": "Partial corporate sponsorship"
    },
    {
      "payer_type": "parent",
      "amount": 89.99,
      "percentage": 30.0,
      "reason": "Parent responsibility remainder"
    }
  ]
}
```

**Configuration Example:**
```python
organization.payment_overrides = {
    "robotics": {
        "sponsorship_type": "partial",
        "percentage": 70.0,
        "description": "70% coverage for STEM programs"
    }
}
```

### 3. Fixed Amount Model

Organization pays a fixed amount, remainder covered by parent/student.

```json
{
  "sponsorship_type": "fixed",
  "fixed_amount": 200.00,
  "payment_breakdown": [
    {
      "payer_type": "organization",
      "amount": 200.00,
      "percentage": 66.7,
      "reason": "Fixed corporate contribution"
    },
    {
      "payer_type": "parent",
      "amount": 99.99,
      "percentage": 33.3,
      "reason": "Parent pays remainder"
    }
  ]
}
```

**Configuration Example:**
```python
organization.payment_overrides = {
    "global": {
        "sponsorship_type": "fixed",
        "fixed_amount": 200.00,
        "description": "$200 contribution toward any course"
    }
}
```

### 4. Tiered Sponsorship Model

Different coverage based on membership tier or course type.

```json
{
  "sponsorship_rules": [
    {
      "condition": "membership_type == 'premium'",
      "sponsorship_type": "full"
    },
    {
      "condition": "membership_type == 'standard'",
      "sponsorship_type": "partial",
      "percentage": 50.0
    },
    {
      "condition": "course_category == 'stem'",
      "sponsorship_type": "partial",
      "percentage": 80.0
    }
  ]
}
```

## Payment Override Rules

### 1. Override Priority System

1. **Course-Specific Overrides**: Highest priority
2. **Program-Level Overrides**: Medium priority  
3. **Global Organization Overrides**: Lowest priority
4. **Membership-Level Overrides**: Can override organization defaults

```python
def get_effective_override(organization, program_id, course_id, membership):
    """
    Get the most specific override that applies
    """
    # Check membership-specific overrides first
    if membership.override_permissions:
        if course_id in membership.override_permissions:
            return membership.override_permissions[course_id]
        if "program" in membership.override_permissions:
            return membership.override_permissions["program"]
    
    # Check organization overrides
    if organization.payment_overrides:
        # Course-specific
        course_key = f"{program_id}:{course_id}"
        if course_key in organization.payment_overrides:
            return organization.payment_overrides[course_key]
        
        # Program-specific
        if program_id in organization.payment_overrides:
            return organization.payment_overrides[program_id]
        
        # Global
        if "global" in organization.payment_overrides:
            return organization.payment_overrides["global"]
    
    return None
```

### 2. Conflict Resolution Rules

When multiple organizations or parents have payment responsibility:

```python
def resolve_payment_conflicts(org_coverages, parent_coverages, base_amount):
    """
    Resolve conflicts when multiple entities want to pay
    """
    total_requested = sum(c.amount for c in org_coverages) + sum(c.amount for c in parent_coverages)
    
    if total_requested <= base_amount:
        # No conflict - everyone pays what they want
        return org_coverages + parent_coverages
    
    # Conflict resolution: proportional reduction
    reduction_factor = base_amount / total_requested
    
    resolved_coverages = []
    for coverage in org_coverages + parent_coverages:
        coverage.amount *= reduction_factor
        coverage.percentage = float((coverage.amount / base_amount) * 100)
        resolved_coverages.append(coverage)
    
    return resolved_coverages
```

### 3. Budget and Limit Enforcement

Organizations can have spending limits and budget controls:

```python
def check_organization_budget(organization, course_amount, program_id):
    """
    Check if organization has budget remaining for this payment
    """
    budget_config = organization.payment_overrides.get('budget_limits', {})
    
    if not budget_config:
        return True, None  # No limits set
    
    # Check annual budget
    if 'annual_limit' in budget_config:
        current_year_spending = get_organization_spending(organization.id, current_year())
        if current_year_spending + course_amount > budget_config['annual_limit']:
            return False, "Annual budget limit exceeded"
    
    # Check per-student limit
    if 'per_student_limit' in budget_config:
        student_spending = get_student_organization_spending(student_id, organization.id, current_year())
        if student_spending + course_amount > budget_config['per_student_limit']:
            return False, "Per-student budget limit exceeded"
    
    return True, None
```

## Access Control System

### 1. Course Access Rules

Organizations can grant or restrict access to specific courses:

```python
def check_organization_course_access(student_id, course_id, program_context):
    """
    Check if student has special course access through organization membership
    """
    memberships = get_active_org_memberships(student_id, program_context)
    
    access_grants = []
    access_restrictions = []
    
    for membership in memberships:
        org = membership.organization
        
        # Check organization's course access rules
        if hasattr(org, 'course_access_rules'):
            rules = org.course_access_rules
            
            if course_id in rules.get('granted_courses', []):
                access_grants.append({
                    'organization_id': org.id,
                    'organization_name': org.name,
                    'reason': f"Course access granted through {org.name} membership"
                })
            
            if course_id in rules.get('restricted_courses', []):
                access_restrictions.append({
                    'organization_id': org.id,
                    'organization_name': org.name,
                    'reason': f"Course access restricted by {org.name} policy"
                })
    
    # Determine final access (restrictions override grants)
    has_access = True  # Default access
    access_type = "default"
    
    if access_restrictions:
        has_access = False
        access_type = "restricted"
        reason = access_restrictions[0]['reason']
    elif access_grants:
        has_access = True
        access_type = "granted"
        reason = access_grants[0]['reason']
    else:
        reason = "Standard course access"
    
    return CourseAccessResult(
        has_access=has_access,
        access_type=access_type,
        reason=reason,
        access_grants=access_grants,
        access_restrictions=access_restrictions
    )
```

### 2. Enrollment Restrictions

Organizations can set enrollment limits and restrictions:

```json
{
  "enrollment_restrictions": {
    "max_concurrent_courses": 3,
    "allowed_course_categories": ["stem", "arts"],
    "blocked_course_categories": ["sports"],
    "max_courses_per_semester": 2,
    "requires_approval": ["advanced_robotics", "competitive_swimming"]
  }
}
```

## API Specifications

### Calculate Payment Responsibility

```http
POST /api/v1/payment-overrides/calculate-payment
Content-Type: application/json

{
  "student_id": "student-123",
  "course_id": "swimming-101", 
  "base_amount": 299.99
}
```

**Response:**
```json
{
  "payer_type": "mixed",
  "primary_payer_id": "org-456", 
  "payment_breakdown": [
    {
      "payer_id": "org-456",
      "payer_type": "organization",
      "payer_name": "TechCorp Inc.",
      "amount": 209.99,
      "percentage": 70.0,
      "reason": "Partial corporate sponsorship"
    },
    {
      "payer_id": "parent-789",
      "payer_type": "parent", 
      "payer_name": "John Smith",
      "amount": 89.99,
      "percentage": 30.0,
      "reason": "Parent responsibility remainder"
    }
  ],
  "total_amount": 299.99,
  "discounts_applied": ["corporate_partner_discount"],
  "override_reason": "TechCorp Inc. covers 70%; John Smith pays remaining 30%"
}
```

### Apply Payment Overrides

```http
POST /api/v1/payment-overrides/apply-payment-overrides
Content-Type: application/json

{
  "student_id": "student-123",
  "course_id": "swimming-101",
  "base_amount": 299.99
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "payment_structure": { /* PaymentCalculation object */ },
    "override_applied": true,
    "created_at": "2025-07-26T10:30:00Z",
    "status": "pending"
  },
  "message": "Payment overrides applied successfully"
}
```

### Check Course Access

```http
POST /api/v1/payment-overrides/check-course-access
Content-Type: application/json

{
  "student_id": "student-123",
  "course_id": "advanced-robotics"
}
```

**Response:**
```json
{
  "has_access": true,
  "access_type": "granted",
  "reason": "Course access granted through TechCorp Inc. membership",
  "access_grants": [
    {
      "organization_id": "org-456",
      "organization_name": "TechCorp Inc.",
      "access_type": "granted",
      "reason": "STEM program access included in corporate partnership"
    }
  ],
  "access_restrictions": [],
  "organization_memberships": [
    {
      "organization_id": "org-456",
      "organization_name": "TechCorp Inc.",
      "membership_type": "sponsored"
    }
  ]
}
```

## Implementation Examples

### 1. Multi-Organization Scenario

Student is member of both a school and a corporate partner:

```python
# School covers 50% of all courses
school_override = {
    "sponsorship_type": "partial",
    "percentage": 50.0,
    "priority": 1
}

# Corporate partner covers remaining amount for STEM courses  
corporate_override = {
    "course_categories": ["stem"],
    "sponsorship_type": "partial", 
    "percentage": 50.0,
    "priority": 2
}

# Result: 100% coverage for STEM courses, 50% for others
```

### 2. Family with Multiple Children

Parent has 3 children in different programs with different sponsors:

```python
# Child 1: Swimming - fully sponsored by swim club
child1_payment = calculate_payment_responsibility("child1", "swimming-101", 299.99)
# Result: Swim Club pays 100%

# Child 2: Robotics - partially sponsored by tech company
child2_payment = calculate_payment_responsibility("child2", "robotics-101", 399.99) 
# Result: TechCorp pays 70%, Parent pays 30%

# Child 3: Music - no sponsorship
child3_payment = calculate_payment_responsibility("child3", "piano-101", 199.99)
# Result: Parent pays 100%
```

### 3. Budget Limit Scenario

Organization with spending limits:

```python
# Organization has $5000 annual budget
org.payment_overrides = {
    "global": {
        "sponsorship_type": "full",
        "budget_limits": {
            "annual_limit": 5000.00,
            "per_student_limit": 1000.00
        }
    }
}

# Current spending: $4800
# New course cost: $299.99  
# Result: Budget exceeded, fallback to parent payment
```

## Edge Cases and Conflict Resolution

### 1. Circular Dependencies

When organizations and parents create circular payment responsibilities:

```python
def detect_payment_cycles(student_id, visited_entities=None):
    """
    Detect and prevent circular payment dependencies
    """
    if visited_entities is None:
        visited_entities = set()
    
    if student_id in visited_entities:
        return True  # Cycle detected
    
    visited_entities.add(student_id)
    
    # Check organization dependencies
    for membership in get_org_memberships(student_id):
        if membership.organization.has_conditional_sponsorship:
            # Check if sponsorship depends on other payments
            for dependency in membership.organization.sponsorship_dependencies:
                if detect_payment_cycles(dependency, visited_entities.copy()):
                    return True
    
    return False
```

### 2. Partial Organization Coverage

When organization sponsorship doesn't cover full amount:

```python
def handle_partial_coverage_shortage(org_coverage, parent_coverage, student_id, base_amount):
    """
    Handle cases where total coverage is less than course cost
    """
    total_coverage = org_coverage.amount + parent_coverage.amount
    shortage = base_amount - total_coverage
    
    if shortage <= 0:
        return org_coverage, parent_coverage, Decimal('0')
    
    # Options for handling shortage:
    # 1. Student pays remainder (default)
    # 2. Proportional increase in parent responsibility  
    # 3. Request additional organization approval
    
    student_coverage = shortage
    return org_coverage, parent_coverage, student_coverage
```

### 3. Date-Based Override Changes

When payment overrides change during enrollment period:

```python
def get_effective_override_for_date(organization, course_id, enrollment_date):
    """
    Get payment override rules that were effective on a specific date
    """
    override_history = organization.payment_override_history
    
    effective_override = None
    for override in override_history:
        if (override.effective_date <= enrollment_date and 
            (override.end_date is None or override.end_date > enrollment_date)):
            effective_override = override
            break
    
    return effective_override or organization.current_payment_overrides
```

### 4. Multi-Program Complications

When students are enrolled in multiple programs with different sponsors:

```python
def resolve_cross_program_payments(student_id, course_id, program_contexts):
    """
    Handle payment calculation when student has memberships across programs
    """
    payment_calculations = []
    
    for program_id in program_contexts:
        calc = calculate_payment_responsibility(
            student_id, course_id, base_amount, program_id
        )
        payment_calculations.append((program_id, calc))
    
    # Apply cross-program resolution rules
    # - Use most generous sponsorship
    # - Prevent double-billing
    # - Respect program boundaries
    
    return resolve_cross_program_conflicts(payment_calculations)
```

---

**📋 Last Updated**: 2025-07-26  
**🔧 Version**: 1.0.0  
**👥 Maintainer**: Academy Admin Development Team