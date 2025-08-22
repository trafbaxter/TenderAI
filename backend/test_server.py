from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, date
from enum import Enum
import uuid
import os

# Initialize FastAPI app
app = FastAPI(title="TenderMatch AI API", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock database for testing
mock_db = {
    'agent_configs': {},
    'tenders': {},
    'portfolio': {},
    'meetings': {}
}

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

def prepare_for_storage(data: dict):
    """Prepare data for storage"""
    prepared = data.copy()
    
    # Remove None values and id field
    prepared = {k: v for k, v in prepared.items() if v is not None and k != 'id'}
    
    # Add timestamps
    now = datetime.utcnow()
    if 'created_at' not in prepared:
        prepared['created_at'] = now
    prepared['updated_at'] = now
    
    return prepared

def serialize_data(data: dict, doc_id: str):
    """Convert data to response format"""
    result = data.copy()
    result['id'] = doc_id
    
    # Convert datetime objects to ISO strings
    for key, value in result.items():
        if isinstance(value, datetime):
            result[key] = value.isoformat()
        elif isinstance(value, date):
            result[key] = value.isoformat()
    
    return result

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
    config_data = prepare_for_storage(config.dict())
    
    mock_db['agent_configs'][doc_id] = config_data
    
    return serialize_data(config_data, doc_id)

@app.get("/api/agent-config/{config_id}", response_model=AgentConfigModel)
async def get_agent_config(config_id: str):
    if config_id not in mock_db['agent_configs']:
        raise HTTPException(status_code=404, detail="Agent config not found")
    
    return serialize_data(mock_db['agent_configs'][config_id], config_id)

@app.get("/api/agent-config", response_model=List[AgentConfigModel])
async def list_agent_configs():
    results = []
    for doc_id, data in mock_db['agent_configs'].items():
        results.append(serialize_data(data, doc_id))
    
    # Sort by created_at descending
    results.sort(key=lambda x: x.get('created_at', ''), reverse=True)
    return results

# Tender endpoints
@app.post("/api/tenders", response_model=TenderModel)
async def create_tender(tender: TenderModel):
    doc_id = generate_id()
    tender_data = prepare_for_storage(tender.dict())
    
    mock_db['tenders'][doc_id] = tender_data
    
    return serialize_data(tender_data, doc_id)

@app.get("/api/tenders/{tender_id}", response_model=TenderModel)
async def get_tender(tender_id: str):
    if tender_id not in mock_db['tenders']:
        raise HTTPException(status_code=404, detail="Tender not found")
    
    return serialize_data(mock_db['tenders'][tender_id], tender_id)

@app.get("/api/tenders", response_model=List[TenderModel])
async def list_tenders(
    limit: int = Query(default=50, le=100),
    status: Optional[TenderStatus] = None,
    min_match_score: Optional[float] = None
):
    results = []
    for doc_id, data in mock_db['tenders'].items():
        # Apply filters
        if status and data.get('status') != status.value:
            continue
        if min_match_score and (data.get('match_score', 0) < min_match_score):
            continue
        
        results.append(serialize_data(data, doc_id))
    
    # Sort by created_at descending and limit
    results.sort(key=lambda x: x.get('created_at', ''), reverse=True)
    return results[:limit]

@app.put("/api/tenders/{tender_id}", response_model=TenderModel)
async def update_tender(tender_id: str, tender: TenderModel):
    if tender_id not in mock_db['tenders']:
        raise HTTPException(status_code=404, detail="Tender not found")
    
    tender_data = prepare_for_storage(tender.dict())
    # Keep original created_at
    if 'created_at' in mock_db['tenders'][tender_id]:
        tender_data['created_at'] = mock_db['tenders'][tender_id]['created_at']
    
    mock_db['tenders'][tender_id] = tender_data
    
    return serialize_data(tender_data, tender_id)

# Portfolio endpoints
@app.post("/api/portfolio", response_model=PortfolioModel)
async def create_portfolio_item(portfolio: PortfolioModel):
    doc_id = generate_id()
    portfolio_data = prepare_for_storage(portfolio.dict())
    
    mock_db['portfolio'][doc_id] = portfolio_data
    
    return serialize_data(portfolio_data, doc_id)

@app.get("/api/portfolio/{portfolio_id}", response_model=PortfolioModel)
async def get_portfolio_item(portfolio_id: str):
    if portfolio_id not in mock_db['portfolio']:
        raise HTTPException(status_code=404, detail="Portfolio item not found")
    
    return serialize_data(mock_db['portfolio'][portfolio_id], portfolio_id)

@app.get("/api/portfolio", response_model=List[PortfolioModel])
async def list_portfolio_items(
    limit: int = Query(default=50, le=100),
    category: Optional[PortfolioCategory] = None,
    status: Optional[PortfolioStatus] = None
):
    results = []
    for doc_id, data in mock_db['portfolio'].items():
        # Apply filters
        if category and data.get('category') != category.value:
            continue
        if status and data.get('status') != status.value:
            continue
        
        results.append(serialize_data(data, doc_id))
    
    # Sort by created_at descending and limit
    results.sort(key=lambda x: x.get('created_at', ''), reverse=True)
    return results[:limit]

@app.put("/api/portfolio/{portfolio_id}", response_model=PortfolioModel)
async def update_portfolio_item(portfolio_id: str, portfolio: PortfolioModel):
    if portfolio_id not in mock_db['portfolio']:
        raise HTTPException(status_code=404, detail="Portfolio item not found")
    
    portfolio_data = prepare_for_storage(portfolio.dict())
    # Keep original created_at
    if 'created_at' in mock_db['portfolio'][portfolio_id]:
        portfolio_data['created_at'] = mock_db['portfolio'][portfolio_id]['created_at']
    
    mock_db['portfolio'][portfolio_id] = portfolio_data
    
    return serialize_data(portfolio_data, portfolio_id)

@app.delete("/api/portfolio/{portfolio_id}")
async def delete_portfolio_item(portfolio_id: str):
    if portfolio_id not in mock_db['portfolio']:
        raise HTTPException(status_code=404, detail="Portfolio item not found")
    
    del mock_db['portfolio'][portfolio_id]
    return {"message": "Portfolio item deleted successfully"}

# Meeting endpoints
@app.post("/api/meetings", response_model=MeetingModel)
async def create_meeting(meeting: MeetingModel):
    doc_id = generate_id()
    meeting_data = prepare_for_storage(meeting.dict())
    
    mock_db['meetings'][doc_id] = meeting_data
    
    return serialize_data(meeting_data, doc_id)

@app.get("/api/meetings", response_model=List[MeetingModel])
async def list_meetings(
    limit: int = Query(default=50, le=100),
    tender_id: Optional[str] = None
):
    results = []
    for doc_id, data in mock_db['meetings'].items():
        # Apply filters
        if tender_id and data.get('tender_id') != tender_id:
            continue
        
        results.append(serialize_data(data, doc_id))
    
    # Sort by start_time descending and limit
    results.sort(key=lambda x: x.get('start_time', ''), reverse=True)
    return results[:limit]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)