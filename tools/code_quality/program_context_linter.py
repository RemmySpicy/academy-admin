#!/usr/bin/env python3
"""
Academy Admin Program Context Linter

Automated linting tool to enforce program context filtering standards
across all Academy Admin features.

Usage:
    python program_context_linter.py [path]
    python program_context_linter.py --check-all
    python program_context_linter.py --fix [path]
"""

import ast
import os
import sys
import re
import argparse
from typing import List, Dict, Any, Optional, Tuple
from pathlib import Path
from dataclasses import dataclass
from enum import Enum

class ViolationType(Enum):
    """Types of program context violations."""
    MISSING_PROGRAM_ID_FIELD = "missing_program_id_field"
    MISSING_PROGRAM_CONTEXT_PARAM = "missing_program_context_param"
    MISSING_PROGRAM_FILTERING = "missing_program_filtering"
    MISSING_SCHEMA_PROGRAM_ID = "missing_schema_program_id"
    MISSING_ROUTE_DEPENDENCY = "missing_route_dependency"
    INSECURE_QUERY = "insecure_query"
    MISSING_PROGRAM_VALIDATION = "missing_program_validation"
    # API Client Migration Violations (Added 2025-07-21)
    LEGACY_API_CLIENT_USAGE = "legacy_api_client_usage"
    HARDCODED_API_ENDPOINT = "hardcoded_api_endpoint"
    LEGACY_RESPONSE_HANDLING = "legacy_response_handling"
    MISSING_API_ENDPOINTS_IMPORT = "missing_api_endpoints_import"


@dataclass
class Violation:
    """A program context violation."""
    type: ViolationType
    file_path: str
    line_number: int
    column: int
    message: str
    suggestion: Optional[str] = None
    severity: str = "error"


