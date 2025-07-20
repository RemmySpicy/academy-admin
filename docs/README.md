# Academy Admin Documentation

## 📚 Documentation Structure

### 🚀 **Setup & Getting Started**
- [`setup/PROJECT_SETUP.md`](setup/PROJECT_SETUP.md) - Quick start and daily development commands
- [`setup/DEPLOYMENT.md`](setup/DEPLOYMENT.md) - Production deployment guide

### 🏗️ **Architecture & Design**
- [`architecture/SYSTEM_OVERVIEW.md`](architecture/SYSTEM_OVERVIEW.md) - High-level system architecture
- [`architecture/PROGRAM_CONTEXT_ARCHITECTURE.md`](architecture/PROGRAM_CONTEXT_ARCHITECTURE.md) - Program-centric design principles
- [`architecture/DATABASE_SCHEMA.md`](architecture/DATABASE_SCHEMA.md) - Database design and relationships
- [`architecture/FRONTEND_LAYOUT_ARCHITECTURE.md`](architecture/FRONTEND_LAYOUT_ARCHITECTURE.md) - 🆕 Frontend layout and UI architecture

### 💻 **Development**
- [`development/DEVELOPMENT_WORKFLOW.md`](development/DEVELOPMENT_WORKFLOW.md) - Daily development process
- [`development/DEVELOPMENT_STANDARDS.md`](development/DEVELOPMENT_STANDARDS.md) - Code quality and standards

### 🔌 **API Reference**
- [`api/API_ENDPOINTS.md`](api/API_ENDPOINTS.md) - Complete API endpoint documentation

### ⚙️ **Features**
- [`features/courses/README.md`](features/courses/README.md) - Course management system
- [`features/facilities/README.md`](features/facilities/README.md) - Facility management system
- [`features/students/README.md`](features/students/README.md) - ✅ **Unified Students & Parents Management System** (Fully Implemented)
- [`features/scheduling/README.md`](features/scheduling/README.md) - Scheduling system *(to be updated)*
- [`features/authentication/README.md`](features/authentication/README.md) - Authentication & authorization system

## 🎯 **Quick Access by Role**

### **Super Admin**
- Read: All documentation sections
- Focus: [`architecture/SYSTEM_OVERVIEW.md`](architecture/SYSTEM_OVERVIEW.md), Academy Administration features

### **Program Admin**
- Read: All sections except academy administration
- Focus: [`features/`](features/) documentation, [`development/DEVELOPMENT_WORKFLOW.md`](development/DEVELOPMENT_WORKFLOW.md)

### **Developers**
- Read: [`development/`](development/) and [`architecture/`](architecture/) sections
- Focus: [`development/DEVELOPMENT_STANDARDS.md`](development/DEVELOPMENT_STANDARDS.md), [`api/API_ENDPOINTS.md`](api/API_ENDPOINTS.md)

## 📋 **Documentation Standards**

### **When to Update Documentation**
- ✅ After implementing new features
- ✅ When changing API endpoints
- ✅ When modifying architecture
- ✅ When updating development processes

### **Documentation Guidelines**
- Keep examples current with implementation
- Include program context requirements for all features
- Reference role-based access control for all features
- Maintain consistency across all documentation

### **File Organization**
- `README.md` files provide feature overviews
- Detailed specifications in dedicated files
- Cross-references between related documents
- Clear navigation and table of contents

## 🔄 **Migration from Specs Folder**

### **Consolidated Documentation**
The previous `/specs/` folder contained outdated specifications that have been consolidated into this `/docs/` structure:

- **specs/api/** → **docs/api/** (updated with current implementation)
- **specs/features/** → **docs/features/** (updated with program context)
- **specs/database/** → **docs/architecture/DATABASE_SCHEMA.md** (current schema)
- **specs/system-overview.md** → **docs/architecture/SYSTEM_OVERVIEW.md** (updated architecture)

### **What Was Removed**
- Outdated API specifications missing program context
- Database schemas not reflecting current implementation
- Feature specifications missing role-based access control
- UI specifications for unimplemented features

### **What Was Preserved**
- Core architectural principles (updated)
- Feature requirements (updated with current implementation)
- API patterns (updated with program context)
- Development guidelines (enhanced)

## 🔍 **Finding Information**

### **For Setup Issues**
👉 Start with [`setup/PROJECT_SETUP.md`](setup/PROJECT_SETUP.md)

### **For Architecture Questions**
👉 Check [`architecture/PROGRAM_CONTEXT_ARCHITECTURE.md`](architecture/PROGRAM_CONTEXT_ARCHITECTURE.md)

### **For API Development**
👉 Reference [`api/API_ENDPOINTS.md`](api/API_ENDPOINTS.md)

### **For Feature Implementation**
👉 Look in [`features/[feature-name]/README.md`](features/)

### **For Development Process**
👉 Follow [`development/DEVELOPMENT_WORKFLOW.md`](development/DEVELOPMENT_WORKFLOW.md)

---

**Remember**: This documentation is your single source of truth. When in doubt, check here first!