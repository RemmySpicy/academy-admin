from fastapi import APIRouter
from app.api.api_v1.endpoints import health
from app.features.authentication.routes import auth
from app.features.students.routes import students

api_router = APIRouter()

api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(students.router, prefix="/students", tags=["students"])