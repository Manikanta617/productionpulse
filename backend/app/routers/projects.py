"""API routes for project management, script uploads, DOOD matrix, stripboards, and simulations."""
from fastapi import APIRouter, UploadFile, File, HTTPException, Query as FastQuery
from typing import List, Dict, Any, Optional
from uuid import UUID
import uuid

from app.models import (
    ProjectCreate, ProjectResponse, UploadResponse,
    SceneListResponse, SceneData, DashboardData,
    LocationData, CharacterData, BudgetEstimate,
    WhatIfRequest
)
from app.services import clickhouse_client, script_parser, analytics
from app.demo_seeds import DEMO_PROJECTS, get_all_demo_summaries, get_demo_project

router = APIRouter(prefix="/api/projects", tags=["projects"])


@router.post("", response_model=ProjectResponse)
async def create_project(data: ProjectCreate):
    """Create a new production project."""
    project_id = clickhouse_client.insert_project(data.name, data.script_title)
    project = clickhouse_client.get_project(project_id)
    if not project:
        raise HTTPException(status_code=500, detail="Failed to create project")
    return _project_to_response(project)


@router.get("", response_model=List[ProjectResponse])
async def list_projects():
    """List all projects."""
    projects = clickhouse_client.get_all_projects()
    return [_project_to_response(p) for p in projects]


@router.get("/demo/list")
async def list_demo_projects():
    """List all pre-seeded blockbuster movie demos for instant evaluation."""
    return get_all_demo_summaries()


@router.post("/demo/seed/{key}", response_model=ProjectResponse)
async def seed_demo_project(key: str):
    """Load an iconic Hollywood blockbuster dataset into ClickHouse."""
    demo = get_demo_project(key)
    project_id = UUID(demo["id"])

    clickhouse_client.insert_scenes(project_id, demo.get("scenes", []))
    clickhouse_client.insert_characters(project_id, demo.get("characters", []))
    clickhouse_client.insert_locations(project_id, demo.get("locations", []))
    clickhouse_client.insert_budget_items(project_id, demo.get("budget_items", []))
    clickhouse_client.insert_schedule_items(project_id, demo.get("schedule_items", []))

    clickhouse_client.update_project_stats(
        project_id,
        total_scenes=demo["total_scenes"],
        total_pages=demo["total_pages"],
        estimated_budget=demo["estimated_budget_usd"],
        shoot_days=demo["estimated_shoot_days"],
        complexity=demo["complexity_score"]
    )

    project = clickhouse_client.get_project(project_id)
    if not project:
        raise HTTPException(status_code=500, detail="Failed to load demo")
    return _project_to_response(project)


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: UUID):
    """Get a single project."""
    project = clickhouse_client.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return _project_to_response(project)


@router.post("/{project_id}/upload", response_model=UploadResponse)
async def upload_script(
    project_id: UUID,
    file: UploadFile = File(...)
):
    """Upload a screenplay PDF or TXT and parse it."""
    contents = await file.read()
    from app.services.security_guard import validate_uploaded_file
    is_valid_file, file_err = validate_uploaded_file(file.filename, contents)
    if not is_valid_file:
        raise HTTPException(status_code=400, detail=file_err)

    try:
        parsed = script_parser.parse_script(contents)
        scenes = parsed.get("scenes", [])
        characters = parsed.get("characters", [])
        locations = parsed.get("locations", [])

        clickhouse_client.insert_scenes(project_id, scenes)
        clickhouse_client.insert_characters(project_id, characters)
        clickhouse_client.insert_locations(project_id, locations)

        total_pages = sum(s.get("page_count", 0.0) for s in scenes)
        total_hours = sum(s.get("estimated_shoot_hours", 0.0) for s in scenes)
        shoot_days = max(1.0, round(total_hours / 10.0, 1))
        avg_complexity = sum(s.get("complexity_score", 1) for s in scenes) / max(len(scenes), 1)

        budget = analytics.generate_budget_estimate(project_id)
        total_budget = sum(b.get("total_cost_usd", 0.0) for b in budget)

        analytics.generate_stripboard_schedule(project_id)

        clickhouse_client.update_project_stats(
            project_id,
            total_scenes=len(scenes),
            total_pages=total_pages,
            estimated_budget=total_budget,
            shoot_days=shoot_days,
            complexity=int(avg_complexity)
        )

        return UploadResponse(
            project_id=project_id,
            message="Screenplay parsed and stored in ClickHouse analytics successfully",
            scenes_extracted=len(scenes),
            characters_extracted=len(characters),
            locations_extracted=len(locations)
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Parse error: {str(e)}")


@router.get("/{project_id}/scenes", response_model=SceneListResponse)
async def get_scenes(project_id: UUID):
    """Get all scenes for a project."""
    scenes = clickhouse_client.get_scenes(project_id)
    return SceneListResponse(
        scenes=[SceneData(**s) for s in scenes],
        total=len(scenes)
    )


@router.get("/{project_id}/dashboard", response_model=DashboardData)
async def get_dashboard(project_id: UUID):
    """Get executive dashboard data for a project."""
    project = clickhouse_client.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    summary = clickhouse_client.get_scene_summary(project_id)
    locations = clickhouse_client.get_locations(project_id)
    characters = clickhouse_client.get_characters(project_id)
    budget_raw = clickhouse_client.get_budget_items(project_id)
    if not budget_raw:
        budget_raw = analytics.generate_budget_estimate(project_id)

    return DashboardData(
        project=_project_to_response(project),
        scene_summary=summary,
        top_locations=[LocationData(**l) for l in locations],
        top_characters=[CharacterData(**c) for c in characters],
        budget_estimate=[BudgetEstimate(**b) for b in budget_raw]
    )


@router.get("/{project_id}/dood")
async def get_dood_matrix(project_id: UUID):
    """Get SAG-AFTRA Day-Out-of-Days (DOOD) actor matrix."""
    return analytics.generate_dood_matrix(project_id)


@router.get("/{project_id}/stripboard")
async def get_stripboard(project_id: UUID):
    """Get Hollywood-standard color-coded Stripboard shooting schedule."""
    return analytics.generate_stripboard_schedule(project_id)


@router.get("/{project_id}/departments")
async def get_department_budget(project_id: UUID):
    """Get department budget distribution and breakdown."""
    return analytics.get_department_budget_breakdown(project_id)


@router.post("/{project_id}/what-if")
async def run_what_if(project_id: UUID, req: WhatIfRequest):
    """Run real-time scenario simulation."""
    return analytics.run_what_if_simulation(project_id, req.model_dump())


@router.get("/{project_id}/call-sheet")
async def get_call_sheet(project_id: UUID, day: int = FastQuery(1, ge=1)):
    """Generate production call sheet for specified day."""
    return analytics.generate_call_sheet(project_id, day_number=day)


def _project_to_response(project: dict) -> ProjectResponse:
    """Convert raw ClickHouse row to ProjectResponse."""
    return ProjectResponse(
        id=project.get("id"),
        name=project.get("name", ""),
        script_title=project.get("script_title", ""),
        created_at=project.get("created_at"),
        total_scenes=project.get("total_scenes", 0),
        total_pages=project.get("total_pages", 0.0),
        estimated_budget_usd=project.get("estimated_budget_usd", 0.0),
        estimated_shoot_days=project.get("estimated_shoot_days", 0.0),
        complexity_score=project.get("complexity_score", 0),
        status=project.get("status", "draft")
    )
