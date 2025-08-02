from fastapi import APIRouter
from app.api.api_v1.endpoints import health
from app.features.authentication.routes import auth, users
from app.features.parents.routes import parents
from app.features.students.routes import students_router
from app.features.enrollments.routes import router as course_assignments_router
from app.features.programs.routes import programs
from app.features.courses.routes import courses, advanced
from app.features.curricula.routes import curricula, levels, modules, sections
from app.features.content.routes import lessons, assessments, content_versions
from app.features.equipment.routes import equipment
from app.features.media.routes import media
from app.features.progression.routes import progression
from app.features.facilities.routes import facilities
from app.features.scheduling.routes import sessions_router, integration_router
from app.features.teams.routes import teams
from app.features.organizations.routes import (
    organizations_router,
    partner_auth_router,
    payment_overrides_router
)
from app.features.profiles.routes_simple import router as profiles_router

api_router = APIRouter()

api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(students_router, prefix="/students", tags=["students"])
api_router.include_router(course_assignments_router, prefix="/course-assignments", tags=["course-assignments"])
api_router.include_router(parents.router, prefix="/parents", tags=["parents"])

# Course management routes
api_router.include_router(courses.router, prefix="/courses", tags=["courses"])
api_router.include_router(advanced.router, prefix="/courses/advanced", tags=["course-advanced"])

# Curricula management routes (separate top-level)
api_router.include_router(curricula.router, prefix="/curricula", tags=["curricula"])
api_router.include_router(levels.router, prefix="/curricula/levels", tags=["curricula-levels"])
api_router.include_router(modules.router, prefix="/curricula/modules", tags=["curricula-modules"])
api_router.include_router(sections.router, prefix="/curricula/sections", tags=["curricula-sections"])

# Content management routes (separate top-level)
api_router.include_router(lessons.router, prefix="/content/lessons", tags=["content-lessons"])
api_router.include_router(assessments.router, prefix="/content/assessments", tags=["content-assessments"])
api_router.include_router(content_versions.router, prefix="/content/versions", tags=["content-versions"])

# Equipment management routes (separate top-level)
api_router.include_router(equipment.router, prefix="/equipment", tags=["equipment"])

# Media management routes (separate top-level)  
api_router.include_router(media.router, prefix="/media", tags=["media"])

# Progression tracking routes (separate top-level)
api_router.include_router(progression.router, prefix="/progression", tags=["progression"])

# Program management routes (separate top-level)
api_router.include_router(programs.router, prefix="/programs", tags=["programs"])

# Facility management routes (separate top-level)
api_router.include_router(facilities.router, prefix="/facilities", tags=["facilities"])

# Scheduling routes (separate top-level)
api_router.include_router(sessions_router, prefix="/scheduling/sessions", tags=["scheduling-sessions"])
api_router.include_router(integration_router, prefix="/scheduling/integration", tags=["scheduling-integration"])

# Teams management routes (separate top-level)
api_router.include_router(teams.router, prefix="/teams", tags=["teams"])

# Organization management routes (separate top-level)  
api_router.include_router(organizations_router, prefix="/organizations", tags=["organizations"])
api_router.include_router(partner_auth_router, prefix="/organizations/auth", tags=["partner-auth"])
api_router.include_router(payment_overrides_router, prefix="/organizations", tags=["payment-overrides"])

# Unified profile creation routes (separate top-level)
api_router.include_router(profiles_router, prefix="/profiles", tags=["profiles"])