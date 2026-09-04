import json
import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
from app.models.models import (
    Project, ProjectCreate, ProjectStatus,
    AnalysisResult, ReportConfig, ExportConfig
)
from app.ai.demo_data import DEMO_ANALYSIS
from app.gis.processor import features_to_geojson, features_to_csv, features_to_kml


class StorageService:
    def __init__(self):
        self.projects: Dict[str, Project] = {}
        self.analyses: Dict[str, AnalysisResult] = {}
        self._init_demo_project()

    def _init_demo_project(self):
        demo_project = Project(
            id="demo-project-001",
            name="New Delhi Urban Survey",
            description="Demo project for AI-based cadastral mapping of New Delhi area",
            status=ProjectStatus.COMPLETED,
            image_count=5,
            area_covered=2450000.0,
            created_at=datetime.now(),
            updated_at=datetime.now(),
            analysis_id="analysis-demo-001"
        )
        self.projects["demo-project-001"] = demo_project
        self.analyses["analysis-demo-001"] = DEMO_ANALYSIS

    def create_project(self, data: ProjectCreate) -> Project:
        project_id = f"proj-{uuid.uuid4().hex[:8]}"
        project = Project(
            id=project_id,
            name=data.name,
            description=data.description,
            status=ProjectStatus.DRAFT,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        self.projects[project_id] = project
        return project

    def get_project(self, project_id: str) -> Optional[Project]:
        return self.projects.get(project_id)

    def list_projects(self) -> List[Project]:
        return list(self.projects.values())

    def get_analysis(self, analysis_id: str) -> Optional[AnalysisResult]:
        return self.analyses.get(analysis_id)

    def get_analysis_by_project(self, project_id: str) -> Optional[AnalysisResult]:
        project = self.get_project(project_id)
        if project and project.analysis_id:
            return self.analyses.get(project.analysis_id)
        return None

    def save_analysis(self, analysis: AnalysisResult):
        self.analyses[analysis.id] = analysis
        project = self.get_project(analysis.project_id)
        if project:
            project.analysis_id = analysis.id
            project.status = ProjectStatus.COMPLETED
            project.updated_at = datetime.now()

    def get_parcel(self, parcel_id: str) -> Optional[Any]:
        for analysis in self.analyses.values():
            for parcel in analysis.features.parcels:
                if parcel.id == parcel_id:
                    return parcel
        return None

    def get_parcels(self, project_id: str) -> List[Any]:
        analysis = self.get_analysis_by_project(project_id)
        if analysis:
            return analysis.features.parcels
        return []

    def get_features(self, project_id: str) -> Optional[Any]:
        analysis = self.get_analysis_by_project(project_id)
        if analysis:
            return analysis.features
        return None

    def get_statistics(self, project_id: str) -> Dict[str, Any]:
        analysis = self.get_analysis_by_project(project_id)
        if analysis:
            return analysis.statistics
        return {}

    def export_geojson(self, project_id: str) -> str:
        features = self.get_features(project_id)
        if features:
            geojson = features_to_geojson(features)
            return geojson.model_dump_json(indent=2)
        return '{"type":"FeatureCollection","features":[]}'

    def export_csv(self, project_id: str) -> str:
        features = self.get_features(project_id)
        if features:
            return features_to_csv(features)
        return "type,id,area"

    def export_kml(self, project_id: str) -> str:
        features = self.get_features(project_id)
        if features:
            return features_to_kml(features)
        return '<?xml version="1.0"?><kml xmlns="http://www.opengis.net/kml/2.2"></kml>'

    def generate_report(self, config: ReportConfig) -> Dict[str, Any]:
        project = self.get_project(config.project_id)
        analysis = self.get_analysis_by_project(config.project_id)
        if not project or not analysis:
            return {"error": "Project or analysis not found"}

        return {
            "report_id": f"rpt-{uuid.uuid4().hex[:8]}",
            "project_name": project.name,
            "date": datetime.now().isoformat(),
            "status": "generated",
            "summary": {
                "total_parcels": analysis.statistics.get("total_parcels", 0),
                "total_buildings": analysis.statistics.get("total_buildings", 0),
                "total_mapped_area": analysis.statistics.get("total_mapped_area", 0),
                "road_length": analysis.statistics.get("total_road_length", 0),
                "green_area": analysis.statistics.get("green_area", 0),
                "average_confidence": analysis.statistics.get("average_confidence", 0),
                "processing_time": analysis.statistics.get("processing_time", 0),
            },
            "sections": [
                {"name": "Executive Summary", "included": True},
                {"name": "Parcel Statistics", "included": config.include_parcels},
                {"name": "Building Analysis", "included": config.include_buildings},
                {"name": "Map Preview", "included": config.include_map},
                {"name": "AI Confidence Analysis", "included": config.include_statistics},
            ]
        }


storage = StorageService()
