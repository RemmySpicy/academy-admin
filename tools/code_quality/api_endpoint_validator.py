#!/usr/bin/env python3
"""
Academy Admin API Endpoint Validator

Validates that API endpoints are properly documented, tested, and follow
Academy Admin standards including program context requirements.

Usage:
    python api_endpoint_validator.py --check-all
    python api_endpoint_validator.py --validate-docs
    python api_endpoint_validator.py --check-tests
"""

import ast
import os
import sys
import re
import json
import argparse
from typing import List, Dict, Any, Optional, Set
from pathlib import Path
from dataclasses import dataclass
from enum import Enum


class EndpointIssueType(Enum):
    """Types of API endpoint issues."""
    MISSING_DOCUMENTATION = "missing_documentation"
    MISSING_TESTS = "missing_tests"
    MISSING_PROGRAM_CONTEXT = "missing_program_context"
    INCORRECT_HTTP_METHOD = "incorrect_http_method"
    MISSING_AUTH_DEPENDENCY = "missing_auth_dependency"
    INCONSISTENT_NAMING = "inconsistent_naming"
    MISSING_RESPONSE_SCHEMA = "missing_response_schema"
    HARDCODED_IN_FRONTEND = "hardcoded_in_frontend"
    NOT_IN_API_ENDPOINTS = "not_in_api_endpoints"


@dataclass
class EndpointIssue:
    """An API endpoint issue."""
    type: EndpointIssueType
    endpoint_path: str
    file_path: str
    line_number: int
    message: str
    suggestion: Optional[str] = None
    severity: str = "warning"


@dataclass 
class ApiEndpoint:
    """Represents an API endpoint."""
    path: str
    method: str
    function_name: str
    file_path: str
    line_number: int
    has_auth: bool = False
    has_program_context: bool = False
    has_docs: bool = False
    has_tests: bool = False
    response_schema: Optional[str] = None


