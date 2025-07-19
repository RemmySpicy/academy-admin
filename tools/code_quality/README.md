# Academy Admin Code Quality Tools

Comprehensive code quality and security tools specifically designed for the Academy Admin system to enforce program context filtering standards and prevent security vulnerabilities.

## 🎯 Overview

These tools ensure that every feature in Academy Admin follows consistent program context filtering patterns, preventing security vulnerabilities and maintaining data isolation between programs.

## 🛠️ Tools Included

### 1. Program Context Linter (`program_context_linter.py`)

**Purpose**: Enforces program context filtering standards across all features.

**Checks**:
- Model files have `program_id` foreign key fields
- Service methods accept `program_context` parameter
- Database queries filter by program context
- Schemas include program context fields
- Route handlers use program context dependency injection

**Usage**:
```bash
# Check all backend files
python3 tools/code_quality/program_context_linter.py --check-all

# Check specific file
python3 tools/code_quality/program_context_linter.py backend/app/features/students/services/student_service.py

# Get JSON output
python3 tools/code_quality/program_context_linter.py --check-all --json

# Using npm script
npm run program-context:lint
```

### 2. Security Scanner (`security_scanner.py`)

**Purpose**: Detects security vulnerabilities and program context bypass attempts.

**Checks**:
- Program context bypass vulnerabilities
- SQL injection risks
- Hardcoded secrets and sensitive data
- Unsafe deserialization
- Missing access control
- Privilege escalation risks

**Usage**:
```bash
# Scan all backend files
python3 tools/code_quality/security_scanner.py --scan-all

# Generate JSON report
python3 tools/code_quality/security_scanner.py --scan-all --report-format json

# Save report to file
python3 tools/code_quality/security_scanner.py --scan-all --output reports/security_scan.json

# Using npm script
npm run security:scan
```

### 3. Test Coverage Checker (`test_coverage_checker.py`)

**Purpose**: Ensures adequate test coverage for program context filtering.

**Checks**:
- Service methods have corresponding tests
- Program context filtering tests exist
- Cross-program access prevention tests
- Role-based access control tests

**Usage**:
```bash
# Check test coverage
python3 tools/code_quality/test_coverage_checker.py --check-all

# Generate missing test files
python3 tools/code_quality/test_coverage_checker.py --check-all --generate-missing-tests

# Using npm script
npm run test:coverage:program-context
```

### 4. Comprehensive Quality Checker (`run_all_checks.py`)

**Purpose**: Runs all quality checks in a single command.

**Includes**:
- Program context linting
- Security scanning
- Test coverage checking
- Standard code quality (Black, isort, flake8, ESLint, Prettier)
- Type checking (mypy, TypeScript)
- Dependency vulnerability scanning

**Usage**:
```bash
# Run all checks
python3 tools/code_quality/run_all_checks.py

# Auto-fix issues where possible
python3 tools/code_quality/run_all_checks.py --fix

# Generate detailed reports
python3 tools/code_quality/run_all_checks.py --generate-reports

# CI mode (strict checking)
python3 tools/code_quality/run_all_checks.py --ci

# Using npm scripts
npm run quality:academy
npm run quality:academy:fix
npm run quality:academy:reports
```

### 5. Git Hooks

**Purpose**: Automatic quality checks during development workflow.

**Hooks**:
- **pre-commit**: Runs program context linting and security scanning
- **pre-push**: Runs full quality checks before pushing
- **commit-msg**: Validates commit message format

**Installation**:
```bash
# Install all hooks
./tools/code_quality/install_hooks.sh

# Or install manually
ln -s ../../tools/code_quality/pre_commit_hook.py .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Python dependencies (for security scanner)
pip install safety

# Make tools executable
chmod +x tools/code_quality/*.py
```

### 2. Run Initial Check

```bash
# Check current code quality
npm run quality:academy

# Generate baseline reports
npm run quality:academy:reports
```

### 3. Install Git Hooks

```bash
# Install automated checks
./tools/code_quality/install_hooks.sh
```

### 4. Fix Issues

```bash
# Auto-fix what can be fixed
npm run quality:academy:fix

# Manual fixes for remaining issues
# Follow the suggestions in the reports
```

## 📊 Reports and Output

### Report Formats

**Console Output**: Human-readable summary with colored output
**JSON Reports**: Machine-readable for CI/CD integration
**HTML Reports**: Detailed reports with code snippets

