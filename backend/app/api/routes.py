from fastapi import APIRouter, HTTPException, UploadFile, File
from typing import Optional
from app.models.models import ProjectCreate, ReportConfig, ExportConfig, UploadResponse
from app.services.storage import storage
from app.ai.pipeline import ai_pipeline

router = APIRouter(prefix="/api")


@router.post("/projects")
async def create_project(data: ProjectCreate):
    project = storage.create_project(data)
    return project.model_dump()


@router.get("/projects")
async def list_projects():
    projects = storage.list_projects()
    return [p.model_dump() for p in projects]


@router.get("/projects/{project_id}")
async def get_project(project_id: str):
    project = storage.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project.model_dump()


@router.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/tiff", "image/geotiff"]
    content_type = file.content_type or ""
    if content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file format. Please upload JPG, PNG, TIFF, or GeoTIFF files."
        )

    contents = await file.read()
    size = len(contents)
    if size > 50 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 50MB.")

    return UploadResponse(
        filename=file.filename,
        size=size,
        status="uploaded",
        message="Image uploaded successfully"
    ).model_dump()


@router.post("/analyze")
async def analyze_image(project_id: Optional[str] = None):
    pid = project_id or "demo-project-001"
    project = storage.get_project(pid)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    result = ai_pipeline.process_image("demo_image.tif")

    from app.ai.demo_data import DEMO_ANALYSIS
    storage.save_analysis(DEMO_ANALYSIS)

    return {
        "status": "completed",
        "message": "AI analysis completed successfully",
        "processing_time": result["processing_time"],
        "features_summary": result["features_summary"],
        "analysis_id": DEMO_ANALYSIS.id
    }


@router.get("/analysis/{analysis_id}")
async def get_analysis(analysis_id: str):
    analysis = storage.get_analysis(analysis_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return analysis.model_dump()


@router.get("/parcels")
async def get_parcels(project_id: str = "demo-project-001"):
    parcels = storage.get_parcels(project_id)
    return [p.model_dump() for p in parcels]


@router.get("/parcels/{parcel_id}")
async def get_parcel(parcel_id: str):
    parcel = storage.get_parcel(parcel_id)
    if not parcel:
        raise HTTPException(status_code=404, detail="Parcel not found")
    return parcel.model_dump()


@router.get("/features")
async def get_features(project_id: str = "demo-project-001"):
    features = storage.get_features(project_id)
    if not features:
        raise HTTPException(status_code=404, detail="Features not found")
    return {
        "parcels": [p.model_dump() for p in features.parcels],
        "buildings": [b.model_dump() for b in features.buildings],
        "roads": [r.model_dump() for r in features.roads],
        "vegetation": [v.model_dump() for v in features.vegetation],
    }


@router.get("/statistics")
async def get_statistics(project_id: str = "demo-project-001"):
    stats = storage.get_statistics(project_id)
    if not stats:
        raise HTTPException(status_code=404, detail="Statistics not found")
    return stats


@router.post("/reports")
async def generate_report(config: ReportConfig):
    report = storage.generate_report(config)
    if "error" in report:
        raise HTTPException(status_code=404, detail=report["error"])
    return report


@router.get("/export/geojson")
async def export_geojson(project_id: str = "demo-project-001"):
    geojson_str = storage.export_geojson(project_id)
    return {"data": geojson_str, "format": "geojson"}


@router.get("/export/csv")
async def export_csv(project_id: str = "demo-project-001"):
    csv_str = storage.export_csv(project_id)
    return {"data": csv_str, "format": "csv"}


@router.get("/export/kml")
async def export_kml(project_id: str = "demo-project-001"):
    kml_str = storage.export_kml(project_id)
    return {"data": kml_str, "format": "kml"}


@router.get("/ai/progress")
async def get_ai_progress():
    return ai_pipeline.get_progress()


@router.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}
