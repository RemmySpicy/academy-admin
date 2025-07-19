# Existing Code Directory

This directory is for placing the existing academy students app code that was started by a novice developer.

## 📂 Instructions

1. **Place existing code here**: Copy all existing student app files into this directory
2. **Preserve structure**: Maintain the original folder structure for reference
3. **Review and analyze**: Use this code as reference for rebuilding the app
4. **Extract useful parts**: Identify reusable components, screens, and logic

## 🔄 Migration Process

### Step 1: Place Code
```bash
# Copy existing code to this directory
cp -r /path/to/existing/student-app/* ./existing-code/
```

### Step 2: Analyze Structure
- Review existing components and screens
- Identify useful UI patterns
- Extract business logic
- Note any working API integrations

### Step 3: Rebuild
- Create new components in `../src/components/`
- Rebuild screens in `../src/screens/`
- Integrate with shared API client
- Apply academy design standards

### Step 4: Test and Validate
- Ensure feature parity with existing app
- Improve code quality and performance
- Add proper TypeScript types
- Write tests for new components

## 📝 Notes

- This directory is for reference only
- Do not modify files here directly
- Use as a guide for the new implementation
- Extract and improve patterns rather than copying directly

## 🗂️ Expected Structure

After placing existing code, you might see:
```
existing-code/
├── src/
│   ├── components/
│   ├── screens/
│   ├── navigation/
│   └── ...
├── assets/
├── package.json
└── ...
```

Review each directory and file to understand the current implementation before rebuilding.