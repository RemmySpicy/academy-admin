from fastapi import APIRouter
from app.api.api_v1.endpoints import health
from app.features.authentication.routes import auth
from app.features.students.routes import students
from app.features.curriculum.routes import (
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

api_router = APIRouter()

api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(students.router, prefix="/students", tags=["students"])

# Curriculum management routes
api_router.include_router(programs.router, prefix="/curriculum/programs", tags=["curriculum-programs"])
api_router.include_router(courses.router, prefix="/curriculum/courses", tags=["curriculum-courses"])
api_router.include_router(curricula.router, prefix="/curriculum/curricula", tags=["curriculum-curricula"])
api_router.include_router(levels.router, prefix="/curriculum/levels", tags=["curriculum-levels"])
api_router.include_router(modules.router, prefix="/curriculum/modules", tags=["curriculum-modules"])
api_router.include_router(sections.router, prefix="/curriculum/sections", tags=["curriculum-sections"])
api_router.include_router(lessons.router, prefix="/curriculum/lessons", tags=["curriculum-lessons"])
api_router.include_router(assessments.router, prefix="/curriculum/assessments", tags=["curriculum-assessments"])
api_router.include_router(equipment.router, prefix="/curriculum/equipment", tags=["curriculum-equipment"])
api_router.include_router(media.router, prefix="/curriculum/media", tags=["curriculum-media"])
api_router.include_router(content_versions.router, prefix="/curriculum/content-versions", tags=["curriculum-content-versions"])
api_router.include_router(advanced.router, prefix="/curriculum/advanced", tags=["curriculum-advanced"])