class ProgramContextLinter:
    """Linter for enforcing program context filtering standards."""
    
    def __init__(self):
        self.violations: List[Violation] = []
        
        # Define exemptions for authentication and utility components
        self.exempt_file_patterns = [
            'authentication/schemas/auth.py',
            'authentication/services/auth_service.py',
        ]
        
        self.exempt_schema_patterns = [
            'Login', 'Token', 'Password', 'Refresh', 'Auth'
        ]
        
        self.exempt_method_patterns = [
            'verify_password', 'get_password_hash', 'create_access_token',
            'verify_token', 'authenticate_user'
        ]
        
    def lint_file(self, file_path: str) -> List[Violation]:
        """Lint a single file for program context violations."""
        if not file_path.endswith('.py'):
            return []
            
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
            tree = ast.parse(content)
            
            # Reset violations for this file
            file_violations = []
            
            # Check different types of files
            if self._is_model_file(file_path):
                file_violations.extend(self._check_model_file(tree, file_path))
            elif self._is_service_file(file_path):
                file_violations.extend(self._check_service_file(tree, file_path))
            elif self._is_schema_file(file_path):
                file_violations.extend(self._check_schema_file(tree, file_path))
            elif self._is_route_file(file_path):
                file_violations.extend(self._check_route_file(tree, file_path))
            elif self._is_frontend_api_file(file_path):
                file_violations.extend(self._check_frontend_api_file(file_path))
                
            return file_violations
            
        except Exception as e:
            print(f"Error parsing {file_path}: {e}")
            return []
    
    def _is_model_file(self, file_path: str) -> bool:
        """Check if file is a model file."""
        return 'models/' in file_path and file_path.endswith('.py')
    
    def _is_service_file(self, file_path: str) -> bool:
        """Check if file is a service file."""
        return 'services/' in file_path and file_path.endswith('.py')
    
    def _is_schema_file(self, file_path: str) -> bool:
        """Check if file is a schema file."""
        return 'schemas/' in file_path and file_path.endswith('.py')
    
    def _is_route_file(self, file_path: str) -> bool:
        """Check if file is a route file."""
        return 'routes/' in file_path and file_path.endswith('.py')
    
    def _is_frontend_api_file(self, file_path: str) -> bool:
        """Check if file is a frontend API file."""
        return (
            ('frontend/' in file_path or '/src/' in file_path) and 
            ('api/' in file_path or 'Api.ts' in file_path or 'api.ts' in file_path) and 
            (file_path.endswith('.ts') or file_path.endswith('.tsx'))
        )
    
    def _is_file_exempt(self, file_path: str) -> bool:
        """Check if file should be exempt from program context requirements."""
        return any(pattern in file_path for pattern in self.exempt_file_patterns)
    
    def _is_schema_exempt(self, schema_name: str) -> bool:
        """Check if schema should be exempt from program context requirements."""
        return any(pattern in schema_name for pattern in self.exempt_schema_patterns)
    
    def _is_method_exempt(self, method_name: str) -> bool:
        """Check if method should be exempt from program context requirements."""
        return any(pattern in method_name for pattern in self.exempt_method_patterns)
    
    def _check_model_file(self, tree: ast.AST, file_path: str) -> List[Violation]:
        """Check model file for program context violations."""
        violations = []
        
        for node in ast.walk(tree):
            if isinstance(node, ast.ClassDef):
                # Skip base classes and system models
                if node.name in ['BaseModel', 'User', 'Program']:
                    continue
                    
                # Check if class inherits from BaseModel
                if self._inherits_from_base_model(node):
                    # Check for program_id field
                    if not self._has_program_id_field(node):
                        violations.append(Violation(
                            type=ViolationType.MISSING_PROGRAM_ID_FIELD,
                            file_path=file_path,
                            line_number=node.lineno,
                            column=node.col_offset,
                            message=f"Model '{node.name}' missing required program_id field",
                            suggestion="Add: program_id: Mapped[str] = mapped_column(String(36), ForeignKey('programs.id'), nullable=False)",
                            severity="error"
                        ))
                    
                    # Check for program context indexes
                    if not self._has_program_context_indexes(node):
                        violations.append(Violation(
                            type=ViolationType.MISSING_PROGRAM_ID_FIELD,
                            file_path=file_path,
                            line_number=node.lineno,
                            column=node.col_offset,
                            message=f"Model '{node.name}' missing program context indexes",
                            suggestion="Add to __table_args__: Index('idx_{model_name}_program_id', 'program_id')",
                            severity="warning"
                        ))
        
        return violations
    
    def _check_service_file(self, tree: ast.AST, file_path: str) -> List[Violation]:
        """Check service file for program context violations."""
        violations = []
        
        # Skip exempt files
        if self._is_file_exempt(file_path):
            return violations
        
        for node in ast.walk(tree):
            if isinstance(node, ast.ClassDef):
                # Check if it's a service class
                if node.name.endswith('Service'):
                    violations.extend(self._check_service_methods(node, file_path))
        
        return violations
    
    def _check_service_methods(self, service_class: ast.ClassDef, file_path: str) -> List[Violation]:
        """Check service methods for program context violations."""
        violations = []
        
        # Methods that must have program_context parameter
        required_methods = [
            'create_', 'get_', 'update_', 'delete_', 'list_', 'bulk_'
        ]
        
        for node in service_class.body:
            if isinstance(node, ast.FunctionDef):
                method_name = node.name
                
                # Skip private methods and __init__
                if method_name.startswith('_') or method_name == '__init__':
                    continue
                
                # Skip exempt methods
                if self._is_method_exempt(method_name):
                    continue
                
                # Check if method needs program_context parameter
                needs_program_context = any(
                    method_name.startswith(prefix) for prefix in required_methods
                )
                
                if needs_program_context:
                    # Check for program_context parameter
                    if not self._has_program_context_param(node):
                        violations.append(Violation(
                            type=ViolationType.MISSING_PROGRAM_CONTEXT_PARAM,
                            file_path=file_path,
                            line_number=node.lineno,
                            column=node.col_offset,
                            message=f"Service method '{method_name}' missing program_context parameter",
                            suggestion="Add parameter: program_context: Optional[str] = None",
                            severity="error"
                        ))
                    
                    # Check for program filtering logic
                    if not self._has_program_filtering(node):
                        violations.append(Violation(
                            type=ViolationType.MISSING_PROGRAM_FILTERING,
                            file_path=file_path,
                            line_number=node.lineno,
                            column=node.col_offset,
                            message=f"Service method '{method_name}' missing program context filtering",
                            suggestion="Add: if program_context: query = query.filter(Model.program_id == program_context)",
                            severity="error"
                        ))
        
        return violations
    
    def _check_schema_file(self, tree: ast.AST, file_path: str) -> List[Violation]:
        """Check schema file for program context violations."""
        violations = []
        
        # Skip exempt files
        if self._is_file_exempt(file_path):
            return violations
        
        for node in ast.walk(tree):
            if isinstance(node, ast.ClassDef):
                class_name = node.name
                
                # Skip exempt schemas
                if self._is_schema_exempt(class_name):
                    continue
                
                # Check Create schemas
                if class_name.endswith('Create'):
                    if not self._has_program_id_field_in_schema(node):
                        violations.append(Violation(
                            type=ViolationType.MISSING_SCHEMA_PROGRAM_ID,
                            file_path=file_path,
                            line_number=node.lineno,
                            column=node.col_offset,
                            message=f"Create schema '{class_name}' missing program_id field",
                            suggestion="Add: program_id: str = Field(..., description='Program ID this entity belongs to')",
                            severity="error"
                        ))
                
                # Check Response schemas
                elif class_name.endswith('Response'):
                    # Skip exempt schemas
                    if self._is_schema_exempt(class_name):
                        continue
                        
                    if not self._has_program_id_field_in_schema(node):
                        violations.append(Violation(
                            type=ViolationType.MISSING_SCHEMA_PROGRAM_ID,
                            file_path=file_path,
                            line_number=node.lineno,
                            column=node.col_offset,
                            message=f"Response schema '{class_name}' missing program_id field",
                            suggestion="Add: program_id: str = Field(..., description='Program ID')",
                            severity="error"
                        ))
                
                # Check SearchParams schemas
                elif class_name.endswith('SearchParams'):
                    if not self._has_program_id_field_in_schema(node):
                        violations.append(Violation(
                            type=ViolationType.MISSING_SCHEMA_PROGRAM_ID,
                            file_path=file_path,
                            line_number=node.lineno,
                            column=node.col_offset,
                            message=f"SearchParams schema '{class_name}' missing program_id field",
                            suggestion="Add: program_id: Optional[str] = Field(None, description='Filter by program ID')",
                            severity="warning"
                        ))
        
        return violations
    
    def _check_route_file(self, tree: ast.AST, file_path: str) -> List[Violation]:
        """Check route file for program context violations."""
        violations = []
        
        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef):
                # Check if it's a route function (has decorator)
                if self._has_route_decorator(node):
                    # Check for program context dependency injection
                    if not self._has_program_context_dependency(node):
                        violations.append(Violation(
                            type=ViolationType.MISSING_ROUTE_DEPENDENCY,
                            file_path=file_path,
                            line_number=node.lineno,
                            column=node.col_offset,
                            message=f"Route function '{node.name}' missing program context dependency injection",
                            suggestion="Add parameter: program_context: Annotated[Optional[str], Depends(get_program_filter)]",
                            severity="error"
                        ))
        
        return violations
    
    def _inherits_from_base_model(self, node: ast.ClassDef) -> bool:
        """Check if class inherits from BaseModel."""
        for base in node.bases:
            if isinstance(base, ast.Name) and base.id == 'BaseModel':
                return True
        return False
    
    def _has_program_id_field(self, node: ast.ClassDef) -> bool:
        """Check if class has program_id field."""
        for item in node.body:
            if isinstance(item, ast.AnnAssign) and isinstance(item.target, ast.Name):
                if item.target.id == 'program_id':
                    return True
        return False
    
    def _has_program_context_indexes(self, node: ast.ClassDef) -> bool:
        """Check if class has program context indexes."""
        for item in node.body:
            if isinstance(item, ast.Assign):
                for target in item.targets:
                    if isinstance(target, ast.Name) and target.id == '__table_args__':
                        # Check if indexes include program_id
                        return True  # Simplified check
        return False
    
    def _has_program_context_param(self, node: ast.FunctionDef) -> bool:
        """Check if function has program_context parameter."""
        for arg in node.args.args:
            if arg.arg == 'program_context':
                return True
        return False
    
    def _has_program_filtering(self, node: ast.FunctionDef) -> bool:
        """Check if function has program context filtering logic."""
        # Look for filter pattern in function body
        for item in ast.walk(node):
            if isinstance(item, ast.Attribute) and item.attr == 'filter':
                # Check if filtering by program_id
                return True  # Simplified check
        return False
    
    def _has_program_id_field_in_schema(self, node: ast.ClassDef) -> bool:
        """Check if schema has program_id field."""
        for item in node.body:
            if isinstance(item, ast.AnnAssign) and isinstance(item.target, ast.Name):
                if item.target.id == 'program_id':
                    return True
        return False
    
    def _has_route_decorator(self, node: ast.FunctionDef) -> bool:
        """Check if function has route decorator."""
        for decorator in node.decorator_list:
            if isinstance(decorator, ast.Attribute):
                if decorator.attr in ['get', 'post', 'put', 'delete', 'patch']:
                    return True
        return False
    
    def _has_program_context_dependency(self, node: ast.FunctionDef) -> bool:
        """Check if route function has program context dependency."""
        for arg in node.args.args:
            if arg.arg == 'program_context':
                return True
        return False
    
    def _check_frontend_api_file(self, file_path: str) -> List[Violation]:
        """Check frontend API file for API client migration violations."""
        violations = []
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            lines = content.split('\n')
            
            for line_num, line in enumerate(lines, 1):
                line_stripped = line.strip()
                
                # Check for legacy apiClient imports
                if re.search(r'import.*\{.*apiClient.*\}.*from', line_stripped):
                    violations.append(Violation(
                        type=ViolationType.LEGACY_API_CLIENT_USAGE,
                        file_path=file_path,
                        line_number=line_num,
                        column=0,
                        message="Legacy apiClient import detected",
                        suggestion="Replace with: import { httpClient } from '@/lib/api/httpClient';",
                        severity="error"
                    ))
                
                # Check for legacy apiClient method calls
                if re.search(r'apiClient\.(get|post|put|delete|patch)', line_stripped):
                    violations.append(Violation(
                        type=ViolationType.LEGACY_API_CLIENT_USAGE,
                        file_path=file_path,
                        line_number=line_num,
                        column=0,
                        message="Legacy apiClient method call detected",
                        suggestion="Replace with httpClient.{method}() and handle {success, data, error} response format",
                        severity="error"
                    ))
                
                # Check for hardcoded API endpoints
                if re.search(r'[\'"`]/api/v1/[^\'"`]*[\'"`]', line_stripped) and 'API_ENDPOINTS' not in line_stripped:
                    violations.append(Violation(
                        type=ViolationType.HARDCODED_API_ENDPOINT,
                        file_path=file_path,
                        line_number=line_num,
                        column=0,
                        message="Hardcoded API endpoint detected",
                        suggestion="Replace with API_ENDPOINTS constant from '@/lib/constants'",
                        severity="warning"
                    ))
                
                # Check for legacy response handling patterns
                if re.search(r'isApiSuccess\(.*\)', line_stripped):
                    violations.append(Violation(
                        type=ViolationType.LEGACY_RESPONSE_HANDLING,
                        file_path=file_path,
                        line_number=line_num,
                        column=0,
                        message="Legacy isApiSuccess() pattern detected",
                        suggestion="Replace with: if (response.success && response.data)",
                        severity="warning"
                    ))
                
                # Check for missing API_ENDPOINTS import when hardcoded paths are found
                if re.search(r'[\'"`]/api/v1/', line_stripped) and 'API_ENDPOINTS' not in content:
                    violations.append(Violation(
                        type=ViolationType.MISSING_API_ENDPOINTS_IMPORT,
                        file_path=file_path,
                        line_number=line_num,
                        column=0,
                        message="Missing API_ENDPOINTS import",
                        suggestion="Add: import { API_ENDPOINTS } from '@/lib/constants';",
                        severity="warning"
                    ))
            
            return violations
            
        except Exception as e:
            print(f"Error checking frontend API file {file_path}: {e}")
            return []
    
    def lint_directory(self, directory: str) -> List[Violation]:
        """Lint all Python and TypeScript files in directory."""
        violations = []
        
        for root, dirs, files in os.walk(directory):
            # Skip certain directories
            dirs[:] = [d for d in dirs if d not in ['__pycache__', 'migrations', 'node_modules', '.next', 'dist', 'build']]
            
            for file in files:
                if file.endswith('.py') or file.endswith('.ts') or file.endswith('.tsx'):
                    file_path = os.path.join(root, file)
                    violations.extend(self.lint_file(file_path))
        
        return violations
    
    def generate_report(self, violations: List[Violation]) -> str:
        """Generate a human-readable report of violations."""
        if not violations:
            return "✅ No program context violations found!"
        
        report = []
        report.append("🚨 Program Context Violations Found:")
        report.append("=" * 60)
        
        # Group violations by file
        violations_by_file = {}
        for violation in violations:
            if violation.file_path not in violations_by_file:
                violations_by_file[violation.file_path] = []
            violations_by_file[violation.file_path].append(violation)
        
        for file_path, file_violations in violations_by_file.items():
            report.append(f"\n📄 {file_path}")
            report.append("-" * 40)
            
            for violation in file_violations:
                severity_icon = "🔴" if violation.severity == "error" else "🟡"
                report.append(f"{severity_icon} Line {violation.line_number}: {violation.message}")
                
                if violation.suggestion:
                    report.append(f"   💡 Suggestion: {violation.suggestion}")
                report.append("")
        
        # Summary
        error_count = sum(1 for v in violations if v.severity == "error")
        warning_count = sum(1 for v in violations if v.severity == "warning")
        
        report.append("=" * 60)
        report.append(f"📊 Summary: {error_count} errors, {warning_count} warnings")
        report.append("=" * 60)
        
        return "\n".join(report)
    
    def generate_json_report(self, violations: List[Violation]) -> Dict[str, Any]:
        """Generate JSON report of violations."""
        return {
            "violations": [
                {
                    "type": violation.type.value,
                    "file": violation.file_path,
                    "line": violation.line_number,
                    "column": violation.column,
                    "message": violation.message,
                    "suggestion": violation.suggestion,
                    "severity": violation.severity
                }
                for violation in violations
            ],
            "summary": {
                "total": len(violations),
                "errors": sum(1 for v in violations if v.severity == "error"),
                "warnings": sum(1 for v in violations if v.severity == "warning")
            }
        }


