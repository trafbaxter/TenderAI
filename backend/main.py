from fastapi import FastAPI, HTTPException, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import httpx
import asyncio
from datetime import datetime
import logging
import time
import os
from contextlib import asynccontextmanager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Environment configuration
N8N_BASE_URL = os.getenv("N8N_BASE_URL", "http://n8n:5678")
N8N_API_KEY = os.getenv("N8N_API_KEY", "n8n_api_key")
TENDERAI_API_KEY = os.getenv("TENDERAI_API_KEY", "tenderai_api_key")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info("TenderAI n8n Integration Service started")
    yield
    # Shutdown
    logger.info("TenderAI n8n Integration Service shutting down")


app = FastAPI(
    title="TenderAI n8n Integration Service",
    description="FastAPI backend with n8n workflow automation integration",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic models
class TenderData(BaseModel):
    tender_id: str = Field(..., description="Unique tender identifier")
    title: str = Field(..., description="Tender title")
    description: str = Field(..., description="Tender description")
    deadline: datetime = Field(..., description="Tender submission deadline")
    value: float = Field(..., description="Tender estimated value")
    category: str = Field(..., description="Tender category")
    source_url: str = Field(..., description="Original tender URL")
    requirements: List[str] = Field(default=[], description="Tender requirements")


class WorkflowTrigger(BaseModel):
    workflow_type: str = Field(..., description="Type of workflow to trigger")
    data: Dict[str, Any] = Field(..., description="Workflow input data")
    priority: str = Field(default="normal", description="Workflow priority")
    callback_url: Optional[str] = Field(None, description="Callback URL for results")


class N8nWebhookPayload(BaseModel):
    event_type: str = Field(..., description="Event type identifier")
    workflow_id: str = Field(..., description="n8n workflow identifier")
    execution_id: str = Field(..., description="Workflow execution ID")
    status: str = Field(..., description="Execution status")
    result_data: Optional[Dict[str, Any]] = Field(None, description="Workflow results")
    error_message: Optional[str] = Field(None, description="Error message if failed")


# Middleware for request timing
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    """Middleware to track request processing time"""
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Check n8n connectivity
        async with httpx.AsyncClient() as client:
            n8n_response = await client.get(f"{N8N_BASE_URL}/healthz", timeout=5.0)
            n8n_healthy = n8n_response.status_code == 200
    except Exception:
        n8n_healthy = False

    return {
        "status": "healthy" if n8n_healthy else "degraded",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "n8n": "healthy" if n8n_healthy else "unhealthy"
        },
        "version": "1.0.0"
    }


