"""
Common enums used across the application.
"""

import enum


class StudentStatus(str, enum.Enum):
    """Student status enumeration."""
    ACTIVE = "active"
    INACTIVE = "inactive"
    GRADUATED = "graduated"
    WITHDRAWN = "withdrawn"
    SUSPENDED = "suspended"


class ParentStatus(str, enum.Enum):
    """Parent account status enumeration."""
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"


class EnrollmentStatus(str, enum.Enum):
    """Enrollment status enumeration."""
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    WITHDRAWN = "withdrawn"
    WAITLISTED = "waitlisted"


class AttendanceStatus(str, enum.Enum):
    """Attendance status enumeration."""
    PRESENT = "present"
    ABSENT = "absent"
    LATE = "late"
    EXCUSED = "excused"


class TransactionType(str, enum.Enum):
    """Financial transaction type enumeration."""
    PAYMENT = "payment"
    REFUND = "refund"
    CREDIT = "credit"
    DEBIT = "debit"
    ADJUSTMENT = "adjustment"


class PaymentMethod(str, enum.Enum):
    """Payment method enumeration."""
    CASH = "cash"
    CARD = "card"
    BANK_TRANSFER = "bank_transfer"
    ONLINE = "online"
    CHECK = "check"


class PaymentStatus(str, enum.Enum):
    """Payment status enumeration."""
    PENDING = "pending"
    PAID = "paid"
    OVERDUE = "overdue"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"


class UserRole(str, enum.Enum):
    """User role enumeration."""
    SUPER_ADMIN = "super_admin"
    PROGRAM_ADMIN = "program_admin"
    PROGRAM_COORDINATOR = "program_coordinator"
    TUTOR = "tutor"
    STUDENT = "student"
    PARENT = "parent"


class RelationshipType(str, enum.Enum):
    """Parent-child relationship type enumeration."""
    FATHER = "father"
    MOTHER = "mother"
    GUARDIAN = "guardian"
    GRANDPARENT = "grandparent"
    SIBLING = "sibling"
    SPOUSE = "spouse"
    OTHER = "other"


class Gender(str, enum.Enum):
    """Gender enumeration."""
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"
    PREFER_NOT_TO_SAY = "prefer_not_to_say"


class CommunicationPreference(str, enum.Enum):
    """Communication preference enumeration."""
    EMAIL = "email"
    PHONE = "phone"
    SMS = "sms"
    WHATSAPP = "whatsapp"


# Curriculum Management Enums

class CurriculumStatus(str, enum.Enum):
    """Curriculum status enumeration."""
    ACTIVE = "active"
    INACTIVE = "inactive"
    DRAFT = "draft"
    ARCHIVED = "archived"


class DifficultyLevel(str, enum.Enum):
    """Difficulty level enumeration."""
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"


class EquipmentType(str, enum.Enum):
    """Equipment type enumeration."""
    SAFETY = "safety"
    INSTRUCTIONAL = "instructional"
    ASSESSMENT = "assessment"
    ENHANCEMENT = "enhancement"


class RubricType(str, enum.Enum):
    """Assessment rubric type enumeration."""
    FORMATIVE = "formative"
    SUMMATIVE = "summative"
    DIAGNOSTIC = "diagnostic"


class MediaType(str, enum.Enum):
    """Media file type enumeration."""
    VIDEO = "video"
    AUDIO = "audio"
    DOCUMENT = "document"
    IMAGE = "image"
    INTERACTIVE = "interactive"


class ContentType(str, enum.Enum):
    """Content type enumeration for versioning."""
    PROGRAM = "program"
    COURSE = "course"
    CURRICULUM = "curriculum"
    LEVEL = "level"
    MODULE = "module"
    SECTION = "section"
    LESSON = "lesson"
    RUBRIC = "rubric"
    EQUIPMENT = "equipment"