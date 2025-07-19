#!/bin/bash
"""
Academy Admin - Install Git Hooks

Installs git hooks for automated quality checks.
"""

echo "🔧 Installing Academy Admin Git Hooks..."

# Create hooks directory if it doesn't exist
mkdir -p .git/hooks

# Install pre-commit hook
echo "📋 Installing pre-commit hook..."
ln -sf ../../tools/code_quality/pre_commit_hook.py .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit

# Install pre-push hook (optional - runs full checks)
echo "🚀 Installing pre-push hook..."
cat > .git/hooks/pre-push << 'EOF'
#!/bin/bash
echo "🔍 Running full Academy Admin quality checks before push..."
python3 tools/code_quality/run_all_checks.py --ci
exit_code=$?

if [ $exit_code -ne 0 ]; then
    echo "❌ Quality checks failed. Fix issues before pushing."
    exit 1
fi

echo "✅ All quality checks passed!"
EOF

chmod +x .git/hooks/pre-push

# Install commit-msg hook for commit message validation
echo "💬 Installing commit-msg hook..."
cat > .git/hooks/commit-msg << 'EOF'
#!/bin/bash
# Validate commit message format
commit_regex='^(feat|fix|docs|style|refactor|test|chore|security|perf)(\(.+\))?: .{1,50}'

if ! grep -qE "$commit_regex" "$1"; then
    echo "❌ Invalid commit message format!"
    echo "Format: type(scope): description"
    echo "Types: feat, fix, docs, style, refactor, test, chore, security, perf"
    echo "Example: feat(auth): add program context filtering"
    exit 1
fi

# Check for security-related keywords
if grep -qiE "(password|secret|key|token)" "$1"; then
    echo "⚠️  Warning: Commit message contains sensitive keywords"
    echo "Make sure no secrets are exposed in the commit"
fi
EOF

chmod +x .git/hooks/commit-msg

echo "✅ Git hooks installed successfully!"
echo ""
echo "Hooks installed:"
echo "  🔒 pre-commit: Runs program context linting and security scanning"
echo "  🚀 pre-push: Runs full quality checks before pushing"
echo "  💬 commit-msg: Validates commit message format"
echo ""
echo "To test the hooks:"
echo "  git add . && git commit -m 'test: commit message'"
echo ""
echo "To bypass hooks (emergency only):"
echo "  git commit --no-verify"