# Database Fixtures

This directory contains database fixture files for testing purposes.

## Usage

Fixtures are used to provide consistent test data for unit and integration tests:

```python
# In test files
from backend.database.fixtures.student_fixtures import create_test_student
from backend.database.fixtures.user_fixtures import create_test_user

def test_student_creation():
    student = create_test_student()
    assert student.first_name == "John"
```

## Available Fixtures

- `user_fixtures.py` - User model fixtures
- `student_fixtures.py` - Student model fixtures
- `program_fixtures.py` - Program model fixtures
- `facility_fixtures.py` - Facility model fixtures

## File Structure

```
fixtures/
├── README.md
├── base_fixtures.py      # Base fixture utilities
├── user_fixtures.py      # User fixtures
├── student_fixtures.py   # Student fixtures
├── program_fixtures.py   # Program fixtures
└── facility_fixtures.py  # Facility fixtures
```