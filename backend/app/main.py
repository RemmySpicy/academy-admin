from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.api_v1.api import api_router
from app.middleware import ProgramContextMiddleware
# from app.middleware.security import SecurityHeadersMiddleware, RateLimitMiddleware, LoggingMiddleware

# Import all models to ensure SQLAlchemy relationships are properly initialized
import app.models

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Academy Management System API",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Add middleware (order matters - add from innermost to outermost)
# Program context middleware - extracts X-Program-Context header
app.add_middleware(ProgramContextMiddleware)

# Security middleware (commented out - can be enabled when needed)
# app.add_middleware(SecurityHeadersMiddleware)
# app.add_middleware(RateLimitMiddleware, calls=100, period=60)
# app.add_middleware(LoggingMiddleware)

# CORS middleware - should be last in the chain
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {"message": "Academy Admin API is running", "version": settings.VERSION}