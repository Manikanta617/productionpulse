"""Pydantic models for API requests/responses."""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime

# --- Project Models ---
class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    script_title: str = Field(..., min_length=1, max_length=300)

class ProjectResponse(BaseModel):
    id: UUID
    name: str
    script_title: str
    created_at: Optional[datetime] = None
    total_scenes: int = 0
    total_pages: float = 0.0
    estimated_budget_usd: float = 0.0
    estimated_shoot_days: float = 0.0
    complexity_score: int = 0
    status: str = "draft"

# --- Scene Models ---
class SceneData(BaseModel):
    scene_number: int
    heading: str
    location: str
    int_ext: str
    time_of_day: str
    description: str
    characters: List[str] = []
    props: List[str] = []
    vfx_required: bool = False
    stunts_required: bool = False
    extras_count: int = 0
    estimated_shoot_hours: float = 0.0
    page_count: float = 0.0
    mood: str = ""
    complexity_score: int = 1

class SceneListResponse(BaseModel):
    scenes: List[SceneData]
    total: int

# --- Character Models ---
class CharacterData(BaseModel):
    name: str
    description: str = ""
    scene_appearances: List[int] = []
    total_scenes: int = 0
    is_lead: bool = False
    estimated_cost_per_day: int = 500

# --- Location Models ---
class LocationData(BaseModel):
    name: str
    scene_count: int = 0
    int_ext: str = ""
    time_of_day: str = ""
    estimated_shoot_days: float = 0.0
    complexity_score: int = 1
    permit_required: bool = False

# --- Analytics Models ---
class SceneSummary(BaseModel):
    project_id: UUID
    total_scenes: int
    total_pages: float
    total_shoot_hours: float
    estimated_shoot_days: float
    vfx_scenes: int
    stunt_scenes: int
    total_extras: int
    interior_scenes: int
    exterior_scenes: int
    day_scenes: int
    night_scenes: int
    golden_hour_scenes: int
    avg_complexity: float

class BudgetEstimate(BaseModel):
    category: str
    item_name: str
    quantity: float
    unit_cost_usd: float
    total_cost_usd: float
    scene_numbers: List[int]
    notes: str

class DashboardData(BaseModel):
    project: ProjectResponse
    scene_summary: Optional[SceneSummary] = None
    top_locations: List[LocationData] = []
    top_characters: List[CharacterData] = []
    budget_estimate: List[BudgetEstimate] = []

# --- What-If & Advanced Analytics Models ---
class WhatIfRequest(BaseModel):
    cast_rate_multiplier: float = 1.0
    vfx_cut_pct: float = 0.0
    hours_per_day: float = 10.0

class QueryRequest(BaseModel):
    question: str = Field(..., min_length=2, max_length=500)

class QueryResponse(BaseModel):
    answer: str
    agent_persona: Optional[str] = None
    sql_query: Optional[str] = None
    data: Optional[List[Dict[str, Any]]] = None
    latency_ms: Optional[float] = None
    p50_ms: Optional[float] = None
    p95_ms: Optional[float] = None
    protocol: Optional[str] = None
    tool_name: Optional[str] = None
    engine: Optional[str] = None
    grounding_badge: Optional[str] = None
    is_live_grounded: Optional[bool] = None

class UploadResponse(BaseModel):
    project_id: UUID
    message: str
    scenes_extracted: int
    characters_extracted: int
    locations_extracted: int
