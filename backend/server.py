from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from google.cloud import firestore
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, date
from enum import Enum
import uuid
import os

print(f"[STARTUP] Server module loading...")
print(f"[STARTUP] Current working directory: {os.getcwd()}")
print(f"[STARTUP] PORT environment variable: {os.environ.get('PORT', 'Not set')}")

# Initialize FastAPI app
app = FastAPI(title="TenderMatch AI API", version="1.0.0")
print(f"[STARTUP] FastAPI app created successfully")

# Health check endpoint
@app.get("/")
def health_check():
    """Health check endpoint for load balancers and monitoring"""
    return {
        "status": "healthy",
        "service": "TenderMatch AI API",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
def detailed_health_check():
    """Detailed health check with system status"""
    return {
        "status": "healthy",
        "service": "TenderMatch AI API", 
        "version": "1.0.0",
        "database": "connected" if db else "disconnected",
        "timestamp": datetime.now().isoformat(),
        "environment": {
            "port": os.environ.get("PORT", "not-set"),
            "project": os.environ.get("GOOGLE_CLOUD_PROJECT", "not-set")
        }
    }

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Firestore client with error handling
try:
    db = firestore.Client()
except Exception as e:
    print(f"Warning: Firestore client initialization failed: {e}")
    # Create a mock client for development
    db = None

# Pydantic models based on entity schemas

class AgentConfigModel(BaseModel):
    id: Optional[str] = None
    search_keywords: List[str] = []
    preferred_categories: List[str] = []
    min_budget: Optional[float] = None
    max_budget: Optional[float] = None
    preferred_locations: List[str] = []
    scraping_frequency: str = "daily"
    minimum_match_score: float = 70
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class TenderStatus(str, Enum):
    active = "active"
    interested = "interested"
    applied = "applied"
    closed = "closed"

class TenderModel(BaseModel):
    id: Optional[str] = None
    title: str
    description: str
    organization: str
    category: Optional[str] = None
    budget_min: Optional[float] = None
    budget_max: Optional[float] = None
    deadline: Optional[date] = None
    location: Optional[str] = None
    requirements: List[str] = []
    source_url: Optional[str] = None
    match_score: Optional[float] = None
    matched_portfolio_items: List[str] = []
    status: TenderStatus = TenderStatus.active
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class PortfolioCategory(str, Enum):
    construction = "construction"
    consulting = "consulting"
    technology = "technology"
    healthcare = "healthcare"
    education = "education"
    manufacturing = "manufacturing"
    services = "services"
    research = "research"
    logistics = "logistics"
    other = "other"

class PortfolioStatus(str, Enum):
    active = "active"
    completed = "completed"
    ongoing = "ongoing"

class PortfolioModel(BaseModel):
    id: Optional[str] = None
    title: str
    description: str
    category: PortfolioCategory
    tags: List[str] = []
    project_value: Optional[float] = None
    completion_date: Optional[date] = None
    client_name: Optional[str] = None
    status: PortfolioStatus = PortfolioStatus.active
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class MeetingPlatform(str, Enum):
    zoom = "zoom"
    teams = "teams"
    google_meet = "google_meet"
    webex = "webex"

class MeetingStatus(str, Enum):
    scheduled = "scheduled"
    in_progress = "in_progress"
    completed = "completed"
    cancelled = "cancelled"

class MeetingModel(BaseModel):
    id: Optional[str] = None
    tender_id: Optional[str] = None
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    platform: Optional[MeetingPlatform] = None
    meeting_url: Optional[str] = None
    attendees: List[str] = []
    agenda: Optional[str] = None
    status: MeetingStatus = MeetingStatus.scheduled
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

# Helper functions
def generate_id():
    return str(uuid.uuid4())

def serialize_document(doc):
    """Convert Firestore document to dict with proper datetime handling"""
    data = doc.to_dict()
    data['id'] = doc.id
    
    # Convert datetime objects to ISO strings
    for key, value in data.items():
        if isinstance(value, datetime):
            data[key] = value.isoformat()
        elif isinstance(value, date):
            data[key] = value.isoformat()
    
    return data

def prepare_for_firestore(data: dict):
    """Prepare data for Firestore storage"""
    prepared = data.copy()
    
    # Remove None values and id field
    prepared = {k: v for k, v in prepared.items() if v is not None and k != 'id'}
    
    # Add timestamps
    now = datetime.utcnow()
    if 'created_at' not in prepared:
        prepared['created_at'] = now
    prepared['updated_at'] = now
    
    return prepared

# API Routes

@app.get("/")
async def root():
    return {"message": "TenderMatch AI API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

# Agent Config endpoints
@app.post("/api/agent-config", response_model=AgentConfigModel)
async def create_agent_config(config: AgentConfigModel):
    doc_id = generate_id()
    config_data = prepare_for_firestore(config.dict())
    
    db.collection('agent_configs').document(doc_id).set(config_data)
    
    doc = db.collection('agent_configs').document(doc_id).get()
    return serialize_document(doc)

@app.get("/api/agent-config/{config_id}", response_model=AgentConfigModel)
async def get_agent_config(config_id: str):
    doc = db.collection('agent_configs').document(config_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Agent config not found")
    return serialize_document(doc)

@app.get("/api/agent-config", response_model=List[AgentConfigModel])
async def list_agent_configs():
    docs = db.collection('agent_configs').order_by('created_at', direction=firestore.Query.DESCENDING).stream()
    return [serialize_document(doc) for doc in docs]

# Tender endpoints
@app.post("/api/tenders", response_model=TenderModel)
async def create_tender(tender: TenderModel):
    doc_id = generate_id()
    tender_data = prepare_for_firestore(tender.dict())
    
    db.collection('tenders').document(doc_id).set(tender_data)
    
    doc = db.collection('tenders').document(doc_id).get()
    return serialize_document(doc)

@app.get("/api/tenders/{tender_id}", response_model=TenderModel)
async def get_tender(tender_id: str):
    doc = db.collection('tenders').document(tender_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Tender not found")
    return serialize_document(doc)

@app.get("/api/tenders", response_model=List[TenderModel])
async def list_tenders(
    limit: int = Query(default=50, le=100),
    status: Optional[TenderStatus] = None,
    min_match_score: Optional[float] = None
):
    query = db.collection('tenders')
    
    if status:
        query = query.where('status', '==', status.value)
    
    if min_match_score:
        query = query.where('match_score', '>=', min_match_score)
    
    query = query.order_by('created_at', direction=firestore.Query.DESCENDING).limit(limit)
    docs = query.stream()
    
    return [serialize_document(doc) for doc in docs]

@app.put("/api/tenders/{tender_id}", response_model=TenderModel)
async def update_tender(tender_id: str, tender: TenderModel):
    doc_ref = db.collection('tenders').document(tender_id)
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Tender not found")
    
    tender_data = prepare_for_firestore(tender.dict())
    doc_ref.update(tender_data)
    
    doc = doc_ref.get()
    return serialize_document(doc)

# Portfolio endpoints
@app.post("/api/portfolio", response_model=PortfolioModel)
async def create_portfolio_item(portfolio: PortfolioModel):
    doc_id = generate_id()
    portfolio_data = prepare_for_firestore(portfolio.dict())
    
    db.collection('portfolio').document(doc_id).set(portfolio_data)
    
    doc = db.collection('portfolio').document(doc_id).get()
    return serialize_document(doc)

@app.get("/api/portfolio/{portfolio_id}", response_model=PortfolioModel)
async def get_portfolio_item(portfolio_id: str):
    doc = db.collection('portfolio').document(portfolio_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Portfolio item not found")
    return serialize_document(doc)

@app.get("/api/portfolio", response_model=List[PortfolioModel])
async def list_portfolio_items(
    limit: int = Query(default=50, le=100),
    category: Optional[PortfolioCategory] = None,
    status: Optional[PortfolioStatus] = None
):
    query = db.collection('portfolio')
    
    if category:
        query = query.where('category', '==', category.value)
    
    if status:
        query = query.where('status', '==', status.value)
    
    query = query.order_by('created_at', direction=firestore.Query.DESCENDING).limit(limit)
    docs = query.stream()
    
    return [serialize_document(doc) for doc in docs]

@app.put("/api/portfolio/{portfolio_id}", response_model=PortfolioModel)
async def update_portfolio_item(portfolio_id: str, portfolio: PortfolioModel):
    doc_ref = db.collection('portfolio').document(portfolio_id)
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Portfolio item not found")
    
    portfolio_data = prepare_for_firestore(portfolio.dict())
    doc_ref.update(portfolio_data)
    
    doc = doc_ref.get()
    return serialize_document(doc)

@app.delete("/api/portfolio/{portfolio_id}")
async def delete_portfolio_item(portfolio_id: str):
    doc_ref = db.collection('portfolio').document(portfolio_id)
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Portfolio item not found")
    
    doc_ref.delete()
    return {"message": "Portfolio item deleted successfully"}

# Meeting endpoints
@app.post("/api/meetings", response_model=MeetingModel)
async def create_meeting(meeting: MeetingModel):
    doc_id = generate_id()
    meeting_data = prepare_for_firestore(meeting.dict())
    
    db.collection('meetings').document(doc_id).set(meeting_data)
    
    doc = db.collection('meetings').document(doc_id).get()
    return serialize_document(doc)

@app.get("/api/meetings", response_model=List[MeetingModel])
async def list_meetings(
    limit: int = Query(default=50, le=100),
    tender_id: Optional[str] = None
):
    query = db.collection('meetings')
    
    if tender_id:
        query = query.where('tender_id', '==', tender_id)
    
    query = query.order_by('start_time', direction=firestore.Query.DESCENDING).limit(limit)
    docs = query.stream()
    
    return [serialize_document(doc) for doc in docs]

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)