from fastapi import APIRouter
from app.api.api_v1.endpoints import health
from app.features.authentication.routes import auth, parents, users
from app.features.students.routes import students
from app.features.courses.routes import (
    programs,
    courses,
    curricula,
    levels,
    modules,
    sections,
    lessons,
    assessments,
    equipment,
    media,
    content_versions,
    advanced,
)
from app.features.facilities.routes import facilities
from app.features.scheduling.routes import sessions_router, integration_router
from app.features.teams.routes import teams

api_router = APIRouter()

api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(students.router, prefix="/students", tags=["students"])
api_router.include_router(parents.router, prefix="/parents", tags=["parents"])

# Course management routes (top-level)
api_router.include_router(courses.router, prefix="/courses", tags=["courses"])
api_router.include_router(curricula.router, prefix="/courses/curricula", tags=["course-curricula"])
api_router.include_router(levels.router, prefix="/courses/levels", tags=["course-levels"])
api_router.include_router(modules.router, prefix="/courses/modules", tags=["course-modules"])
api_router.include_router(sections.router, prefix="/courses/sections", tags=["course-sections"])
api_router.include_router(lessons.router, prefix="/courses/lessons", tags=["course-lessons"])
api_router.include_router(assessments.router, prefix="/courses/assessments", tags=["course-assessments"])
api_router.include_router(equipment.router, prefix="/courses/equipment", tags=["course-equipment"])
api_router.include_router(media.router, prefix="/courses/media", tags=["course-media"])
api_router.include_router(content_versions.router, prefix="/courses/content-versions", tags=["course-content-versions"])
api_router.include_router(advanced.router, prefix="/courses/advanced", tags=["course-advanced"])

# Program management routes (separate top-level)
api_router.include_router(programs.router, prefix="/programs", tags=["programs"])

# Facility management routes (separate top-level)
api_router.include_router(facilities.router, prefix="/facilities", tags=["facilities"])

# Scheduling routes (separate top-level)
api_router.include_router(sessions_router, prefix="/scheduling/sessions", tags=["scheduling-sessions"])
api_router.include_router(integration_router, prefix="/scheduling/integration", tags=["scheduling-integration"])

# Teams management routes (separate top-level)
api_router.include_router(teams.router, prefix="/teams", tags=["teams"])