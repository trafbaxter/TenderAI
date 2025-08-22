"""
Entry point for Google Cloud Buildpacks and general deployment
Provides both WSGI/ASGI application and direct execution capability
"""
import os
import sys

# Ensure the current directory is in Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

try:
    from server import app
    print("[MAIN] Successfully imported FastAPI app from server module")
    
    # Make app available at module level for Gunicorn and other WSGI servers
    application = app
    
    # Also make it available as 'app' for compatibility
    app = app
    print("[MAIN] App variables configured for WSGI deployment")
    
except ImportError as e:
    error_msg = f"Server module import failed: {e}"
    print(f"[MAIN] Error importing server module: {e}")
    print("[MAIN] Creating fallback FastAPI app")
    # Create a minimal fallback app
    from fastapi import FastAPI
    app = FastAPI()
    application = app
    
    @app.get("/")
    def root():
        return {"status": "error", "message": error_msg}

    @app.get("/health")
    def health():
        return {"status": "error", "message": error_msg}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8080))
    print(f"Starting server on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port)