#!/usr/bin/env python3
"""
Academy Admin Security Scanner

Specialized security scanner for detecting program context bypass vulnerabilities
and other security issues in the Academy Admin system.

Usage:
    python security_scanner.py [path]
    python security_scanner.py --scan-all
    python security_scanner.py --report-format json
"""

import ast
import os
import sys
import re
import argparse
import json
from typing import List, Dict, Any, Optional, Set
from pathlib import Path
from dataclasses import dataclass
from enum import Enum


class SecurityViolationType(Enum):
    """Types of security violations."""
    PROGRAM_CONTEXT_BYPASS = "program_context_bypass"
    INSECURE_QUERY = "insecure_query"
    MISSING_ACCESS_CONTROL = "missing_access_control"
    HARDCODED_SECRETS = "hardcoded_secrets"
    SQL_INJECTION_RISK = "sql_injection_risk"
    UNSAFE_DESERIALIZATION = "unsafe_deserialization"
    MISSING_INPUT_VALIDATION = "missing_input_validation"
    PRIVILEGE_ESCALATION_RISK = "privilege_escalation_risk"


@dataclass
class SecurityViolation:
    """A security violation found in the code."""
    type: SecurityViolationType
    file_path: str
    line_number: int
    column: int
    message: str
    code_snippet: str
    severity: str = "high"
    remediation: Optional[str] = None
    cwe_id: Optional[str] = None  # Common Weakness Enumeration ID


