#!/usr/bin/env python3
"""
Comprehensive test runner for role-based access control and program assignments.
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

import subprocess
from pathlib import Path


def run_command(command, description):
    """Run a command and handle output."""
    print(f"\n{'='*60}")
    print(f"🧪 {description}")
    print(f"{'='*60}")
    
    try:
        result = subprocess.run(
            command,
            shell=True,
            capture_output=True,
            text=True,
            cwd=Path(__file__).parent.parent
        )
        
        if result.stdout:
            print(result.stdout)
        
        if result.stderr and result.returncode != 0:
            print(f"❌ Error: {result.stderr}")
            return False
        
        if result.returncode == 0:
            print(f"✅ {description} completed successfully!")
        else:
            print(f"❌ {description} failed with return code {result.returncode}")
            return False
            
        return True
        
    except Exception as e:
        print(f"❌ Failed to run {description}: {e}")
        return False


def run_individual_tests():
    """Run individual test files."""
    
    test_files = [
        ("tests/unit/test_role_based_access.py", "Role-Based Access Control Tests"),
        ("tests/integration/test_program_context_api.py", "Program Context API Tests"),
        ("tests/integration/test_multi_role_scenarios.py", "Multi-Role Scenario Tests")
    ]
    
    results = []
    
    for test_file, description in test_files:
        print(f"\n🏃 Running {description}...")
        
        if os.path.exists(test_file):
            success = run_command(f"python {test_file}", description)
            results.append((description, success))
        else:
            print(f"❌ Test file not found: {test_file}")
            results.append((description, False))
    
    return results


def run_pytest_tests():
    """Run tests using pytest with specific markers."""
    
    pytest_commands = [
        ("pytest tests/unit/test_role_based_access.py -v", "Role-Based Access (Pytest)"),
        ("pytest tests/integration/test_program_context_api.py -v", "Program Context API (Pytest)"),
        ("pytest tests/integration/test_multi_role_scenarios.py -v", "Multi-Role Scenarios (Pytest)"),
        ("pytest -m role_based -v", "All Role-Based Tests"),
        ("pytest -m program_context -v", "All Program Context Tests"),
        ("pytest -m security -v", "All Security Tests")
    ]
    
    results = []
    
    for command, description in pytest_commands:
        success = run_command(command, description)
        results.append((description, success))
    
    return results


def run_coverage_tests():
    """Run coverage analysis for role-based tests."""
    
    coverage_commands = [
        (
            "pytest tests/unit/test_role_based_access.py tests/integration/test_program_context_api.py tests/integration/test_multi_role_scenarios.py --cov=app.middleware.program_context --cov=app.dependencies.auth --cov-report=term-missing",
            "Role-Based Test Coverage"
        ),
        (
            "pytest --cov=app --cov-report=html --cov-report=term-missing tests/unit/test_role_based_access.py",
            "Generate HTML Coverage Report"
        )
    ]
    
    results = []
    
    for command, description in coverage_commands:
        success = run_command(command, description)
        results.append((description, success))
    
    return results


def print_summary(results):
    """Print test results summary."""
    
    print(f"\n{'='*80}")
    print("🎯 TEST EXECUTION SUMMARY")
    print(f"{'='*80}")
    
    passed = 0
    failed = 0
    
    for description, success in results:
        status = "✅ PASSED" if success else "❌ FAILED"
        print(f"{status:<12} {description}")
        
        if success:
            passed += 1
        else:
            failed += 1
    
    print(f"\n📊 RESULTS: {passed} passed, {failed} failed, {len(results)} total")
    
    if failed == 0:
        print("🎉 ALL ROLE-BASED ACCESS CONTROL TESTS PASSED!")
        return True
    else:
        print("⚠️  Some tests failed. Please review the output above.")
        return False


def main():
    """Main test runner function."""
    
    print("🚀 Academy Admin - Role-Based Access Control Test Suite")
    print("=" * 80)
    
    all_results = []
    
    # Run individual test files
    print("\n🔍 PHASE 1: Running Individual Test Files")
    individual_results = run_individual_tests()
    all_results.extend(individual_results)
    
    # Run pytest tests
    print("\n🔍 PHASE 2: Running Pytest Tests")
    pytest_results = run_pytest_tests()
    all_results.extend(pytest_results)
    
    # Run coverage tests
    print("\n🔍 PHASE 3: Running Coverage Analysis")
    coverage_results = run_coverage_tests()
    all_results.extend(coverage_results)
    
    # Print summary
    success = print_summary(all_results)
    
    # Generate test report
    generate_test_report(all_results)
    
    return 0 if success else 1


def generate_test_report(results):
    """Generate a test report file."""
    
    report_content = f"""# Role-Based Access Control Test Report

## Test Execution Summary

Total Tests: {len(results)}
Passed: {sum(1 for _, success in results if success)}
Failed: {sum(1 for _, success in results if not success)}

## Detailed Results

"""
    
    for description, success in results:
        status = "PASSED" if success else "FAILED"
        report_content += f"- **{description}**: {status}\n"
    
    report_content += f"""

## Test Coverage Areas

### ✅ Role-Based Access Control
- Super Admin access and bypass functionality
- Program Admin access to assigned programs only
- Program Coordinator role restrictions
- Tutor read-only access patterns
- Role-based decorator functions

### ✅ Program Context Filtering
- HTTP header-based program context injection
- Program context validation and filtering
- Cross-program access prevention
- Missing program context error handling
- Program-specific data isolation

### ✅ Multi-Role Scenarios
- User role promotion scenarios
- Multi-program user switching
- Program assignment removal scenarios
- Concurrent role access patterns
- Edge cases and invalid inputs

### ✅ API Integration Testing
- Course API program filtering
- Student API program filtering
- Facility API program filtering
- Super admin bypass functionality
- Missing program context handling

### ✅ Security and Data Isolation
- Program data isolation between users
- Role-based data access patterns
- Cross-program data access prevention
- Invalid program context handling
- Security vulnerability testing

## Recommendations

1. **Continue Regular Testing**: Run these tests before any deployment
2. **Expand Test Coverage**: Add more edge cases as new scenarios are discovered
3. **Monitor Security**: Regular security scans for program context vulnerabilities
4. **Performance Testing**: Add performance tests for role-based filtering
5. **Documentation**: Keep role-based access documentation updated

Generated on: {__import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
"""
    
    try:
        with open('role_based_access_test_report.md', 'w') as f:
            f.write(report_content)
        print(f"\n📄 Test report generated: role_based_access_test_report.md")
    except Exception as e:
        print(f"❌ Failed to generate test report: {e}")


if __name__ == "__main__":
    sys.exit(main())