# Workflow trigger endpoint
@app.post("/api/trigger-workflow")
async def trigger_n8n_workflow(trigger_data: WorkflowTrigger):
    """
    Trigger an n8n workflow with provided data
    """
    try:
        n8n_webhook_url = f"{N8N_BASE_URL}/webhook/{trigger_data.workflow_type}"
        
        payload = {
            "timestamp": datetime.utcnow().isoformat(),
            "source": "tenderai-api",
            "data": trigger_data.data,
            "priority": trigger_data.priority,
            "callback_url": trigger_data.callback_url
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                n8n_webhook_url,
                json=payload,
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {N8N_API_KEY}"
                },
                timeout=30.0
            )
            
        if response.status_code == 200:
            result = response.json()
            logger.info(f"Workflow triggered successfully: {result}")
            return {"status": "success", "execution_id": result.get("executionId", "unknown")}
        else:
            logger.error(f"Workflow trigger failed: {response.text}")
            raise HTTPException(status_code=response.status_code, detail=response.text)
            
    except httpx.TimeoutException:
        logger.error("n8n webhook request timed out")
        raise HTTPException(status_code=408, detail="Workflow trigger timeout")
    except Exception as e:
        logger.error(f"Workflow trigger error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


# Webhook handler for n8n callbacks
@app.post("/api/n8n-webhook")
async def handle_n8n_webhook(payload: N8nWebhookPayload, background_tasks: BackgroundTasks):
    """
    Handle webhook callbacks from n8n workflows
    """
    try:
        logger.info(f"Received n8n webhook: {payload.workflow_id} - {payload.status}")
        
        # Process workflow results based on event type
        if payload.event_type == "tender_analysis_complete":
            background_tasks.add_task(process_tender_analysis_results, payload)
        elif payload.event_type == "portfolio_update_complete":
            background_tasks.add_task(process_portfolio_update_results, payload)
        elif payload.event_type == "workflow_error":
            background_tasks.add_task(handle_workflow_error, payload)
        else:
            logger.warning(f"Unknown event type: {payload.event_type}")
            
        return {"status": "received", "message": "Webhook processed successfully"}
        
    except Exception as e:
        logger.error(f"Webhook processing error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Webhook processing failed: {str(e)}")


# Data endpoints for n8n workflows
@app.get("/api/tenders")
async def get_tenders(
    limit: int = 50,
    offset: int = 0,
    category: Optional[str] = None,
    status: Optional[str] = None
):
    """
    Retrieve tender data for n8n workflows
    """
    try:
        # Mock data for demonstration - replace with actual database queries
        mock_tenders = [
            {
                "tender_id": f"TENDER-{i:03d}",
                "title": f"Mock Tender {i}",
                "description": f"Description for tender {i}",
                "deadline": datetime.now().isoformat(),
                "value": 100000.0 + (i * 10000),
                "category": category or "IT Services",
                "source_url": f"https://example.com/tender/{i}",
                "requirements": [f"Requirement {i}.1", f"Requirement {i}.2"]
            }
            for i in range(1, min(limit + 1, 11))
        ]
        
        return {
            "tenders": mock_tenders,
            "total_count": len(mock_tenders),
            "limit": limit,
            "offset": offset
        }
        
    except Exception as e:
        logger.error(f"Error fetching tenders: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch tender data")


@app.get("/api/portfolio/{portfolio_id}")
async def get_portfolio_data(portfolio_id: str):
    """
    Retrieve portfolio data for n8n workflows
    """
    try:
        # Mock portfolio data - replace with actual database queries
        portfolio = {
            "portfolio_id": portfolio_id,
            "name": f"Portfolio {portfolio_id}",
            "current_tenders": ["TENDER-001", "TENDER-002", "TENDER-003"],
            "risk_score": 75.5,
            "last_updated": datetime.now().isoformat(),
            "performance_metrics": {
                "total_value": 500000.0,
                "success_rate": 0.85,
                "average_score": 78.2
            }
        }
        
        return portfolio
        
    except Exception as e:
        logger.error(f"Error fetching portfolio {portfolio_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch portfolio data")


# Background task handlers
async def process_tender_analysis_results(payload: N8nWebhookPayload):
    """Process tender analysis results from n8n workflow"""
    try:
        if payload.status == "success" and payload.result_data:
            analysis_data = payload.result_data
            tender_id = analysis_data.get("tender_id")
            score = analysis_data.get("score")
            recommendations = analysis_data.get("recommendations", [])
            
            logger.info(f"Processing tender analysis results for {tender_id}: score={score}")
            
            # Here you would update your database with the analysis results
            # await update_tender_analysis(tender_id, score, recommendations)
            
        else:
            logger.error(f"Tender analysis failed: {payload.error_message}")
            
    except Exception as e:
        logger.error(f"Error processing tender analysis results: {str(e)}")


async def process_portfolio_update_results(payload: N8nWebhookPayload):
    """Process portfolio update results from n8n workflow"""
    try:
        if payload.status == "success" and payload.result_data:
            portfolio_data = payload.result_data
            portfolio_id = portfolio_data.get("portfolio_id")
            
            logger.info(f"Processing portfolio update results for {portfolio_id}")
            
            # Here you would update your database with the portfolio results
            # await update_portfolio_data(portfolio_id, portfolio_data)
            
        else:
            logger.error(f"Portfolio update failed: {payload.error_message}")
            
    except Exception as e:
        logger.error(f"Error processing portfolio update results: {str(e)}")


async def handle_workflow_error(payload: N8nWebhookPayload):
    """Handle workflow error notifications"""
    try:
        logger.error(f"Workflow error in {payload.workflow_id}: {payload.error_message}")
        
        # Here you would implement error handling logic
        # - Send notifications
        # - Log to monitoring systems
        # - Trigger recovery workflows
        
    except Exception as e:
        logger.error(f"Error handling workflow error: {str(e)}")


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "TenderAI n8n Integration Service",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)