class SecurityScanner:
    """Security scanner for Academy Admin codebase."""
    
    def __init__(self):
        self.violations: List[SecurityViolation] = []
        self.suspicious_patterns = {
            'hardcoded_secrets': [
                r'(?i)(password|secret|key|token)\s*[=:]\s*["\'][^"\']{8,}["\']',
                r'(?i)(api_key|auth_token|bearer_token)\s*[=:]\s*["\'][^"\']{16,}["\']',
                r'(?i)(database_url|db_password)\s*[=:]\s*["\'][^"\']{8,}["\']',
            ],
            'sql_injection': [
                r'(?i)\.execute\s*\(\s*["\'].*%s.*["\']',
                r'(?i)\.query\s*\(\s*["\'].*\+.*["\']',
                r'(?i)f["\'].*\{.*\}.*["\'].*execute',
            ],
            'unsafe_deserialization': [
                r'(?i)pickle\.loads?\s*\(',
                r'(?i)eval\s*\(',
                r'(?i)exec\s*\(',
            ],
        }
    
    def scan_file(self, file_path: str) -> List[SecurityViolation]:
        """Scan a single file for security violations."""
        if not file_path.endswith('.py'):
            return []
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            lines = content.splitlines()
            violations = []
            
            # Parse AST for advanced analysis
            try:
                tree = ast.parse(content)
                violations.extend(self._analyze_ast(tree, file_path, lines))
            except SyntaxError as e:
                print(f"Syntax error in {file_path}: {e}")
            
            # Pattern-based analysis
            violations.extend(self._analyze_patterns(content, file_path, lines))
            
            return violations
            
        except Exception as e:
            print(f"Error scanning {file_path}: {e}")
            return []
    
    def _analyze_ast(self, tree: ast.AST, file_path: str, lines: List[str]) -> List[SecurityViolation]:
        """Analyze AST for security violations."""
        violations = []
        
        for node in ast.walk(tree):
            # Check for program context bypass vulnerabilities
            if isinstance(node, ast.FunctionDef):
                violations.extend(self._check_program_context_bypass(node, file_path, lines))
                violations.extend(self._check_access_control(node, file_path, lines))
                violations.extend(self._check_input_validation(node, file_path, lines))
            
            # Check for insecure database queries
            elif isinstance(node, ast.Call):
                violations.extend(self._check_insecure_queries(node, file_path, lines))
                violations.extend(self._check_unsafe_functions(node, file_path, lines))
        
        return violations
    
    def _analyze_patterns(self, content: str, file_path: str, lines: List[str]) -> List[SecurityViolation]:
        """Analyze file content using regex patterns."""
        violations = []
        
        for violation_type, patterns in self.suspicious_patterns.items():
            for pattern in patterns:
                for match in re.finditer(pattern, content, re.MULTILINE):
                    line_num = content[:match.start()].count('\n') + 1
                    
                    if violation_type == 'hardcoded_secrets':
                        violations.append(SecurityViolation(
                            type=SecurityViolationType.HARDCODED_SECRETS,
                            file_path=file_path,
                            line_number=line_num,
                            column=match.start(),
                            message="Potential hardcoded secret or sensitive data",
                            code_snippet=lines[line_num - 1] if line_num <= len(lines) else "",
                            severity="high",
                            remediation="Use environment variables or secure configuration management",
                            cwe_id="CWE-798"
                        ))
                    
                    elif violation_type == 'sql_injection':
                        violations.append(SecurityViolation(
                            type=SecurityViolationType.SQL_INJECTION_RISK,
                            file_path=file_path,
                            line_number=line_num,
                            column=match.start(),
                            message="Potential SQL injection vulnerability",
                            code_snippet=lines[line_num - 1] if line_num <= len(lines) else "",
                            severity="critical",
                            remediation="Use parameterized queries or ORM methods",
                            cwe_id="CWE-89"
                        ))
                    
                    elif violation_type == 'unsafe_deserialization':
                        violations.append(SecurityViolation(
                            type=SecurityViolationType.UNSAFE_DESERIALIZATION,
                            file_path=file_path,
                            line_number=line_num,
                            column=match.start(),
                            message="Unsafe deserialization detected",
                            code_snippet=lines[line_num - 1] if line_num <= len(lines) else "",
                            severity="high",
                            remediation="Use safe serialization methods like JSON",
                            cwe_id="CWE-502"
                        ))
        
        return violations
    
    def _check_program_context_bypass(self, node: ast.FunctionDef, file_path: str, lines: List[str]) -> List[SecurityViolation]:
        """Check for program context bypass vulnerabilities."""
        violations = []
        
        # Check service methods that should have program context filtering
        if self._is_service_method(node):
            # Check if method accepts program_context parameter
            has_program_context = any(arg.arg == 'program_context' for arg in node.args.args)
            
            if has_program_context:
                # Check if program context is actually used in filtering
                uses_program_context = self._uses_program_context_filtering(node)
                
                if not uses_program_context:
                    violations.append(SecurityViolation(
                        type=SecurityViolationType.PROGRAM_CONTEXT_BYPASS,
                        file_path=file_path,
                        line_number=node.lineno,
                        column=node.col_offset,
                        message=f"Method '{node.name}' accepts program_context but doesn't use it for filtering",
                        code_snippet=lines[node.lineno - 1] if node.lineno <= len(lines) else "",
                        severity="critical",
                        remediation="Add program context filtering: if program_context: query = query.filter(Model.program_id == program_context)",
                        cwe_id="CWE-285"
                    ))
            else:
                # Check if method should have program context
                if self._should_have_program_context(node):
                    violations.append(SecurityViolation(
                        type=SecurityViolationType.MISSING_ACCESS_CONTROL,
                        file_path=file_path,
                        line_number=node.lineno,
                        column=node.col_offset,
                        message=f"Service method '{node.name}' missing program context parameter",
                        code_snippet=lines[node.lineno - 1] if node.lineno <= len(lines) else "",
                        severity="high",
                        remediation="Add program_context: Optional[str] = None parameter",
                        cwe_id="CWE-284"
                    ))
        
        return violations
    
    def _check_access_control(self, node: ast.FunctionDef, file_path: str, lines: List[str]) -> List[SecurityViolation]:
        """Check for missing access control in route handlers."""
        violations = []
        
        # Check if this is a route handler
        if self._is_route_handler(node):
            # Check for authentication dependency
            has_auth = self._has_authentication_dependency(node)
            
            if not has_auth:
                violations.append(SecurityViolation(
                    type=SecurityViolationType.MISSING_ACCESS_CONTROL,
                    file_path=file_path,
                    line_number=node.lineno,
                    column=node.col_offset,
                    message=f"Route handler '{node.name}' missing authentication dependency",
                    code_snippet=lines[node.lineno - 1] if node.lineno <= len(lines) else "",
                    severity="high",
                    remediation="Add current_user: dict = Depends(get_current_active_user)",
                    cwe_id="CWE-306"
                ))
        
        return violations
    
    def _check_input_validation(self, node: ast.FunctionDef, file_path: str, lines: List[str]) -> List[SecurityViolation]:
        """Check for missing input validation."""
        violations = []
        
        # Check route handlers for input validation
        if self._is_route_handler(node):
            # Check for direct parameter access without validation
            for body_node in ast.walk(node):
                if isinstance(body_node, ast.Attribute):
                    if body_node.attr in ['args', 'form', 'json'] and not self._has_input_validation(node):
                        violations.append(SecurityViolation(
                            type=SecurityViolationType.MISSING_INPUT_VALIDATION,
                            file_path=file_path,
                            line_number=body_node.lineno,
                            column=body_node.col_offset,
                            message="Direct access to request data without validation",
                            code_snippet=lines[body_node.lineno - 1] if body_node.lineno <= len(lines) else "",
                            severity="medium",
                            remediation="Use Pydantic models for request validation",
                            cwe_id="CWE-20"
                        ))
        
        return violations
    
    def _check_insecure_queries(self, node: ast.Call, file_path: str, lines: List[str]) -> List[SecurityViolation]:
        """Check for insecure database queries."""
        violations = []
        
        # Check for direct SQL execution
        if isinstance(node.func, ast.Attribute) and node.func.attr == 'execute':
            # Check if using string formatting in SQL
            for arg in node.args:
                if isinstance(arg, ast.BinOp) and isinstance(arg.op, ast.Add):
                    violations.append(SecurityViolation(
                        type=SecurityViolationType.SQL_INJECTION_RISK,
                        file_path=file_path,
                        line_number=node.lineno,
                        column=node.col_offset,
                        message="Potential SQL injection via string concatenation",
                        code_snippet=lines[node.lineno - 1] if node.lineno <= len(lines) else "",
                        severity="critical",
                        remediation="Use parameterized queries or ORM methods",
                        cwe_id="CWE-89"
                    ))
        
        return violations
    
    def _check_unsafe_functions(self, node: ast.Call, file_path: str, lines: List[str]) -> List[SecurityViolation]:
        """Check for calls to unsafe functions."""
        violations = []
        
        unsafe_functions = {
            'eval': ("Code execution via eval", "CWE-95"),
            'exec': ("Code execution via exec", "CWE-95"),
            'compile': ("Dynamic code compilation", "CWE-95"),
            'pickle.loads': ("Unsafe deserialization", "CWE-502"),
            'yaml.load': ("Unsafe YAML loading", "CWE-502"),
        }
        
        func_name = self._get_function_name(node)
        
        if func_name in unsafe_functions:
            message, cwe_id = unsafe_functions[func_name]
            violations.append(SecurityViolation(
                type=SecurityViolationType.UNSAFE_DESERIALIZATION,
                file_path=file_path,
                line_number=node.lineno,
                column=node.col_offset,
                message=f"Unsafe function call: {func_name} - {message}",
                code_snippet=lines[node.lineno - 1] if node.lineno <= len(lines) else "",
                severity="high",
                remediation=f"Replace {func_name} with safer alternatives",
                cwe_id=cwe_id
            ))
        
        return violations
    
    def _is_service_method(self, node: ast.FunctionDef) -> bool:
        """Check if function is a service method."""
        method_prefixes = ['create_', 'get_', 'update_', 'delete_', 'list_', 'bulk_']
        return any(node.name.startswith(prefix) for prefix in method_prefixes)
    
    def _should_have_program_context(self, node: ast.FunctionDef) -> bool:
        """Check if method should have program context parameter."""
        # Methods that should have program context
        required_methods = ['create_', 'get_', 'update_', 'delete_', 'list_', 'bulk_']
        return any(node.name.startswith(prefix) for prefix in required_methods)
    
    def _uses_program_context_filtering(self, node: ast.FunctionDef) -> bool:
        """Check if method uses program context for filtering."""
        # Look for filter patterns with program_context
        for body_node in ast.walk(node):
            if isinstance(body_node, ast.Call):
                if isinstance(body_node.func, ast.Attribute) and body_node.func.attr == 'filter':
                    # Check if filtering by program_id with program_context
                    for arg in body_node.args:
                        if isinstance(arg, ast.Compare):
                            # Look for program_id == program_context pattern
                            if self._is_program_id_comparison(arg):
                                return True
        return False
    
    def _is_program_id_comparison(self, node: ast.Compare) -> bool:
        """Check if comparison involves program_id and program_context."""
        if isinstance(node.left, ast.Attribute) and node.left.attr == 'program_id':
            for comparator in node.comparators:
                if isinstance(comparator, ast.Name) and comparator.id == 'program_context':
                    return True
        return False
    
    def _is_route_handler(self, node: ast.FunctionDef) -> bool:
        """Check if function is a route handler."""
        route_decorators = ['get', 'post', 'put', 'delete', 'patch']
        
        for decorator in node.decorator_list:
            if isinstance(decorator, ast.Attribute) and decorator.attr in route_decorators:
                return True
            elif isinstance(decorator, ast.Name) and decorator.id in route_decorators:
                return True
        
        return False
    
    def _has_authentication_dependency(self, node: ast.FunctionDef) -> bool:
        """Check if route handler has authentication dependency."""
        auth_params = ['current_user', 'user', 'authenticated_user']
        
        for arg in node.args.args:
            if arg.arg in auth_params:
                return True
        
        return False
    
    def _has_input_validation(self, node: ast.FunctionDef) -> bool:
        """Check if route handler has input validation."""
        # Look for Pydantic model parameters
        for arg in node.args.args:
            if hasattr(arg, 'annotation') and arg.annotation:
                # Check if parameter type is a Pydantic model
                if isinstance(arg.annotation, ast.Name):
                    if arg.annotation.id.endswith('Schema') or arg.annotation.id.endswith('Request'):
                        return True
        
        return False
    
    def _get_function_name(self, node: ast.Call) -> str:
        """Extract function name from call node."""
        if isinstance(node.func, ast.Name):
            return node.func.id
        elif isinstance(node.func, ast.Attribute):
            if isinstance(node.func.value, ast.Name):
                return f"{node.func.value.id}.{node.func.attr}"
            else:
                return node.func.attr
        return ""
    
    def scan_directory(self, directory: str) -> List[SecurityViolation]:
        """Scan all Python files in directory."""
        violations = []
        
        for root, dirs, files in os.walk(directory):
            # Skip certain directories
            dirs[:] = [d for d in dirs if d not in ['__pycache__', 'migrations', 'node_modules', '.git']]
            
            for file in files:
                if file.endswith('.py'):
                    file_path = os.path.join(root, file)
                    violations.extend(self.scan_file(file_path))
        
        return violations
    
    def generate_report(self, violations: List[SecurityViolation]) -> str:
        """Generate human-readable security report."""
        if not violations:
            return "✅ No security violations found!"
        
        report = []
        report.append("🔒 Security Scan Report")
        report.append("=" * 60)
        
        # Group by severity
        critical = [v for v in violations if v.severity == "critical"]
        high = [v for v in violations if v.severity == "high"]
        medium = [v for v in violations if v.severity == "medium"]
        low = [v for v in violations if v.severity == "low"]
        
        # Critical violations
        if critical:
            report.append("\n🚨 CRITICAL VULNERABILITIES:")
            for violation in critical:
                report.append(f"  📍 {violation.file_path}:{violation.line_number}")
                report.append(f"     {violation.message}")
                if violation.cwe_id:
                    report.append(f"     CWE: {violation.cwe_id}")
                if violation.remediation:
                    report.append(f"     🔧 Fix: {violation.remediation}")
                report.append("")
        
        # High severity violations
        if high:
            report.append("\n🔴 HIGH SEVERITY:")
            for violation in high:
                report.append(f"  📍 {violation.file_path}:{violation.line_number}")
                report.append(f"     {violation.message}")
                if violation.remediation:
                    report.append(f"     🔧 Fix: {violation.remediation}")
                report.append("")
        
        # Medium severity violations
        if medium:
            report.append("\n🟡 MEDIUM SEVERITY:")
            for violation in medium:
                report.append(f"  📍 {violation.file_path}:{violation.line_number}")
                report.append(f"     {violation.message}")
                report.append("")
        
        # Summary
        report.append("=" * 60)
        report.append(f"📊 Summary: {len(critical)} critical, {len(high)} high, {len(medium)} medium, {len(low)} low")
        report.append("=" * 60)
        
        return "\n".join(report)
    
    def generate_json_report(self, violations: List[SecurityViolation]) -> Dict[str, Any]:
        """Generate JSON security report."""
        return {
            "violations": [
                {
                    "type": violation.type.value,
                    "file": violation.file_path,
                    "line": violation.line_number,
                    "column": violation.column,
                    "message": violation.message,
                    "severity": violation.severity,
                    "code_snippet": violation.code_snippet,
                    "remediation": violation.remediation,
                    "cwe_id": violation.cwe_id
                }
                for violation in violations
            ],
            "summary": {
                "total": len(violations),
                "critical": sum(1 for v in violations if v.severity == "critical"),
                "high": sum(1 for v in violations if v.severity == "high"),
                "medium": sum(1 for v in violations if v.severity == "medium"),
                "low": sum(1 for v in violations if v.severity == "low")
            }
        }


