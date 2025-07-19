#!/usr/bin/env python3
"""
Academy Admin Test Coverage Checker

Specialized test coverage checker for ensuring program context filtering
test coverage across all Academy Admin features.

Usage:
    python test_coverage_checker.py [path]
    python test_coverage_checker.py --check-all
    python test_coverage_checker.py --generate-missing-tests
"""

import ast
import os
import sys
import re
import argparse
import json
from typing import List, Dict, Any, Optional, Set, Tuple
from pathlib import Path
from dataclasses import dataclass
from enum import Enum


class TestViolationType(Enum):
    """Types of test coverage violations."""
    MISSING_PROGRAM_CONTEXT_TESTS = "missing_program_context_tests"
    MISSING_CROSS_PROGRAM_ACCESS_TESTS = "missing_cross_program_access_tests"
    MISSING_ROLE_BASED_TESTS = "missing_role_based_tests"
    MISSING_SERVICE_TESTS = "missing_service_tests"
    MISSING_ROUTE_TESTS = "missing_route_tests"
    INCOMPLETE_TEST_COVERAGE = "incomplete_test_coverage"


@dataclass
class TestViolation:
    """A test coverage violation."""
    type: TestViolationType
    file_path: str
    missing_test: str
    message: str
    severity: str = "medium"
    suggested_test: Optional[str] = None


@dataclass
class ServiceMethod:
    """A service method that needs testing."""
    name: str
    file_path: str
    line_number: int
    has_program_context: bool
    needs_program_context_tests: bool


@dataclass
class RouteHandler:
    """A route handler that needs testing."""
    name: str
    file_path: str
    line_number: int
    http_method: str
    path: str
    has_program_context: bool


