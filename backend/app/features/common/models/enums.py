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
    active = "active"
    paused = "paused"
    completed = "completed"
    withdrawn = "withdrawn"
    waitlisted = "waitlisted"


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
    INSTRUCTOR = "instructor"
    STUDENT = "student"
    PARENT = "parent"


class ProfileType(str, enum.Enum):
    """User profile type enumeration."""
    full_user = "full_user"
    profile_only = "profile_only"


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
    male = "male"
    female = "female"
    other = "other"
    prefer_not_to_say = "prefer_not_to_say"


class CommunicationPreference(str, enum.Enum):
    """Communication preference enumeration."""
    EMAIL = "email"
    PHONE = "phone"
    SMS = "sms"
    WHATSAPP = "whatsapp"


# Curriculum Management Enums

class CurriculumStatus(str, enum.Enum):
    """Curriculum status enumeration."""
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    DRAFT = "DRAFT"
    ARCHIVED = "ARCHIVED"


class DifficultyLevel(str, enum.Enum):
    """Difficulty level enumeration."""
    BEGINNER = "BEGINNER"
    INTERMEDIATE = "INTERMEDIATE"
    ADVANCED = "ADVANCED"
    EXPERT = "EXPERT"


class EquipmentType(str, enum.Enum):
    """Equipment type enumeration."""
    SAFETY = "SAFETY"
    INSTRUCTIONAL = "INSTRUCTIONAL"
    ASSESSMENT = "ASSESSMENT"
    ENHANCEMENT = "ENHANCEMENT"


class RubricType(str, enum.Enum):
    """Assessment rubric type enumeration."""
    FORMATIVE = "FORMATIVE"
    SUMMATIVE = "SUMMATIVE"
    DIAGNOSTIC = "DIAGNOSTIC"


class MediaType(str, enum.Enum):
    """Media file type enumeration."""
    VIDEO = "VIDEO"
    AUDIO = "AUDIO"
    DOCUMENT = "DOCUMENT"
    IMAGE = "IMAGE"
    INTERACTIVE = "INTERACTIVE"


class ContentType(str, enum.Enum):
    """Content type enumeration for versioning."""
    PROGRAM = "PROGRAM"
    COURSE = "COURSE"
    CURRICULUM = "CURRICULUM"
    LEVEL = "LEVEL"
    MODULE = "MODULE"
    SECTION = "SECTION"
    LESSON = "LESSON"
    RUBRIC = "RUBRIC"
    EQUIPMENT = "EQUIPMENT"


class LessonType(str, enum.Enum):
    """Lesson type enumeration."""
    VIDEO = "video"
    TEXT = "text"
    INTERACTIVE = "interactive"
    PRACTICAL = "practical"


class AssessmentType(str, enum.Enum):
    """Assessment type enumeration."""
    QUIZ = "QUIZ"
    ASSIGNMENT = "ASSIGNMENT"
    PRACTICAL = "PRACTICAL"
    PROJECT = "PROJECT"


# Scheduling Management Enums

class SessionStatus(str, enum.Enum):
    """Scheduled session status enumeration."""
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    POSTPONED = "postponed"


class SessionType(str, enum.Enum):
    """Session type enumeration based on updated requirements."""
    PRIVATE = "private"  # 1-2 participants
    GROUP = "group"  # 3-5 participants  
    SCHOOL_GROUP = "school_group"  # Unlimited participants
    
    # Legacy support - keeping these for backward compatibility
    GROUP_LESSON = "group_lesson"
    PRIVATE_LESSON = "private_lesson"
    ASSESSMENT = "assessment"
    PRACTICE = "practice"
    COMPETITION = "competition"
    WORKSHOP = "workshop"
    MEETING = "meeting"


class RecurringPattern(str, enum.Enum):
    """Recurring pattern enumeration."""
    NONE = "none"
    DAILY = "daily"
    WEEKLY = "weekly"
    BIWEEKLY = "biweekly"
    MONTHLY = "monthly"
    CUSTOM = "custom"  # For custom day patterns from frontend


class ParticipantStatus(str, enum.Enum):
    """Session participant status enumeration."""
    ENROLLED = "enrolled"
    WAITLISTED = "waitlisted"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"


class NotificationStatus(str, enum.Enum):
    """Notification status enumeration."""
    PENDING = "pending"
    SENT = "sent"
    FAILED = "failed"
    SCHEDULED = "scheduled"


# Organization Management Enums

class OrganizationStatus(str, enum.Enum):
    """Organization status enumeration."""
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    PENDING = "pending"


class MembershipType(str, enum.Enum):
    """Organization membership type enumeration."""
    SPONSORED = "sponsored"
    AFFILIATE = "affiliate"
    PARTNER = "partner"


# Program Assignment Enums

class ProgramRole(str, enum.Enum):
    """Role in program enumeration."""
    STUDENT = "student"
    PARENT = "parent"
    BOTH = "both"


class AssignmentType(str, enum.Enum):
    """Course assignment type enumeration."""
    DIRECT = "DIRECT"
    PARENT_ASSIGNED = "PARENT_ASSIGNED"
    BULK_ASSIGNED = "BULK_ASSIGNED"


class PaymentStatus(str, enum.Enum):
    """Course enrollment payment status enumeration."""
    UNPAID = "unpaid"
    PARTIALLY_PAID = "partially_paid"
    FULLY_PAID = "fully_paid"