def main():
    """Main entry point for the security scanner."""
    parser = argparse.ArgumentParser(description="Academy Admin Security Scanner")
    parser.add_argument("path", nargs="?", default=".", help="Path to scan")
    parser.add_argument("--scan-all", action="store_true", help="Scan all backend files")
    parser.add_argument("--report-format", choices=["text", "json"], default="text", help="Report format")
    parser.add_argument("--output", "-o", help="Output file path")
    
    args = parser.parse_args()
    
    scanner = SecurityScanner()
    
    if args.scan_all:
        backend_path = "backend/app"
        if os.path.exists(backend_path):
            violations = scanner.scan_directory(backend_path)
        else:
            print(f"Backend path {backend_path} not found")
            return 1
    else:
        if os.path.isfile(args.path):
            violations = scanner.scan_file(args.path)
        elif os.path.isdir(args.path):
            violations = scanner.scan_directory(args.path)
        else:
            print(f"Path {args.path} not found")
            return 1
    
    # Generate report
    if args.report_format == "json":
        report = json.dumps(scanner.generate_json_report(violations), indent=2)
    else:
        report = scanner.generate_report(violations)
    
    # Output report
    if args.output:
        with open(args.output, 'w') as f:
            f.write(report)
        print(f"Report saved to {args.output}")
    else:
        print(report)
    
    # Return exit code based on severity
    critical_count = sum(1 for v in violations if v.severity == "critical")
    high_count = sum(1 for v in violations if v.severity == "high")
    
    if critical_count > 0:
        return 2  # Critical vulnerabilities
    elif high_count > 0:
        return 1  # High severity vulnerabilities
    else:
        return 0  # No critical or high severity issues


if __name__ == "__main__":
    sys.exit(main())