class TestCoverageChecker:
    """Test coverage checker for Academy Admin features."""
    
    def __init__(self):
        self.violations: List[TestViolation] = []
        self.service_methods: List[ServiceMethod] = []
        self.route_handlers: List[RouteHandler] = []
        self.existing_tests: Set[str] = set()
        
    def check_directory(self, directory: str) -> List[TestViolation]:
        """Check test coverage for all files in directory."""
        violations = []
        
        # First, scan for existing tests
        self._scan_existing_tests(directory)
        
        # Then scan for service methods and route handlers
        self._scan_service_methods(directory)
        self._scan_route_handlers(directory)
        
        # Check for missing tests
        violations.extend(self._check_service_test_coverage())
        violations.extend(self._check_route_test_coverage())
        violations.extend(self._check_program_context_test_coverage())
        
        return violations
    
    def _scan_existing_tests(self, directory: str) -> None:
        """Scan for existing test files and extract test names."""
        for root, dirs, files in os.walk(directory):
            # Skip non-test directories
            dirs[:] = [d for d in dirs if d not in ['__pycache__', 'migrations', 'node_modules']]
            
            for file in files:
                if file.startswith('test_') and file.endswith('.py'):
                    file_path = os.path.join(root, file)
                    self._extract_test_names(file_path)
    
    def _extract_test_names(self, file_path: str) -> None:
        """Extract test function names from test file."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            tree = ast.parse(content)
            
            for node in ast.walk(tree):
                if isinstance(node, ast.FunctionDef) and node.name.startswith('test_'):
                    self.existing_tests.add(node.name)
                elif isinstance(node, ast.ClassDef) and node.name.startswith('Test'):
                    # Extract methods from test classes
                    for class_node in node.body:
                        if isinstance(class_node, ast.FunctionDef) and class_node.name.startswith('test_'):
                            self.existing_tests.add(f"{node.name}.{class_node.name}")
        
        except Exception as e:
            print(f"Error scanning test file {file_path}: {e}")
    
    def _scan_service_methods(self, directory: str) -> None:
        """Scan for service methods that need testing."""
        for root, dirs, files in os.walk(directory):
            if 'services' in root:
                for file in files:
                    if file.endswith('.py') and not file.startswith('__'):
                        file_path = os.path.join(root, file)
                        self._extract_service_methods(file_path)
    
    def _extract_service_methods(self, file_path: str) -> None:
        """Extract service methods from service file."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            tree = ast.parse(content)
            
            for node in ast.walk(tree):
                if isinstance(node, ast.ClassDef) and node.name.endswith('Service'):
                    for class_node in node.body:
                        if isinstance(class_node, ast.FunctionDef):
                            method_name = class_node.name
                            
                            # Skip private methods and __init__
                            if method_name.startswith('_') or method_name == '__init__':
                                continue
                            
                            # Check if method has program_context parameter
                            has_program_context = any(
                                arg.arg == 'program_context' for arg in class_node.args.args
                            )
                            
                            # Check if method needs program context tests
                            needs_program_context_tests = any(
                                method_name.startswith(prefix) 
                                for prefix in ['create_', 'get_', 'update_', 'delete_', 'list_', 'bulk_']
                            )
                            
                            self.service_methods.append(ServiceMethod(
                                name=f"{node.name}.{method_name}",
                                file_path=file_path,
                                line_number=class_node.lineno,
                                has_program_context=has_program_context,
                                needs_program_context_tests=needs_program_context_tests
                            ))
        
        except Exception as e:
            print(f"Error scanning service file {file_path}: {e}")
    
    def _scan_route_handlers(self, directory: str) -> None:
        """Scan for route handlers that need testing."""
        for root, dirs, files in os.walk(directory):
            if 'routes' in root:
                for file in files:
                    if file.endswith('.py') and not file.startswith('__'):
                        file_path = os.path.join(root, file)
                        self._extract_route_handlers(file_path)
    
    def _extract_route_handlers(self, file_path: str) -> None:
        """Extract route handlers from route file."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            tree = ast.parse(content)
            
            for node in ast.walk(tree):
                if isinstance(node, ast.FunctionDef):
                    # Check for route decorators
                    http_method = None
                    path = None
                    
                    for decorator in node.decorator_list:
                        if isinstance(decorator, ast.Call):
                            if isinstance(decorator.func, ast.Attribute):
                                if decorator.func.attr in ['get', 'post', 'put', 'delete', 'patch']:
                                    http_method = decorator.func.attr
                                    if decorator.args:
                                        if isinstance(decorator.args[0], ast.Constant):
                                            path = decorator.args[0].value
                    
                    if http_method:
                        # Check if route has program_context parameter
                        has_program_context = any(
                            arg.arg == 'program_context' for arg in node.args.args
                        )
                        
                        self.route_handlers.append(RouteHandler(
                            name=node.name,
                            file_path=file_path,
                            line_number=node.lineno,
                            http_method=http_method,
                            path=path or "/",
                            has_program_context=has_program_context
                        ))
        
        except Exception as e:
            print(f"Error scanning route file {file_path}: {e}")
    
    def _check_service_test_coverage(self) -> List[TestViolation]:
        """Check test coverage for service methods."""
        violations = []
        
        for method in self.service_methods:
            # Generate expected test names
            service_name = method.name.split('.')[0]
            method_name = method.name.split('.')[1]
            
            expected_tests = [
                f"test_{method_name}",
                f"Test{service_name}.test_{method_name}",
                f"test_{service_name.lower()}_{method_name}",
            ]
            
            # Check if any expected test exists
            has_test = any(test in self.existing_tests for test in expected_tests)
            
            if not has_test:
                violations.append(TestViolation(
                    type=TestViolationType.MISSING_SERVICE_TESTS,
                    file_path=method.file_path,
                    missing_test=f"test_{method_name}",
                    message=f"Service method '{method.name}' has no test coverage",
                    severity="medium",
                    suggested_test=self._generate_service_test_template(method)
                ))
        
        return violations
    
    def _check_route_test_coverage(self) -> List[TestViolation]:
        """Check test coverage for route handlers."""
        violations = []
        
        for route in self.route_handlers:
            # Generate expected test names
            expected_tests = [
                f"test_{route.name}",
                f"test_{route.http_method}_{route.name}",
                f"test_route_{route.name}",
            ]
            
            # Check if any expected test exists
            has_test = any(test in self.existing_tests for test in expected_tests)
            
            if not has_test:
                violations.append(TestViolation(
                    type=TestViolationType.MISSING_ROUTE_TESTS,
                    file_path=route.file_path,
                    missing_test=f"test_{route.name}",
                    message=f"Route handler '{route.name}' ({route.http_method.upper()} {route.path}) has no test coverage",
                    severity="medium",
                    suggested_test=self._generate_route_test_template(route)
                ))
        
        return violations
    
    def _check_program_context_test_coverage(self) -> List[TestViolation]:
        """Check for program context specific test coverage."""
        violations = []
        
        # Check for required program context tests
        required_test_patterns = [
            "test_.*_program_context",
            "test_.*_cross_program_access",
            "test_.*_program_filtering",
            "test_.*_role_based_access",
        ]
        
        for method in self.service_methods:
            if method.needs_program_context_tests:
                service_name = method.name.split('.')[0]
                method_name = method.name.split('.')[1]
                
                # Check for program context tests
                program_context_tests = [
                    f"test_{method_name}_program_context",
                    f"test_{method_name}_cross_program_access",
                    f"Test{service_name}.test_{method_name}_program_filtering",
                ]
                
                has_program_context_test = any(
                    test in self.existing_tests for test in program_context_tests
                )
                
                if not has_program_context_test:
                    violations.append(TestViolation(
                        type=TestViolationType.MISSING_PROGRAM_CONTEXT_TESTS,
                        file_path=method.file_path,
                        missing_test=f"test_{method_name}_program_context",
                        message=f"Service method '{method.name}' missing program context filtering tests",
                        severity="high",
                        suggested_test=self._generate_program_context_test_template(method)
                    ))
                
                # Check for cross-program access prevention tests
                cross_program_tests = [
                    f"test_{method_name}_cross_program_access_denied",
                    f"test_{method_name}_program_isolation",
                ]
                
                has_cross_program_test = any(
                    test in self.existing_tests for test in cross_program_tests
                )
                
                if not has_cross_program_test:
                    violations.append(TestViolation(
                        type=TestViolationType.MISSING_CROSS_PROGRAM_ACCESS_TESTS,
                        file_path=method.file_path,
                        missing_test=f"test_{method_name}_cross_program_access_denied",
                        message=f"Service method '{method.name}' missing cross-program access prevention tests",
                        severity="high",
                        suggested_test=self._generate_cross_program_test_template(method)
                    ))
        
        return violations
    
    def _generate_service_test_template(self, method: ServiceMethod) -> str:
        """Generate test template for service method."""
        service_name = method.name.split('.')[0]
        method_name = method.name.split('.')[1]
        
        template = f"""
