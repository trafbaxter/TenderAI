# This is the entry point for Google Cloud buildpacks
# It imports and runs our FastAPI server

if __name__ == "__main__":
    import uvicorn
    from server import app
    
    # Use PORT environment variable if available, otherwise default to 8080
    import os
    port = int(os.environ.get("PORT", 8080))
    
    uvicorn.run(app, host="0.0.0.0", port=port)