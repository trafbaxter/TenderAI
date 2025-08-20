# This is the entry point for Google Cloud buildpacks
# It imports and runs our FastAPI server

if __name__ == "__main__":
    import uvicorn
    from server import app
    
    uvicorn.run(app, host="0.0.0.0", port=8001)