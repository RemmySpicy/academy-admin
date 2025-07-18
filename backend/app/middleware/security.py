"""
Security middleware for Academy Admin API
"""
from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi.responses import JSONResponse
import time
import logging
from collections import defaultdict
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Middleware to add security headers to all responses
    """
    
    def __init__(self, app, hsts_max_age: int = 31536000, csp_policy: str = None):
        super().__init__(app)
        self.hsts_max_age = hsts_max_age
        self.csp_policy = csp_policy or (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "font-src 'self' data:; "
            "connect-src 'self' https://api.academy.com; "
            "frame-ancestors 'none';"
        )
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response = await call_next(request)
        
        # Security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Content-Security-Policy"] = self.csp_policy
        response.headers["Permissions-Policy"] = (
            "geolocation=(), microphone=(), camera=(), "
            "payment=(), usb=(), magnetometer=(), gyroscope=(), "
            "accelerometer=(), ambient-light-sensor=(), "
            "autoplay=(), encrypted-media=(), fullscreen=(), "
            "picture-in-picture=(), sync-xhr=()"
        )
        
        # HSTS header for HTTPS
        if request.url.scheme == "https":
            response.headers["Strict-Transport-Security"] = (
                f"max-age={self.hsts_max_age}; includeSubDomains; preload"
            )
        
        # Remove server information
        response.headers.pop("server", None)
        
        return response


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Simple rate limiting middleware
    """
    
    def __init__(
        self,
        app,
        calls: int = 100,
        period: int = 60,
        per_ip: bool = True,
        per_user: bool = False,
        exclude_paths: list = None
    ):
        super().__init__(app)
        self.calls = calls
        self.period = period
        self.per_ip = per_ip
        self.per_user = per_user
        self.exclude_paths = exclude_paths or ["/health", "/docs", "/openapi.json"]
        self.requests = defaultdict(list)
        self.blocked_ips = defaultdict(datetime)
    
    def _get_client_ip(self, request: Request) -> str:
        """Get client IP address"""
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"
    
    def _is_rate_limited(self, identifier: str) -> bool:
        """Check if identifier is rate limited"""
        now = time.time()
        
        # Clean old requests
        self.requests[identifier] = [
            req_time for req_time in self.requests[identifier]
            if now - req_time < self.period
        ]
        
        # Check if rate limited
        if len(self.requests[identifier]) >= self.calls:
            return True
        
        # Add current request
        self.requests[identifier].append(now)
        return False
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Skip rate limiting for excluded paths
        if any(request.url.path.startswith(path) for path in self.exclude_paths):
            return await call_next(request)
        
        # Get identifier for rate limiting
        identifier = self._get_client_ip(request)
        
        # Check if IP is temporarily blocked
        if identifier in self.blocked_ips:
            if datetime.now() < self.blocked_ips[identifier]:
                return JSONResponse(
                    status_code=429,
                    content={
                        "error": "Rate limit exceeded",
                        "message": "Too many requests. Please try again later.",
                        "retry_after": int((self.blocked_ips[identifier] - datetime.now()).total_seconds())
                    }
                )
            else:
                # Remove expired block
                del self.blocked_ips[identifier]
        
        # Check rate limit
        if self._is_rate_limited(identifier):
            # Block IP for extended period after rate limit
            self.blocked_ips[identifier] = datetime.now() + timedelta(minutes=5)
            
            logger.warning(f"Rate limit exceeded for IP: {identifier}")
            return JSONResponse(
                status_code=429,
                content={
                    "error": "Rate limit exceeded",
                    "message": f"Too many requests. Maximum {self.calls} requests per {self.period} seconds allowed.",
                    "retry_after": self.period
                }
            )
        
        return await call_next(request)


class LoggingMiddleware(BaseHTTPMiddleware):
    """
    Request/Response logging middleware
    """
    
    def __init__(self, app, log_requests: bool = True, log_responses: bool = True):
        super().__init__(app)
        self.log_requests = log_requests
        self.log_responses = log_responses
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start_time = time.time()
        
        # Log request
        if self.log_requests:
            client_ip = request.client.host if request.client else "unknown"
            logger.info(
                f"Request: {request.method} {request.url.path} "
                f"from {client_ip} "
                f"User-Agent: {request.headers.get('user-agent', 'unknown')}"
            )
        
        # Process request
        response = await call_next(request)
        
        # Calculate processing time
        process_time = time.time() - start_time
        
        # Log response
        if self.log_responses:
            logger.info(
                f"Response: {response.status_code} "
                f"for {request.method} {request.url.path} "
                f"in {process_time:.4f}s"
            )
        
        # Add processing time header
        response.headers["X-Process-Time"] = str(process_time)
        
        return response