def main():
    """Main entry point for the linter."""
    parser = argparse.ArgumentParser(description="Academy Admin Program Context Linter")
    parser.add_argument("path", nargs="?", default=".", help="Path to lint")
    parser.add_argument("--check-all", action="store_true", help="Check all backend files")
    parser.add_argument("--json", action="store_true", help="Output JSON report")
    parser.add_argument("--strict", action="store_true", help="Treat warnings as errors")
    
    args = parser.parse_args()
    
    linter = ProgramContextLinter()
    
    if args.check_all:
        # Check all backend files
        backend_path = "backend/app/features"
        if os.path.exists(backend_path):
            violations = linter.lint_directory(backend_path)
        else:
            print(f"Backend path {backend_path} not found")
            return 1
    else:
        # Check specific path
        if os.path.isfile(args.path):
            violations = linter.lint_file(args.path)
        elif os.path.isdir(args.path):
            violations = linter.lint_directory(args.path)
        else:
            print(f"Path {args.path} not found")
            return 1
    
    if args.json:
        import json
        print(json.dumps(linter.generate_json_report(violations), indent=2))
    else:
        print(linter.generate_report(violations))
    
    # Return exit code based on violations
    error_count = sum(1 for v in violations if v.severity == "error")
    warning_count = sum(1 for v in violations if v.severity == "warning")
    
    if error_count > 0:
        return 1
    elif args.strict and warning_count > 0:
        return 1
    else:
        return 0


if __name__ == "__main__":
    sys.exit(main())