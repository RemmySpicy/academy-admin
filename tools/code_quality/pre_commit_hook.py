#!/usr/bin/env python3
"""
Academy Admin Pre-commit Hook

Git pre-commit hook that runs program context linting and security scanning
before allowing commits to prevent security vulnerabilities.

Installation:
    ln -s ../../tools/code_quality/pre_commit_hook.py .git/hooks/pre-commit
    chmod +x .git/hooks/pre-commit
"""

import os
import sys
import subprocess
import json
from typing import List, Dict, Any


class PreCommitHook:
    """Pre-commit hook for Academy Admin."""
    
    def __init__(self):
        self.violations = []
        self.critical_violations = []
        
    def run_checks(self) -> bool:
        """Run all pre-commit checks."""
        print("🔍 Running Academy Admin Pre-commit Checks...")
        
        # Get list of changed files
        changed_files = self._get_changed_files()
        
        if not changed_files:
            print("✅ No files to check")
            return True
        
        # Filter Python files
        python_files = [f for f in changed_files if f.endswith('.py')]
        
        if not python_files:
            print("✅ No Python files to check")
            return True
        
        success = True
        
        # 1. Program Context Linting
        print("\n📋 Checking program context filtering...")
        if not self._check_program_context(python_files):
            success = False
        
        # 2. Security Scanning
        print("\n🔒 Scanning for security vulnerabilities...")
        if not self._check_security(python_files):
            success = False
        
        # 3. Quick Code Quality
        print("\n📝 Checking code quality...")
        if not self._check_code_quality(python_files):
            success = False
        
        # Summary
        if success:
            print("\n✅ All pre-commit checks passed!")
            return True
        else:
            print("\n❌ Pre-commit checks failed!")
            print("Fix the issues above before committing.")
            return False
    
    def _get_changed_files(self) -> List[str]:
        """Get list of changed files."""
        try:
            # Get staged files
            result = subprocess.run(
                ["git", "diff", "--cached", "--name-only"],
                capture_output=True,
                text=True
            )
            
            if result.returncode == 0:
                return result.stdout.strip().split('\n') if result.stdout.strip() else []
            else:
                return []
        except Exception:
            return []
    
    def _check_program_context(self, files: List[str]) -> bool:
        """Check program context filtering for changed files."""
        try:
            # Run program context linter on changed files
            for file in files:
                if os.path.exists(file):
                    result = subprocess.run([
                        sys.executable,
                        "tools/code_quality/program_context_linter.py",
                        file,
                        "--json"
                    ], capture_output=True, text=True)
                    
                    if result.stdout:
                        try:
                            lint_results = json.loads(result.stdout)
                            violations = lint_results.get('violations', [])
                            
                            # Check for critical violations
                            for violation in violations:
                                if violation.get('severity') == 'error':
                                    self.critical_violations.append(violation)
                                    print(f"   ❌ {file}:{violation.get('line', '?')}: {violation.get('message', 'Unknown error')}")
                                else:
                                    print(f"   ⚠️  {file}:{violation.get('line', '?')}: {violation.get('message', 'Unknown warning')}")
                        except json.JSONDecodeError:
                            pass
            
            return len(self.critical_violations) == 0
            
        except Exception as e:
            print(f"   ❌ Error checking program context: {e}")
            return False
    
    def _check_security(self, files: List[str]) -> bool:
        """Check security for changed files."""
        try:
            critical_found = False
            
            for file in files:
                if os.path.exists(file):
                    result = subprocess.run([
                        sys.executable,
                        "tools/code_quality/security_scanner.py",
                        file,
                        "--report-format", "json"
                    ], capture_output=True, text=True)
                    
                    if result.stdout:
                        try:
                            security_results = json.loads(result.stdout)
                            violations = security_results.get('violations', [])
                            
                            for violation in violations:
                                severity = violation.get('severity', 'unknown')
                                message = violation.get('message', 'Unknown security issue')
                                
                                if severity in ['critical', 'high']:
                                    critical_found = True
                                    print(f"   🚨 {file}:{violation.get('line', '?')}: {message}")
                                elif severity == 'medium':
                                    print(f"   ⚠️  {file}:{violation.get('line', '?')}: {message}")
                        except json.JSONDecodeError:
                            pass
            
            return not critical_found
            
        except Exception as e:
            print(f"   ❌ Error checking security: {e}")
            return False
    
    def _check_code_quality(self, files: List[str]) -> bool:
        """Check basic code quality for changed files."""
        try:
            # Check if files are in backend directory
            backend_files = [f for f in files if f.startswith('backend/')]
            
            if not backend_files:
                return True
            
            # Quick Black check
            result = subprocess.run([
                "black", "--check", "--quiet"
            ] + backend_files, capture_output=True, text=True)
            
            if result.returncode != 0:
                print("   ❌ Code formatting issues found. Run 'black' to fix.")
                return False
            
            # Quick flake8 check
            result = subprocess.run([
                "flake8", "--select=E9,F63,F7,F82"
            ] + backend_files, capture_output=True, text=True)
            
            if result.returncode != 0:
                print("   ❌ Critical code quality issues found:")
                print(result.stdout)
                return False
            
            return True
            
        except Exception as e:
            print(f"   ❌ Error checking code quality: {e}")
            return False


def main():
    """Main entry point for pre-commit hook."""
    hook = PreCommitHook()
    
    # Run checks
    success = hook.run_checks()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()