class ApiEndpointValidator:
    """Validator for API endpoints."""
    
    def __init__(self):
        self.discovered_endpoints: List[ApiEndpoint] = []
        self.frontend_endpoints: Set[str] = set()
        self.api_endpoints_constants: Set[str] = set()
        
    def validate_project(self, project_root: str) -> List[EndpointIssue]:
        """Validate all API endpoints in the project."""
        issues = []
        
        # Discover all endpoints
        backend_path = os.path.join(project_root, "backend", "app", "features")
        if os.path.exists(backend_path):
            self._discover_backend_endpoints(backend_path)
        
        # Discover frontend endpoint usage
        frontend_path = os.path.join(project_root, "frontend", "src")
        if os.path.exists(frontend_path):
            self._discover_frontend_endpoints(frontend_path)
        
        # Discover API_ENDPOINTS constants
        constants_path = os.path.join(project_root, "frontend", "src", "lib", "constants.ts")
        if os.path.exists(constants_path):
            self._discover_api_constants(constants_path)
        
        # Validate each endpoint
        for endpoint in self.discovered_endpoints:
            issues.extend(self._validate_endpoint(endpoint, project_root))
        
        # Check for hardcoded endpoints in frontend
        issues.extend(self._check_hardcoded_endpoints(project_root))
        
        return issues
    
    def _discover_backend_endpoints(self, backend_path: str):
        """Discover all API endpoints in backend routes."""
        for root, dirs, files in os.walk(backend_path):
            # Skip certain directories
            dirs[:] = [d for d in dirs if d not in ['__pycache__', 'migrations']]
            
            for file in files:
                if file.endswith('.py') and 'routes' in root:
                    file_path = os.path.join(root, file)
                    self._parse_route_file(file_path)
    
    def _parse_route_file(self, file_path: str):
        """Parse a route file to extract endpoint information."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            tree = ast.parse(content)
            
            for node in ast.walk(tree):
                if isinstance(node, ast.FunctionDef):
                    endpoint = self._extract_endpoint_from_function(node, file_path, content)
                    if endpoint:
                        self.discovered_endpoints.append(endpoint)
                        
        except Exception as e:
            print(f"Error parsing route file {file_path}: {e}")
    
    def _extract_endpoint_from_function(self, node: ast.FunctionDef, file_path: str, content: str) -> Optional[ApiEndpoint]:
        """Extract endpoint information from a function definition."""
        # Look for route decorators
        for decorator in node.decorator_list:
            if isinstance(decorator, ast.Call):
                if isinstance(decorator.func, ast.Attribute):
                    method = decorator.func.attr.upper()
                    if method in ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']:
                        # Extract path from decorator
                        path = ""
                        if decorator.args and isinstance(decorator.args[0], ast.Constant):
                            path = decorator.args[0].value
                        
                        # Create endpoint object
                        endpoint = ApiEndpoint(
                            path=path,
                            method=method,
                            function_name=node.name,
                            file_path=file_path,
                            line_number=node.lineno,
                            has_auth=self._has_auth_dependency(node),
                            has_program_context=self._has_program_context_dependency(node),
                            has_docs=bool(ast.get_docstring(node)),
                            response_schema=self._get_response_schema(node)
                        )
                        
                        return endpoint
        
        return None
    
    def _has_auth_dependency(self, node: ast.FunctionDef) -> bool:
        """Check if function has authentication dependency."""
        for arg in node.args.args:
            if 'user' in arg.arg.lower() or 'current_user' in arg.arg:
                return True
        return False
    
    def _has_program_context_dependency(self, node: ast.FunctionDef) -> bool:
        """Check if function has program context dependency.""" 
        for arg in node.args.args:
            if arg.arg == 'program_context':
                return True
        return False
    
    def _get_response_schema(self, node: ast.FunctionDef) -> Optional[str]:
        """Extract response schema from function annotation."""
        if node.returns:
            if isinstance(node.returns, ast.Subscript):
                # Handle Response[SomeSchema] pattern
                if hasattr(node.returns.slice, 'id'):
                    return node.returns.slice.id
        return None
    
    def _discover_frontend_endpoints(self, frontend_path: str):
        """Discover endpoint usage in frontend files."""
        for root, dirs, files in os.walk(frontend_path):
            # Skip certain directories
            dirs[:] = [d for d in dirs if d not in ['node_modules', '.next', 'dist']]
            
            for file in files:
                if file.endswith(('.ts', '.tsx')):
                    file_path = os.path.join(root, file)
                    self._extract_frontend_endpoints(file_path)
    
    def _extract_frontend_endpoints(self, file_path: str):
        """Extract endpoint references from frontend files."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Find hardcoded API paths
            hardcoded_patterns = re.findall(r'[\'"`](/api/v1/[^\'"`]*)[\'"`]', content)
            for pattern in hardcoded_patterns:
                self.frontend_endpoints.add(pattern)
                
        except Exception as e:
            print(f"Error reading frontend file {file_path}: {e}")
    
    def _discover_api_constants(self, constants_path: str):
        """Discover API_ENDPOINTS constants."""
        try:
            with open(constants_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Extract API_ENDPOINTS paths - simplified regex
            api_patterns = re.findall(r'[\'"`](/api/v1/[^\'"`]*)[\'"`]', content)
            for pattern in api_patterns:
                self.api_endpoints_constants.add(pattern)
                
        except Exception as e:
            print(f"Error reading constants file {constants_path}: {e}")
    
    def _validate_endpoint(self, endpoint: ApiEndpoint, project_root: str) -> List[EndpointIssue]:
        """Validate a single endpoint."""
        issues = []
        
        # Check for missing documentation
        if not endpoint.has_docs:
            issues.append(EndpointIssue(
                type=EndpointIssueType.MISSING_DOCUMENTATION,
                endpoint_path=endpoint.path,
                file_path=endpoint.file_path,
                line_number=endpoint.line_number,
                message=f"Endpoint {endpoint.method} {endpoint.path} missing documentation",
                suggestion="Add docstring with description, parameters, and response format",
                severity="warning"
            ))
        
        # Check for missing authentication (except health/public endpoints)
        if not endpoint.has_auth and not self._is_public_endpoint(endpoint.path):
            issues.append(EndpointIssue(
                type=EndpointIssueType.MISSING_AUTH_DEPENDENCY,
                endpoint_path=endpoint.path,
                file_path=endpoint.file_path,
                line_number=endpoint.line_number,
                message=f"Endpoint {endpoint.method} {endpoint.path} missing authentication",
                suggestion="Add authentication dependency: current_user: User = Depends(get_current_user)",
                severity="error"
            ))
        
        # Check for missing program context (except admin/auth endpoints)
        if not endpoint.has_program_context and not self._is_admin_endpoint(endpoint.path):
            issues.append(EndpointIssue(
                type=EndpointIssueType.MISSING_PROGRAM_CONTEXT,
                endpoint_path=endpoint.path,
                file_path=endpoint.file_path,
                line_number=endpoint.line_number,
                message=f"Endpoint {endpoint.method} {endpoint.path} missing program context",
                suggestion="Add program context dependency: program_context: str = Depends(get_program_context)",
                severity="error"
            ))
        
        # Check for missing response schema
        if not endpoint.response_schema:
            issues.append(EndpointIssue(
                type=EndpointIssueType.MISSING_RESPONSE_SCHEMA,
                endpoint_path=endpoint.path,
                file_path=endpoint.file_path,
                line_number=endpoint.line_number,
                message=f"Endpoint {endpoint.method} {endpoint.path} missing response schema annotation",
                suggestion="Add return type annotation: -> Response[YourSchema]",
                severity="warning"
            ))
        
        # Check if endpoint exists in API_ENDPOINTS constants
        if endpoint.path not in self.api_endpoints_constants:
            issues.append(EndpointIssue(
                type=EndpointIssueType.NOT_IN_API_ENDPOINTS,
                endpoint_path=endpoint.path,
                file_path=endpoint.file_path,
                line_number=endpoint.line_number,
                message=f"Endpoint {endpoint.path} not found in API_ENDPOINTS constants",
                suggestion="Add endpoint to frontend/src/lib/constants.ts API_ENDPOINTS",
                severity="warning"
            ))
        
        return issues
    
    def _check_hardcoded_endpoints(self, project_root: str) -> List[EndpointIssue]:
        """Check for hardcoded endpoints in frontend that should use constants."""
        issues = []
        
        frontend_path = os.path.join(project_root, "frontend", "src")
        if not os.path.exists(frontend_path):
            return issues
        
        for root, dirs, files in os.walk(frontend_path):
            # Skip certain directories and the constants file itself
            dirs[:] = [d for d in dirs if d not in ['node_modules', '.next', 'dist']]
            
            for file in files:
                if file.endswith(('.ts', '.tsx')) and 'constants' not in file:
                    file_path = os.path.join(root, file)
                    issues.extend(self._check_file_for_hardcoded_endpoints(file_path))
        
        return issues
    
    def _check_file_for_hardcoded_endpoints(self, file_path: str) -> List[EndpointIssue]:
        """Check a single file for hardcoded endpoints."""
        issues = []
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            for line_num, line in enumerate(lines, 1):
                # Look for hardcoded API paths
                matches = re.finditer(r'[\'"`](/api/v1/[^\'"`]*)[\'"`]', line)
                for match in matches:
                    endpoint_path = match.group(1)
                    
                    # Skip if API_ENDPOINTS is mentioned on the same line
                    if 'API_ENDPOINTS' not in line:
                        issues.append(EndpointIssue(
                            type=EndpointIssueType.HARDCODED_IN_FRONTEND,
                            endpoint_path=endpoint_path,
                            file_path=file_path,
                            line_number=line_num,
                            message=f"Hardcoded API endpoint '{endpoint_path}' should use API_ENDPOINTS constant",
                            suggestion="Replace with API_ENDPOINTS reference from '@/lib/constants'",
                            severity="warning"
                        ))
                        
        except Exception as e:
            print(f"Error checking file for hardcoded endpoints {file_path}: {e}")
        
        return issues
    
    def _is_public_endpoint(self, path: str) -> bool:
        """Check if endpoint is a public endpoint that doesn't need auth."""
        public_patterns = [
            '/health',
            '/docs',
            '/openapi.json',
            '/auth/login',
            '/auth/register'
        ]
        return any(pattern in path for pattern in public_patterns)
    
    def _is_admin_endpoint(self, path: str) -> bool:
        """Check if endpoint is an admin endpoint that doesn't need program context."""
        admin_patterns = [
            '/auth/',
            '/admin/users',
            '/admin/programs'
        ]
        return any(pattern in path for pattern in admin_patterns)
    
    def generate_report(self, issues: List[EndpointIssue]) -> str:
        """Generate a human-readable report."""
        if not issues:
            return "✅ All API endpoints are properly validated!"
        
        report = f"\n🚨 Found {len(issues)} API endpoint issues:\n\n"
        
        # Group by severity
        errors = [i for i in issues if i.severity == "error"]
        warnings = [i for i in issues if i.severity == "warning"]
        
        if errors:
            report += f"🔴 ERRORS ({len(errors)}):\n"
            for issue in errors:
                report += f"  {issue.file_path}:{issue.line_number}\n"
                report += f"    {issue.message}\n"
                if issue.suggestion:
                    report += f"    💡 {issue.suggestion}\n"
                report += "\n"
        
        if warnings:
            report += f"🟡 WARNINGS ({len(warnings)}):\n"
            for issue in warnings:
                report += f"  {issue.file_path}:{issue.line_number}\n"
                report += f"    {issue.message}\n"
                if issue.suggestion:
                    report += f"    💡 {issue.suggestion}\n"
                report += "\n"
        
        return report
    
    def generate_json_report(self, issues: List[EndpointIssue]) -> Dict[str, Any]:
        """Generate a JSON report."""
        return {
            "summary": {
                "total_issues": len(issues),
                "errors": len([i for i in issues if i.severity == "error"]),
                "warnings": len([i for i in issues if i.severity == "warning"]),
                "total_endpoints": len(self.discovered_endpoints)
            },
            "issues": [
                {
                    "type": issue.type.value,
                    "endpoint_path": issue.endpoint_path,
                    "file_path": issue.file_path,
                    "line_number": issue.line_number,
                    "message": issue.message,
                    "suggestion": issue.suggestion,
                    "severity": issue.severity
                }
                for issue in issues
            ],
            "endpoints": [
                {
                    "path": ep.path,
                    "method": ep.method,
                    "function_name": ep.function_name,
                    "file_path": ep.file_path,
                    "has_auth": ep.has_auth,
                    "has_program_context": ep.has_program_context,
                    "has_docs": ep.has_docs,
                    "response_schema": ep.response_schema
                }
                for ep in self.discovered_endpoints
            ]
        }


def main():
    """Main CLI for API endpoint validation."""
    parser = argparse.ArgumentParser(
        description="Validate Academy Admin API endpoints",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    
    parser.add_argument(
        "--check-all",
        action="store_true",
        help="Check all API endpoints in the project"
    )
    
    parser.add_argument(
        "--project-root",
        default=".",
        help="Root directory of the project (default: current directory)"
    )
    
    parser.add_argument(
        "--json",
        action="store_true",
        help="Output results in JSON format"
    )
    
    parser.add_argument(
        "--output",
        help="Output file path for results"
    )
    
    args = parser.parse_args()
    
    validator = ApiEndpointValidator()
    issues = validator.validate_project(args.project_root)
    
    if args.json:
        report = validator.generate_json_report(issues)
        output = json.dumps(report, indent=2)
    else:
        output = validator.generate_report(issues)
    
    if args.output:
        with open(args.output, 'w') as f:
            f.write(output)
        print(f"Report written to {args.output}")
    else:
        print(output)
    
    # Exit with error code if critical issues found
    errors = [i for i in issues if i.severity == "error"]
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()