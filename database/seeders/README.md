# Database Seeders

This directory contains database seeder files for populating the Academy Admin database with test data.

## Usage

Run seeders to populate the database with sample data for development and testing:

```bash
# Run all seeders
python -m backend.seeders.run_all

# Run specific seeder
python -m backend.seeders.student_seeder
```

## Available Seeders

- `user_seeder.py` - Creates sample users and admin accounts
- `student_seeder.py` - Creates sample student records
- `program_seeder.py` - Creates sample academic programs
- `facility_seeder.py` - Creates sample facilities/locations

## File Structure

```
seeders/
├── README.md
├── run_all.py          # Script to run all seeders
├── base_seeder.py      # Base seeder class
├── user_seeder.py      # User data seeder
├── student_seeder.py   # Student data seeder
├── program_seeder.py   # Program data seeder
└── facility_seeder.py  # Facility data seeder
```