def test_{method_name}(self, db: Session):
    \"\"\"Test {method_name} method.\"\"\"
    # Arrange
    # TODO: Set up test data
    
    # Act
    result = {service_name.lower()}.{method_name}(db, ...)
    
    # Assert
    assert result is not None
    # TODO: Add specific assertions
"""
        return template.strip()
    
    def _generate_route_test_template(self, route: RouteHandler) -> str:
        """Generate test template for route handler."""
        template = f"""
def test_{route.name}(self, client: TestClient, auth_headers: dict):
    \"\"\"Test {route.name} route handler.\"\"\"
    # Arrange
    # TODO: Set up test data
    
    # Act
    response = client.{route.http_method}(
        "{route.path}",
        headers=auth_headers
    )
    
    # Assert
    assert response.status_code == 200
    # TODO: Add specific assertions
"""
        return template.strip()
    
    def _generate_program_context_test_template(self, method: ServiceMethod) -> str:
        """Generate program context test template."""
        service_name = method.name.split('.')[0]
        method_name = method.name.split('.')[1]
        
        template = f"""
def test_{method_name}_program_context(self, db: Session):
    \"\"\"Test {method_name} respects program context filtering.\"\"\"
    # Arrange
    program_a = create_test_program(db, name="Program A")
    program_b = create_test_program(db, name="Program B")
    
    # Create test data in different programs
    entity_a = create_test_entity(db, program_id=program_a.id)
    entity_b = create_test_entity(db, program_id=program_b.id)
    
    # Act - Test with program A context
    result_a = {service_name.lower()}.{method_name}(
        db, 
        program_context=program_a.id
    )
    
    # Act - Test with program B context
    result_b = {service_name.lower()}.{method_name}(
        db, 
        program_context=program_b.id
    )
    
    # Assert
    # Should only return entities from respective programs
    assert len(result_a) == 1
    assert len(result_b) == 1
    assert result_a[0].program_id == program_a.id
    assert result_b[0].program_id == program_b.id
