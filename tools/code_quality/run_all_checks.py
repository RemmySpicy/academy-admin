#!/usr/bin/env python3
"""
Academy Admin - Run All Quality Checks

Comprehensive script to run all code quality checks including:
- Program context linting
- Security scanning
- Test coverage checking
- Standard code quality tools

Usage:
    python run_all_checks.py
    python run_all_checks.py --fix
    python run_all_checks.py --generate-reports
"""

import os
import sys
import subprocess
import argparse
import json
from pathlib import Path
from typing import Dict, List, Any, Optional
from datetime import datetime


class QualityChecker:
    """Main quality checker that runs all checks."""
    
    def __init__(self, fix_issues: bool = False, generate_reports: bool = False):
        self.fix_issues = fix_issues
        self.generate_reports = generate_reports
        self.results = {}
        self.reports_dir = "reports/quality_checks"
        
        # Ensure reports directory exists
        if generate_reports:
            os.makedirs(self.reports_dir, exist_ok=True)
    
    def run_all_checks(self) -> Dict[str, Any]:
        """Run all quality checks and return results."""
        print("🔍 Running Academy Admin Quality Checks...")
        print("=" * 60)
        
        # 1. Program Context Linting
        print("\n1. 📋 Program Context Linting...")
        self.results['program_context_linting'] = self._run_program_context_linting()
        
        # 2. Security Scanning
        print("\n2. 🔒 Security Scanning...")
        self.results['security_scanning'] = self._run_security_scanning()
        
        # 3. Test Coverage Checking
        print("\n3. 📊 Test Coverage Checking...")
        self.results['test_coverage'] = self._run_test_coverage_checking()
        
        # 4. Standard Code Quality
        print("\n4. 📝 Standard Code Quality...")
        self.results['code_quality'] = self._run_standard_quality_checks()
        
        # 5. Type Checking
        print("\n5. 🔤 Type Checking...")
        self.results['type_checking'] = self._run_type_checking()
        
        # 6. Dependency Scanning
        print("\n6. 📦 Dependency Scanning...")
        self.results['dependency_scanning'] = self._run_dependency_scanning()
        
        # Generate summary report
        print("\n" + "=" * 60)
        self._generate_summary_report()
        
        return self.results
    
    def _run_program_context_linting(self) -> Dict[str, Any]:
        """Run program context linting."""
        try:
            cmd = [
                sys.executable, 
                "tools/code_quality/program_context_linter.py", 
                "--check-all", 
                "--json"
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True, cwd=".")
            
            if result.stdout:
                linting_results = json.loads(result.stdout)
                
                if self.generate_reports:
                    with open(f"{self.reports_dir}/program_context_linting.json", 'w') as f:
                        json.dump(linting_results, f, indent=2)
                
                # Print summary
                summary = linting_results.get('summary', {})
                print(f"   Violations found: {summary.get('total', 0)}")
                print(f"   Errors: {summary.get('errors', 0)}")
                print(f"   Warnings: {summary.get('warnings', 0)}")
                
                return {
                    'status': 'completed',
                    'exit_code': result.returncode,
                    'violations': linting_results.get('violations', []),
                    'summary': summary
                }
            else:
                print("   ✅ No violations found")
                return {
                    'status': 'completed',
                    'exit_code': 0,
                    'violations': [],
                    'summary': {'total': 0, 'errors': 0, 'warnings': 0}
                }
                
        except Exception as e:
            print(f"   ❌ Error running program context linting: {e}")
            return {
                'status': 'error',
                'error': str(e)
            }
    
    def _run_security_scanning(self) -> Dict[str, Any]:
        """Run security scanning."""
        try:
            cmd = [
                sys.executable, 
                "tools/code_quality/security_scanner.py", 
                "--scan-all", 
                "--report-format", "json"
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True, cwd=".")
            
            if result.stdout:
                security_results = json.loads(result.stdout)
                
                if self.generate_reports:
                    with open(f"{self.reports_dir}/security_scan.json", 'w') as f:
                        json.dump(security_results, f, indent=2)
                
                # Print summary
                summary = security_results.get('summary', {})
                print(f"   Vulnerabilities found: {summary.get('total', 0)}")
                print(f"   Critical: {summary.get('critical', 0)}")
                print(f"   High: {summary.get('high', 0)}")
                print(f"   Medium: {summary.get('medium', 0)}")
                
                return {
                    'status': 'completed',
                    'exit_code': result.returncode,
                    'vulnerabilities': security_results.get('violations', []),
                    'summary': summary
                }
            else:
                print("   ✅ No vulnerabilities found")
                return {
                    'status': 'completed',
                    'exit_code': 0,
                    'vulnerabilities': [],
                    'summary': {'total': 0, 'critical': 0, 'high': 0, 'medium': 0}
                }
                
        except Exception as e:
            print(f"   ❌ Error running security scanning: {e}")
            return {
                'status': 'error',
                'error': str(e)
            }
    
    def _run_test_coverage_checking(self) -> Dict[str, Any]:
        """Run test coverage checking."""
        try:
            cmd = [
                sys.executable, 
                "tools/code_quality/test_coverage_checker.py", 
                "--check-all"
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True, cwd=".")
            
            if self.generate_reports:
                with open(f"{self.reports_dir}/test_coverage.txt", 'w') as f:
                    f.write(result.stdout)
            
            # Extract summary from output
            lines = result.stdout.split('\n')
            summary_line = next((line for line in lines if 'Summary:' in line), None)
            
            if summary_line:
                print(f"   {summary_line.strip()}")
            else:
                print("   ✅ Adequate test coverage")
            
            return {
                'status': 'completed',
                'exit_code': result.returncode,
                'output': result.stdout
            }
            
        except Exception as e:
            print(f"   ❌ Error running test coverage checking: {e}")
            return {
                'status': 'error',
                'error': str(e)
            }
    
    def _run_standard_quality_checks(self) -> Dict[str, Any]:
        """Run standard code quality checks."""
        quality_results = {}
        
        # Backend quality checks
        try:
            print("   Running backend quality checks...")
            
            # Black formatting check
            result = subprocess.run(
                ["black", "--check", "backend/"], 
                capture_output=True, text=True, cwd="."
            )
            quality_results['black'] = {
                'exit_code': result.returncode,
                'status': 'passed' if result.returncode == 0 else 'failed'
            }
            
            if result.returncode != 0 and self.fix_issues:
                print("   🔧 Auto-fixing Black formatting...")
                subprocess.run(["black", "backend/"], cwd=".")
            
            # isort import sorting check
            result = subprocess.run(
                ["isort", "--check-only", "backend/"], 
                capture_output=True, text=True, cwd="."
            )
            quality_results['isort'] = {
                'exit_code': result.returncode,
                'status': 'passed' if result.returncode == 0 else 'failed'
            }
            
            if result.returncode != 0 and self.fix_issues:
                print("   🔧 Auto-fixing import sorting...")
                subprocess.run(["isort", "backend/"], cwd=".")
            
            # flake8 linting
            result = subprocess.run(
                ["flake8", "backend/"], 
                capture_output=True, text=True, cwd="."
            )
            quality_results['flake8'] = {
                'exit_code': result.returncode,
                'status': 'passed' if result.returncode == 0 else 'failed',
                'output': result.stdout
            }
            
            print(f"   Black: {'✅' if quality_results['black']['status'] == 'passed' else '❌'}")
            print(f"   isort: {'✅' if quality_results['isort']['status'] == 'passed' else '❌'}")
            print(f"   flake8: {'✅' if quality_results['flake8']['status'] == 'passed' else '❌'}")
            
        except Exception as e:
            print(f"   ❌ Error running backend quality checks: {e}")
            quality_results['error'] = str(e)
        
        # Frontend quality checks
        try:
            print("   Running frontend quality checks...")
            
            # ESLint check
            result = subprocess.run(
                ["npm", "run", "lint:frontend"], 
                capture_output=True, text=True, cwd="."
            )
            quality_results['eslint'] = {
                'exit_code': result.returncode,
                'status': 'passed' if result.returncode == 0 else 'failed'
            }
            
            if result.returncode != 0 and self.fix_issues:
                print("   🔧 Auto-fixing ESLint issues...")
                subprocess.run(["npm", "run", "lint:frontend:fix"], cwd=".")
            
            # Prettier check
            result = subprocess.run(
                ["npm", "run", "format:frontend:check"], 
                capture_output=True, text=True, cwd="."
            )
            quality_results['prettier'] = {
                'exit_code': result.returncode,
                'status': 'passed' if result.returncode == 0 else 'failed'
            }
            
            if result.returncode != 0 and self.fix_issues:
                print("   🔧 Auto-fixing Prettier formatting...")
                subprocess.run(["npm", "run", "format:frontend"], cwd=".")
            
            print(f"   ESLint: {'✅' if quality_results['eslint']['status'] == 'passed' else '❌'}")
            print(f"   Prettier: {'✅' if quality_results['prettier']['status'] == 'passed' else '❌'}")
            
        except Exception as e:
            print(f"   ❌ Error running frontend quality checks: {e}")
            quality_results['frontend_error'] = str(e)
        
        return quality_results
    
    def _run_type_checking(self) -> Dict[str, Any]:
        """Run type checking."""
        type_results = {}
        
        # Backend type checking (mypy)
        try:
            result = subprocess.run(
                ["mypy", "backend/"], 
                capture_output=True, text=True, cwd="."
            )
            type_results['mypy'] = {
                'exit_code': result.returncode,
                'status': 'passed' if result.returncode == 0 else 'failed',
                'output': result.stdout
            }
            
            print(f"   mypy: {'✅' if type_results['mypy']['status'] == 'passed' else '❌'}")
            
        except Exception as e:
            print(f"   ❌ Error running mypy: {e}")
            type_results['mypy_error'] = str(e)
        
        # Frontend type checking (TypeScript)
        try:
            result = subprocess.run(
                ["npm", "run", "type-check:frontend"], 
                capture_output=True, text=True, cwd="."
            )
            type_results['typescript'] = {
                'exit_code': result.returncode,
                'status': 'passed' if result.returncode == 0 else 'failed'
            }
            
            print(f"   TypeScript: {'✅' if type_results['typescript']['status'] == 'passed' else '❌'}")
            
        except Exception as e:
            print(f"   ❌ Error running TypeScript check: {e}")
            type_results['typescript_error'] = str(e)
        
        return type_results
    
    def _run_dependency_scanning(self) -> Dict[str, Any]:
        """Run dependency vulnerability scanning."""
        dep_results = {}
        
        # Backend dependency scanning (safety)
        try:
            result = subprocess.run(
                ["safety", "check", "--json"], 
                capture_output=True, text=True, cwd="backend"
            )
            
            if result.stdout:
                safety_results = json.loads(result.stdout)
                dep_results['safety'] = {
                    'exit_code': result.returncode,
                    'vulnerabilities': safety_results,
                    'status': 'passed' if result.returncode == 0 else 'failed'
                }
                
                vuln_count = len(safety_results)
                print(f"   Safety: {'✅' if vuln_count == 0 else f'❌ {vuln_count} vulnerabilities'}")
            else:
                print("   Safety: ✅ No vulnerabilities found")
                dep_results['safety'] = {
                    'exit_code': 0,
                    'vulnerabilities': [],
                    'status': 'passed'
                }
            
        except Exception as e:
            print(f"   ❌ Error running safety check: {e}")
            dep_results['safety_error'] = str(e)
        
        # Frontend dependency scanning (npm audit)
        try:
            result = subprocess.run(
                ["npm", "audit", "--json"], 
                capture_output=True, text=True, cwd="frontend"
            )
            
            if result.stdout:
                audit_results = json.loads(result.stdout)
                dep_results['npm_audit'] = {
                    'exit_code': result.returncode,
                    'audit_results': audit_results,
                    'status': 'passed' if result.returncode == 0 else 'failed'
                }
                
                vuln_count = audit_results.get('metadata', {}).get('vulnerabilities', {}).get('total', 0)
                print(f"   npm audit: {'✅' if vuln_count == 0 else f'❌ {vuln_count} vulnerabilities'}")
            else:
                print("   npm audit: ✅ No vulnerabilities found")
                dep_results['npm_audit'] = {
                    'exit_code': 0,
                    'audit_results': {},
                    'status': 'passed'
                }
            
        except Exception as e:
            print(f"   ❌ Error running npm audit: {e}")
            dep_results['npm_audit_error'] = str(e)
        
        return dep_results
    
    def _generate_summary_report(self) -> None:
        """Generate summary report of all checks."""
        print("📋 QUALITY CHECKS SUMMARY")
        print("=" * 60)
        
        # Count issues by category
        total_issues = 0
        critical_issues = 0
        
        # Program context linting
        pc_summary = self.results.get('program_context_linting', {}).get('summary', {})
        pc_errors = pc_summary.get('errors', 0)
        pc_warnings = pc_summary.get('warnings', 0)
        total_issues += pc_errors + pc_warnings
        critical_issues += pc_errors
        
        print(f"📋 Program Context: {pc_errors} errors, {pc_warnings} warnings")
        
        # Security scanning
        sec_summary = self.results.get('security_scanning', {}).get('summary', {})
        sec_critical = sec_summary.get('critical', 0)
        sec_high = sec_summary.get('high', 0)
        sec_medium = sec_summary.get('medium', 0)
        total_issues += sec_critical + sec_high + sec_medium
        critical_issues += sec_critical + sec_high
        
        print(f"🔒 Security: {sec_critical} critical, {sec_high} high, {sec_medium} medium")
        
        # Code quality
        quality_results = self.results.get('code_quality', {})
        quality_failures = sum(1 for k, v in quality_results.items() 
                              if isinstance(v, dict) and v.get('status') == 'failed')
        total_issues += quality_failures
        
        print(f"📝 Code Quality: {quality_failures} failures")
        
        # Type checking
        type_results = self.results.get('type_checking', {})
        type_failures = sum(1 for k, v in type_results.items() 
                           if isinstance(v, dict) and v.get('status') == 'failed')
        total_issues += type_failures
        
        print(f"🔤 Type Checking: {type_failures} failures")
        
        # Overall status
        print("\n" + "=" * 60)
        if critical_issues > 0:
            print(f"❌ CRITICAL ISSUES FOUND: {critical_issues}")
            print("   These must be fixed before deployment!")
        elif total_issues > 0:
            print(f"⚠️  ISSUES FOUND: {total_issues}")
            print("   Review and fix these issues")
        else:
            print("✅ ALL CHECKS PASSED!")
            print("   Code is ready for deployment")
        
        # Generate JSON report
        if self.generate_reports:
            summary_report = {
                'timestamp': datetime.now().isoformat(),
                'total_issues': total_issues,
                'critical_issues': critical_issues,
                'results': self.results,
                'overall_status': 'passed' if total_issues == 0 else 'failed'
            }
            
            with open(f"{self.reports_dir}/summary.json", 'w') as f:
                json.dump(summary_report, f, indent=2)
            
            print(f"\n📊 Detailed reports saved to: {self.reports_dir}/")


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(description="Academy Admin Quality Checker")
    parser.add_argument("--fix", action="store_true", help="Automatically fix issues where possible")
    parser.add_argument("--generate-reports", action="store_true", help="Generate detailed reports")
    parser.add_argument("--ci", action="store_true", help="Run in CI mode (fail on any issues)")
    
    args = parser.parse_args()
    
    # Run all checks
    checker = QualityChecker(
        fix_issues=args.fix,
        generate_reports=args.generate_reports
    )
    
    results = checker.run_all_checks()
    
    # Determine exit code
    if args.ci:
        # In CI mode, fail on any issues
        program_context_errors = results.get('program_context_linting', {}).get('summary', {}).get('errors', 0)
        security_critical = results.get('security_scanning', {}).get('summary', {}).get('critical', 0)
        security_high = results.get('security_scanning', {}).get('summary', {}).get('high', 0)
        
        if program_context_errors > 0 or security_critical > 0 or security_high > 0:
            return 2  # Critical issues
        
        # Check other quality issues
        quality_results = results.get('code_quality', {})
        quality_failures = sum(1 for k, v in quality_results.items() 
                              if isinstance(v, dict) and v.get('status') == 'failed')
        
        if quality_failures > 0:
            return 1  # Quality issues
    
    return 0


if __name__ == "__main__":
    sys.exit(main())