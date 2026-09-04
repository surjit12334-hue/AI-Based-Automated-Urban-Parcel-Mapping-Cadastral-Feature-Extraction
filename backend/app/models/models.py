from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum


class LandUseType(str, Enum):
    RESIDENTIAL = "residential"
    COMMERCIAL = "commercial"
    INDUSTRIAL = "industrial"
    AGRICULTURAL = "agricultural"
    GREEN_AREA = "green_area"
    ROAD = "road"
    WATER = "water"
    VACANT = "vacant"


class ProjectStatus(str, Enum):
    DRAFT = "draft"
    UPLOADING = "uploading"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class Coordinate(BaseModel):
    lat: float
    lng: float


class GeoJsonPolygon(BaseModel):
    type: str = "Polygon"
    coordinates: List[List[List[float]]]


class GeoJsonLineString(BaseModel):
    type: str = "LineString"
    coordinates: List[List[float]]


class GeoJsonFeature(BaseModel):
    type: str = "Feature"
    properties: dict
    geometry: object


class GeoJsonCollection(BaseModel):
    type: str = "FeatureCollection"
    features: List[GeoJsonFeature]


class Parcel(BaseModel):
    id: str
    project_id: str
    area: float
    perimeter: float
    land_use: LandUseType
    buildings: int = 0
    building_coverage: float = 0.0
    confidence: float = 0.0
    coordinates: List[Coordinate]
    centroid: Coordinate
    timestamp: datetime = Field(default_factory=datetime.now)
    status: str = "detected"


class Building(BaseModel):
    id: str
    parcel_id: str
    area: float
    height: float = 0.0
    floors: int = 1
    confidence: float = 0.0
    coordinates: List[Coordinate]
    centroid: Coordinate


class Road(BaseModel):
    id: str
    name: str
    length: float
    width: float
    coordinates: List[Coordinate]
    confidence: float = 0.0


class Vegetation(BaseModel):
    id: str
    area: float
    vegetation_type: str = "urban_green"
    coordinates: List[Coordinate]
    centroid: Coordinate


class DetectedFeatures(BaseModel):
    parcels: List[Parcel] = []
    buildings: List[Building] = []
    roads: List[Road] = []
    vegetation: List[Vegetation] = []


class AnalysisResult(BaseModel):
    id: str
    project_id: str
    status: str
    features: DetectedFeatures
    statistics: dict = {}
    timestamp: datetime = Field(default_factory=datetime.now)


class Project(BaseModel):
    id: str
    name: str
    description: str = ""
    status: ProjectStatus = ProjectStatus.DRAFT
    image_count: int = 0
    area_covered: float = 0.0
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    analysis_id: Optional[str] = None


class ProjectCreate(BaseModel):
    name: str
    description: str = ""


class UploadResponse(BaseModel):
    filename: str
    size: int
    status: str
    message: str


class ReportConfig(BaseModel):
    project_id: str
    include_map: bool = True
    include_statistics: bool = True
    include_parcels: bool = True
    include_buildings: bool = True
    format: str = "pdf"


class ExportConfig(BaseModel):
    project_id: str
    format: str = "geojson"
    layer: str = "all"
