# Auto-Restart Development Workflow

## Overview

The Academy Admin project now includes sophisticated auto-restart functionality that automatically restarts Docker containers when frontend changes are detected. This dramatically improves the development experience by eliminating manual container restarts.

## Quick Start Commands

### Recommended Development Workflow

```bash
# Start development with auto-restart (RECOMMENDED)
npm run dev:auto:watch

# This will:
# 1. Start all Docker services (backend, frontend, database)
# 2. Monitor frontend files for changes
# 3. Automatically restart frontend container on changes
# 4. Provide health checks and status updates
```

### Alternative Commands

```bash
# Basic Docker development (no auto-restart)
npm run dev

# Manual frontend restart
npm run restart:frontend

# Watch-only mode (shows changes but no auto-restart)
npm run dev:watch

# Auto-restart frontend only
npm run dev:auto-restart

# Auto-restart all services
npm run dev:auto-restart:all
```

## What Gets Monitored

The auto-restart system monitors the following files and directories:

### Frontend Files
- `frontend/src/` - All source code files
- `frontend/public/` - Static assets
- `frontend/package.json` - Dependencies
- `frontend/package-lock.json` - Dependency lock file
- `frontend/next.config.js` - Next.js configuration
- `frontend/tailwind.config.js` - Tailwind CSS configuration
- `frontend/tsconfig.json` - TypeScript configuration
- `shared/` - Shared resources across apps

### Excluded Files
- `node_modules/` - Dependencies (ignored)
- `.next/` - Next.js build files (ignored)
- `.git/` - Git files (ignored)
- `dist/` - Build output (ignored)

## How It Works

### 1. File System Monitoring
- **Linux**: Uses `inotifywait` for efficient file system events
- **macOS**: Uses `fswatch` for file system monitoring
- **WSL**: Uses optimized polling method for Windows Subsystem for Linux
- **Fallback**: Polling method for systems without native file watchers

### 2. Smart Restart Logic
```bash
Change Detected → Validate Change Type → Stop Frontend Container → Start Frontend Container → Health Check → Ready!
```

### 3. Health Checks
After restarting, the system verifies:
- Container is running
- Frontend responds at `http://localhost:3000`
- No startup errors occurred

## Scripts and Files

### Main Scripts
- `scripts/dev-auto-restart.sh` - Core auto-restart functionality
- `scripts/dev-watch.sh` - File watching without restart
- `scripts/restart-frontend.sh` - Manual restart utility
- `start-dev-auto.sh` - Development environment starter

### Docker Configuration
- `docker-compose.dev.yml` - Development overrides with auto-restart support
- Enhanced volume mounting for efficient file watching
- Development-specific environment variables

## Usage Examples

### Basic Auto-Restart Development
```bash
# Start everything with auto-restart
npm run dev:auto:watch

# Make changes to frontend/src/components/SomeComponent.tsx
# → Frontend container automatically restarts
# → Changes visible at http://localhost:3000
```

### Manual Control
```bash
# Start services without auto-restart
npm run dev

# Make changes, then manually restart
npm run restart:frontend
```

### Debugging File Watching
```bash
# See what files are being watched (no auto-restart)
npm run dev:watch

# This shows detected changes without taking action
```

## Environment-Specific Optimizations

### Windows Subsystem for Linux (WSL)
- Uses polling instead of native file events
- Optimized polling intervals to balance performance and responsiveness
- Special handling for cross-platform file system differences

### Docker Desktop
- Efficient volume mounting strategies
- Proper container restart sequencing
- Health check integration

### Performance Tuning
- Excludes irrelevant directories from monitoring
- Batches multiple rapid changes
- Implements cooldown periods to prevent restart loops

## Troubleshooting

### Auto-Restart Not Working
```bash
# Check if file watcher tools are installed
# Linux:
sudo apt-get install inotify-tools

# macOS:
brew install fswatch

# Check Docker status
docker compose ps

# Check container logs
docker compose logs -f frontend
```

### Container Won't Start
```bash
# Check for port conflicts
lsof -i :3000

# Restart all services
docker compose down && npm run dev:auto:watch

# Check Docker resources
docker system df
docker system prune  # If needed
```

### File Changes Not Detected
```bash
# Verify file watching is active
npm run dev:watch

# Check file permissions
ls -la frontend/src/

# For WSL, ensure files are on WSL filesystem
pwd  # Should show /mnt/c/... or /home/...
```

## Performance Considerations

### Resource Usage
- File watching uses minimal CPU and memory
- Docker container restarts are optimized for speed
- Health checks prevent premature "ready" signals

### Network Impact
- Automatic restart minimizes manual intervention
- Parallel service startup where possible
- Graceful shutdown prevents connection issues

## Advanced Configuration

### Custom Watch Paths
Edit `scripts/dev-auto-restart.sh` to modify watched directories:

```bash
# Add new paths to watch
inotifywait -m -r -e modify,create,delete,move \
    frontend/src \
    frontend/public \
    your/custom/path \  # Add here
    ...
```

### Custom Restart Logic
Override restart behavior in `docker-compose.dev.yml`:

```yaml
frontend:
  restart: unless-stopped  # Change restart policy
  environment:
    - CUSTOM_VAR=value     # Add custom environment
```

## Integration with IDE

### VS Code
Add to `.vscode/tasks.json`:
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start Dev Auto-Restart",
      "type": "shell",
      "command": "npm run dev:auto:watch",
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "new"
      }
    }
  ]
}
```

### Terminal Integration
Add to your shell profile (`.bashrc`, `.zshrc`):
```bash
alias academy-dev="cd /path/to/academy-admin && npm run dev:auto:watch"
alias academy-restart="cd /path/to/academy-admin && npm run restart:frontend"
```

## Best Practices

### Development Workflow
1. Start with `npm run dev:auto:watch`
2. Make incremental changes
3. Let auto-restart handle container updates
4. Use `npm run restart:frontend` for manual control when needed
5. Monitor logs with `docker compose logs -f frontend`

### File Organization
- Keep components modular for faster restart cycles
- Use proper TypeScript imports for better hot reload
- Avoid large single files that trigger unnecessary restarts

### Resource Management
- Close unused containers with `docker compose down`
- Periodically clean Docker resources: `docker system prune`
- Monitor disk usage in development

## Security Considerations

- File watching only monitors development files
- No production credentials in watched files
- Docker socket access limited to restart functionality
- Proper file permissions maintained during restart cycles

---

For more information, see:
- [Development Workflow](DEVELOPMENT_WORKFLOW.md)
- [Docker Setup](../setup/DOCKER_SETUP.md)
- [Troubleshooting](../troubleshooting/README.md)