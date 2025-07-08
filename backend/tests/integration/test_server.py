#!/usr/bin/env python3
"""
Simple test server for the Academy Admin API
"""
import sys
import os

# Add the current directory to the path so we can import our modules
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from app.main import app
    print("Successfully imported app")
    
    # Check routes
    print("\nRoutes registered in app:")
    for route in app.routes:
        path = getattr(route, 'path', 'N/A')
        methods = getattr(route, 'methods', 'N/A')
        print(f"  {path} - {methods}")
        
    # Start the server
    import uvicorn
    print("\nStarting server...")
    uvicorn.run(app, host="127.0.0.1", port=8000)
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()