"""
Facilities feature package.

This module handles:
- Physical facility management
- Equipment and amenities tracking
- Facility-specific operations
- Student facility assignments
- Instructor facility assignments
- Facility-specific scheduling
- Facility utilization reporting
"""

from .models import Facility
from .schemas import (
    FacilityCreate,
    FacilityUpdate,
    FacilityResponse,
    FacilityListResponse,
    FacilitySearchParams,
    FacilityStatsResponse,
)
from .services import FacilityService, get_facility_service

__all__ = [
    "Facility",
    "FacilityCreate",
    "FacilityUpdate", 
    "FacilityResponse",
    "FacilityListResponse",
    "FacilitySearchParams",
    "FacilityStatsResponse",
    "FacilityService",
    "get_facility_service",
]