### Report Locations

```
reports/
├── quality_checks/
│   ├── summary.json              # Overall quality summary
│   ├── program_context_linting.json
│   ├── security_scan.json
│   └── test_coverage.txt
└── security_scan.json           # Standalone security report
```

## 🔧 Configuration

### Program Context Linter Configuration

Edit `tools/code_quality/program_context_linter.py` to customize:
- Required method prefixes
- Model validation rules
- Schema field requirements
- Route dependency patterns

### Security Scanner Configuration

Edit `tools/code_quality/security_scanner.py` to customize:
- Suspicious pattern detection
- Severity levels
- CWE (Common Weakness Enumeration) mappings
- Unsafe function detection

### Pylint Configuration

Edit `.pylintrc` to customize:
- Code style rules
- Academy Admin specific rules
- Disabled warnings
- Custom checkers

## 🎭 Usage in Development Workflow

### During Development

```bash
# Before working on a feature
npm run program-context:lint

# After implementing changes
npm run quality:academy

# Before committing (automatic via git hooks)
git add . && git commit -m "feat(students): add program context filtering"
```

### During Code Review

```bash
# Generate review reports
npm run quality:academy:reports

# Check security implications
npm run security:scan:report

# Validate test coverage
npm run test:coverage:program-context
```

### In CI/CD Pipeline

```bash
# Strict checking for CI
npm run quality:academy:ci

# This will fail the build if critical issues are found
```

## 🚨 Common Issues and Solutions

### Program Context Violations

**Issue**: Service method missing `program_context` parameter
**Solution**: Add `program_context: Optional[str] = None` to method signature

**Issue**: Missing database filtering
**Solution**: Add `if program_context: query = query.filter(Model.program_id == program_context)`

**Issue**: Schema missing `program_id` field
**Solution**: Add `program_id: str = Field(..., description="Program ID")`

### Security Violations

**Issue**: Hardcoded secrets detected
**Solution**: Move secrets to environment variables

**Issue**: SQL injection risk
**Solution**: Use parameterized queries or ORM methods

**Issue**: Missing access control
**Solution**: Add authentication and authorization dependencies

### Test Coverage Issues

**Issue**: Missing program context tests
**Solution**: Add tests for program filtering and cross-program access prevention

**Issue**: Incomplete role-based tests
**Solution**: Add tests for different user roles and permissions

## 📈 Metrics and Monitoring

### Quality Metrics

- **Program Context Compliance**: Percentage of features with proper filtering
- **Security Vulnerability Count**: Critical/High/Medium/Low severity issues
- **Test Coverage**: Program context filtering test coverage
- **Code Quality Score**: Overall code quality rating

### Monitoring

```bash
# Generate quality dashboard
npm run quality:academy:reports

# Track improvements over time
cat reports/quality_checks/summary.json | jq '.summary'
```

## 🤝 Contributing

When adding new features:

1. **Follow the standards**: Use `DEVELOPMENT_STANDARDS.md` as reference
2. **Run checks**: Use `npm run quality:academy` before committing
3. **Fix violations**: Address all program context and security issues
4. **Add tests**: Include program context filtering tests
5. **Update documentation**: Document any new patterns or requirements

## 📚 References

- [DEVELOPMENT_STANDARDS.md](../../DEVELOPMENT_STANDARDS.md) - Complete development standards
- [CLAUDE.md](../../CLAUDE.md) - Project architecture and guidelines
- [CWE Database](https://cwe.mitre.org/) - Common Weakness Enumeration
- [OWASP Top 10](https://owasp.org/www-project-top-ten/) - Security best practices

## 🔍 Troubleshooting

### Tool Execution Issues

```bash
# Make sure tools are executable
chmod +x tools/code_quality/*.py

# Check Python path
which python3

# Install missing dependencies
pip install -r requirements.txt
```

### Permission Issues

```bash
# Fix hook permissions
chmod +x .git/hooks/*

# Reinstall hooks
./tools/code_quality/install_hooks.sh
```

### Configuration Issues

```bash
# Validate configuration
python3 tools/code_quality/run_all_checks.py --generate-reports

# Check logs in reports directory
ls -la reports/quality_checks/
```

---

**🎯 Remember**: These tools are designed to prevent security vulnerabilities and maintain code quality. Always address critical and high-severity issues before deploying to production.