"""
        return template.strip()
    
    def _generate_cross_program_test_template(self, method: ServiceMethod) -> str:
        """Generate cross-program access test template."""
        service_name = method.name.split('.')[0]
        method_name = method.name.split('.')[1]
        
        template = f"""
def test_{method_name}_cross_program_access_denied(self, db: Session):
    \"\"\"Test {method_name} prevents cross-program access.\"\"\"
    # Arrange
    program_a = create_test_program(db, name="Program A")
    program_b = create_test_program(db, name="Program B")
    
    # Create entity in program A
    entity_a = create_test_entity(db, program_id=program_a.id)
    
    # Act - Try to access entity from program A using program B context
    result = {service_name.lower()}.{method_name}(
        db, 
        entity_id=entity_a.id,
        program_context=program_b.id
    )
    
    # Assert - Should not be able to access entity from different program
    assert result is None
"""
        return template.strip()
    
    def generate_missing_test_files(self, violations: List[TestViolation]) -> Dict[str, str]:
        """Generate complete test files for missing tests."""
        test_files = {}
        
        # Group violations by file/feature
        violations_by_feature = {}
        for violation in violations:
            feature_name = self._extract_feature_name(violation.file_path)
            if feature_name not in violations_by_feature:
                violations_by_feature[feature_name] = []
            violations_by_feature[feature_name].append(violation)
        
        # Generate test file for each feature
        for feature_name, feature_violations in violations_by_feature.items():
            test_file_content = self._generate_test_file_template(feature_name, feature_violations)
            test_files[f"test_{feature_name}.py"] = test_file_content
        
        return test_files
    
    def _extract_feature_name(self, file_path: str) -> str:
        """Extract feature name from file path."""
        # Extract feature name from path like "backend/app/features/students/services/student_service.py"
        parts = file_path.split('/')
        if 'features' in parts:
            feature_index = parts.index('features')
            if feature_index + 1 < len(parts):
                return parts[feature_index + 1]
        
        # Fallback to filename
        return Path(file_path).stem
    
    def _generate_test_file_template(self, feature_name: str, violations: List[TestViolation]) -> str:
        """Generate complete test file template."""
        template = f'''"""
Tests for {feature_name} feature with program context filtering.

