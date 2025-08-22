"""
Alternative entry point for Google Cloud Buildpacks
Redirects to the main FastAPI application in server.py
"""

from server import app

# This allows buildpacks to find the app
if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)