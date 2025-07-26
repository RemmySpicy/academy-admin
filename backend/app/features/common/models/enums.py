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
    INSTRUCTOR = "instructor"
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


class LessonType(str, enum.Enum):
    """Lesson type enumeration."""
    VIDEO = "video"
    TEXT = "text"
    INTERACTIVE = "interactive"
    PRACTICAL = "practical"


class AssessmentType(str, enum.Enum):
    """Assessment type enumeration."""
    QUIZ = "quiz"
    ASSIGNMENT = "assignment"
    PRACTICAL = "practical"
    PROJECT = "project"


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


class ProfileType(str, enum.Enum):
    """User profile type enumeration."""
    FULL_USER = "full_user"
    PROFILE_ONLY = "profile_only"