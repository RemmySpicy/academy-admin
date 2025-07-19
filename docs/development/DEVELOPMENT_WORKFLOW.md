# Development Workflow

## Daily Development Commands

### Quick Start
```bash
# RECOMMENDED: Full Docker development
docker compose up

# Alternative: Local development with PostgreSQL
./start-dev.sh
```

### Quality Assurance (MANDATORY)
```bash
# Before starting any feature
npm run program-context:lint
npm run security:scan

# During development
npm run quality:academy
npm run quality:academy:fix

# Before committing
npm run quality:academy:ci
npm run deploy:check
```

## New Feature Development Process

### 1. Planning Phase
- Determine: Academy Administration vs Program Management?
- Identify required roles and access levels
- Plan program context requirements
- Use TodoWrite tool for task tracking

### 2. Implementation Phase
```bash
# Check current compliance
npm run program-context:lint

# Implement following program context standards:
# - Models: Include program_id field
# - Services: Accept program_context parameter  
# - Routes: Use program context dependency injection
# - Tests: Include program context filtering tests
```

### 3. Quality Checks
```bash
# Comprehensive Academy Admin checks
npm run quality:academy

# Security scanning
npm run security:scan

# Test coverage validation
npm run test:coverage:program-context
```

### 4. Testing Requirements
- Role-based access control tests
- Program context filtering tests
- Cross-program access prevention tests
- Multi-role scenario tests

## Git Workflow
- Git hooks automatically run quality checks
- Pre-commit: Program context + security scanning
- Pre-push: Full quality validation

## Code Standards
- Follow existing patterns in codebase
- Use shadcn/ui components consistently
- Maintain TypeScript strict mode
- Follow security best practices
- Never commit secrets or hardcoded credentials

## Documentation Updates
- Update feature specs in `/specs/` directory
- Update API documentation for new endpoints
- Add examples to relevant documentation files