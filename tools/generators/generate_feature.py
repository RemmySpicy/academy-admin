#!/usr/bin/env python3
"""
Academy Admin - Feature Generator CLI
Complete feature generation with program context support
"""

import os
import sys
import argparse
from pathlib import Path
from datetime import datetime

# Add the tools directory to the path
sys.path.insert(0, str(Path(__file__).parent))

from service_template import ServiceTemplateGenerator
from frontend_template import FrontendTemplateGenerator


def main():
    """Main CLI for feature generation."""
    parser = argparse.ArgumentParser(
        description="Generate complete Academy Admin features with program context support",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Generate complete full-stack feature
  python generate_feature.py "User Management"
  
  # Generate only backend
  python generate_feature.py "Inventory Items" --backend-only
  
  # Generate only frontend
  python generate_feature.py "Task Management" --frontend-only
  
  # Custom paths
  python generate_feature.py "Reports" --backend-path="backend/app/modules" --frontend-path="frontend/src/modules"
        """
    )
    
    parser.add_argument(
        "feature_name",
        help="Name of the feature to generate (e.g., 'User Management', 'inventory-items')"
    )
    
    parser.add_argument(
        "--backend-only",
        action="store_true",
        help="Generate only backend service templates"
    )
    
    parser.add_argument(
        "--frontend-only", 
        action="store_true",
        help="Generate only frontend components"
    )
    
    parser.add_argument(
        "--backend-path",
        default="backend/app/features",
        help="Base path for backend generation (default: backend/app/features)"
    )
    
    parser.add_argument(
        "--frontend-path",
        default="frontend/src/features", 
        help="Base path for frontend generation (default: frontend/src/features)"
    )
    
    parser.add_argument(
        "--force",
        action="store_true",
        help="Overwrite existing files (use with caution)"
    )
    
    args = parser.parse_args()
    
    # Validation
    if args.backend_only and args.frontend_only:
        print("❌ Error: Cannot specify both --backend-only and --frontend-only")
        sys.exit(1)
    
    feature_name = args.feature_name
    generate_backend = not args.frontend_only
    generate_frontend = not args.backend_only
    
    print(f"🚀 Generating Academy Admin feature: '{feature_name}'")
    print(f"📅 Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    try:
        # Check if paths exist
        if generate_backend and not Path(args.backend_path).exists():
            print(f"⚠️  Backend path doesn't exist: {args.backend_path}")
            print("   Creating directory structure...")
            Path(args.backend_path).mkdir(parents=True, exist_ok=True)
            
        if generate_frontend and not Path(args.frontend_path).exists():
            print(f"⚠️  Frontend path doesn't exist: {args.frontend_path}")
            print("   Creating directory structure...")
            Path(args.frontend_path).mkdir(parents=True, exist_ok=True)
        
        # Generate backend
        if generate_backend:
            print("\n🔧 Generating backend service templates...")
            backend_generator = ServiceTemplateGenerator(feature_name, args.backend_path)
            
            # Check if feature already exists
            if backend_generator.feature_path.exists() and not args.force:
                print(f"⚠️  Backend feature already exists at: {backend_generator.feature_path}")
                response = input("Do you want to overwrite? (y/N): ")
                if response.lower() != 'y':
                    print("   Skipping backend generation")
                else:
                    backend_generator.generate_all()
            else:
                backend_generator.generate_all()
                
        # Generate frontend
        if generate_frontend:
            print("\n🎨 Generating frontend components...")
            frontend_generator = FrontendTemplateGenerator(feature_name, args.frontend_path)
            
            # Check if feature already exists
            if frontend_generator.feature_path.exists() and not args.force:
                print(f"⚠️  Frontend feature already exists at: {frontend_generator.feature_path}")
                response = input("Do you want to overwrite? (y/N): ")
                if response.lower() != 'y':
                    print("   Skipping frontend generation")
                else:
                    frontend_generator.generate_all()
            else:
                frontend_generator.generate_all()
                
        print("\n" + "=" * 60)
        print("🎉 Feature generation completed successfully!")
        
        # Show next steps
        print("\n📋 Next Steps:")
        print("1. Review generated files for customization")
        print("2. Add feature-specific business logic")
        print("3. Update database models if needed")
        print("4. Add routes to main API router")
        print("5. Integrate frontend components with navigation")
        print("6. Run quality checks:")
        print("   npm run quality:academy")
        print("7. Test program context filtering")
        print("8. Write tests for the new feature")
        
        # Show file locations
        if generate_backend:
            print(f"\n📁 Backend files: {backend_generator.feature_path}")
        if generate_frontend:
            print(f"📁 Frontend files: {frontend_generator.feature_path}")
            
        print("\n🔍 Don't forget to:")
        print("- Update your main API router to include the new routes")
        print("- Add the new feature to your navigation menu")
        print("- Test the program context filtering works correctly")
        print("- Add appropriate permissions and role checks")
        
    except KeyboardInterrupt:
        print("\n❌ Generation cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error generating feature: {e}")
        print("\nIf you need help, check:")
        print("1. Directory permissions")
        print("2. Valid feature name format")
        print("3. Existing file conflicts")
        sys.exit(1)


if __name__ == "__main__":
    main()