Generated by Academy Admin Test Coverage Checker.
"""

import pytest
from datetime import date
from sqlalchemy.orm import Session
from fastapi.testclient import TestClient

from app.features.{feature_name}.services.{feature_name}_service import {feature_name}_service
from app.features.{feature_name}.schemas.{feature_name} import (
    {feature_name.title()}Create,
    {feature_name.title()}Update,
    {feature_name.title()}Response,
    {feature_name.title()}SearchParams,
)
from app.features.courses.models.program import Program
from tests.utils import create_test_program, create_test_{feature_name}


class Test{feature_name.title()}ProgramContext:
    """Test program context filtering for {feature_name} feature."""
    
    def test_program_context_initialization(self, db: Session):
        """Test that program context is properly initialized."""
        # Arrange
        program = create_test_program(db, name="Test Program")
        
        # Assert
        assert program.id is not None
        assert program.name == "Test Program"
    
'''
        
        # Add specific test methods for each violation
        for violation in violations:
            if violation.suggested_test:
                template += f"    {violation.suggested_test}\n\n"
        
        template += '''
    def test_super_admin_bypass(self, db: Session):
        """Test super admin can bypass program context filtering."""
        # Arrange
        program_a = create_test_program(db, name="Program A")
        program_b = create_test_program(db, name="Program B")
        
        entity_a = create_test_entity(db, program_id=program_a.id)
        entity_b = create_test_entity(db, program_id=program_b.id)
        
        # Act - Super admin with no program context should see all
        all_entities, total = service.list_entities(db, program_context=None)
        
        # Assert
        assert total >= 2
        entity_ids = [e.id for e in all_entities]
        assert entity_a.id in entity_ids
        assert entity_b.id in entity_ids
    
    def test_role_based_access_control(self, db: Session):
        """Test role-based access control with program context."""
        # TODO: Implement role-based access tests
        pass
'''
        
        return template
    
    def generate_report(self, violations: List[TestViolation]) -> str:
        """Generate human-readable test coverage report."""
        if not violations:
            return "✅ All features have adequate test coverage!"
        
        report = []
        report.append("📋 Test Coverage Report")
        report.append("=" * 60)
        
        # Group by violation type
        by_type = {}
        for violation in violations:
            if violation.type not in by_type:
                by_type[violation.type] = []
            by_type[violation.type].append(violation)
        
        for violation_type, type_violations in by_type.items():
            report.append(f"\n🔍 {violation_type.value.upper().replace('_', ' ')}:")
            report.append("-" * 40)
            
            for violation in type_violations:
                severity_icon = "🔴" if violation.severity == "high" else "🟡" if violation.severity == "medium" else "🟢"
                report.append(f"{severity_icon} {violation.file_path}")
                report.append(f"   Missing: {violation.missing_test}")
                report.append(f"   {violation.message}")
                report.append("")
        
        # Summary
        high_count = sum(1 for v in violations if v.severity == "high")
        medium_count = sum(1 for v in violations if v.severity == "medium")
        low_count = sum(1 for v in violations if v.severity == "low")
        
        report.append("=" * 60)
        report.append(f"📊 Summary: {high_count} high priority, {medium_count} medium, {low_count} low")
        report.append("=" * 60)
        
        return "\n".join(report)


def main():
    """Main entry point for the test coverage checker."""
    parser = argparse.ArgumentParser(description="Academy Admin Test Coverage Checker")
    parser.add_argument("path", nargs="?", default=".", help="Path to check")
    parser.add_argument("--check-all", action="store_true", help="Check all backend files")
    parser.add_argument("--generate-missing-tests", action="store_true", help="Generate missing test files")
    parser.add_argument("--output-dir", default="tests/generated", help="Output directory for generated tests")
    
    args = parser.parse_args()
    
    checker = TestCoverageChecker()
    
    if args.check_all:
        backend_path = "backend/app/features"
        if os.path.exists(backend_path):
            violations = checker.check_directory(backend_path)
        else:
            print(f"Backend path {backend_path} not found")
            return 1
    else:
        if os.path.isdir(args.path):
            violations = checker.check_directory(args.path)
        else:
            print(f"Path {args.path} not found or is not a directory")
            return 1
    
    # Generate report
    print(checker.generate_report(violations))
    
    # Generate missing test files if requested
    if args.generate_missing_tests and violations:
        test_files = checker.generate_missing_test_files(violations)
        
        # Create output directory
        os.makedirs(args.output_dir, exist_ok=True)
        
        # Write test files
        for filename, content in test_files.items():
            filepath = os.path.join(args.output_dir, filename)
            with open(filepath, 'w') as f:
                f.write(content)
            print(f"Generated test file: {filepath}")
    
    # Return exit code based on violations
    high_count = sum(1 for v in violations if v.severity == "high")
    if high_count > 0:
        return 1
    else:
        return 0


if __name__ == "__main__":
    sys.exit(main())
'''