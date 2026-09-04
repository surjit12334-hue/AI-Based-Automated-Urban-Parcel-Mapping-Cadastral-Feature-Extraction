import random
import math
import uuid
from datetime import datetime
from typing import List, Tuple
from app.models.models import (
    Parcel, Building, Road, Vegetation, DetectedFeatures,
    Coordinate, LandUseType, AnalysisResult
)

CENTER_LAT = 28.6139
CENTER_LNG = 77.2090

LAND_USE_TYPES = [
    LandUseType.RESIDENTIAL,
    LandUseType.COMMERCIAL,
    LandUseType.INDUSTRIAL,
    LandUseType.GREEN_AREA,
    LandUseType.VACANT,
]

VEGETATION_TYPES = ["urban_tree", "park", "garden", "grassland", "wetland"]


def generate_polygon(center_lat: float, center_lng: float, radius: float, sides: int = 6) -> List[Coordinate]:
    coords = []
    for i in range(sides):
        angle = 2 * math.pi * i / sides
        angle += random.uniform(-0.3, 0.3)
        r = radius * random.uniform(0.7, 1.3)
        lat = center_lat + r * math.cos(angle)
        lng = center_lng + r * math.sin(angle) / math.cos(math.radians(center_lat))
        coords.append(Coordinate(lat=round(lat, 6), lng=round(lng, 6)))
    coords.append(coords[0])
    return coords


def calculate_area(coords: List[Coordinate]) -> float:
    if len(coords) < 3:
        return 0.0
    n = len(coords) - 1
    area = 0.0
    for i in range(n):
        j = (i + 1) % n
        area += coords[i].lng * coords[j].lat
        area -= coords[j].lng * coords[i].lat
    return abs(area / 2.0) * 111000 * 111000


def calculate_perimeter(coords: List[Coordinate]) -> float:
    total = 0.0
    for i in range(len(coords) - 1):
        lat1, lng1 = coords[i].lat, coords[i].lng
        lat2, lng2 = coords[i + 1].lat, coords[i + 1].lng
        dlat = (lat2 - lat1) * 111000
        dlng = (lng2 - lng1) * 111000 * math.cos(math.radians((lat1 + lat2) / 2))
        total += math.sqrt(dlat ** 2 + dlng ** 2)
    return round(total, 2)


def generate_parcels(center_lat: float, center_lng: float, count: int = 12) -> List[Parcel]:
    parcels = []
    used_positions = []

    for i in range(count):
        attempts = 0
        while attempts < 100:
            offset_lat = random.uniform(-0.005, 0.005)
            offset_lng = random.uniform(-0.005, 0.005)
            new_lat = center_lat + offset_lat
            new_lng = center_lng + offset_lng

            too_close = False
            for pos in used_positions:
                dlat = (new_lat - pos[0]) * 111000
                dlng = (new_lng - pos[1]) * 111000
                if math.sqrt(dlat ** 2 + dlng ** 2) < 60:
                    too_close = True
                    break

            if not too_close:
                used_positions.append((new_lat, new_lng))
                break
            attempts += 1

        radius = random.uniform(25, 60)
        sides = random.choice([4, 5, 6, 6, 8])
        coords = generate_polygon(new_lat, new_lng, radius / 111000, sides)
        area = calculate_area(coords)
        perimeter = calculate_perimeter(coords)
        land_use = random.choice(LAND_USE_TYPES)
        buildings_count = random.randint(0, 3) if land_use in [LandUseType.RESIDENTIAL, LandUseType.COMMERCIAL] else 0
        building_coverage = random.uniform(10, 60) if buildings_count > 0 else 0.0
        confidence = random.uniform(0.82, 0.99)

        parcel = Parcel(
            id=f"P-{1000 + i}",
            project_id="demo-project-001",
            area=round(area, 2),
            perimeter=round(perimeter, 2),
            land_use=land_use,
            buildings=buildings_count,
            building_coverage=round(building_coverage, 1),
            confidence=round(confidence, 3),
            coordinates=coords,
            centroid=Coordinate(lat=round(new_lat, 6), lng=round(new_lng, 6)),
            timestamp=datetime.now(),
            status="detected"
        )
        parcels.append(parcel)

    return parcels


def generate_buildings(parcels: List[Parcel]) -> List[Building]:
    buildings = []
    building_idx = 0

    for parcel in parcels:
        if parcel.buildings > 0:
            for b in range(parcel.buildings):
                offset_lat = random.uniform(-0.001, 0.001)
                offset_lng = random.uniform(-0.001, 0.001)
                b_lat = parcel.centroid.lat + offset_lat
                b_lng = parcel.centroid.lng + offset_lng
                b_radius = random.uniform(5, 15) / 111000
                b_coords = generate_polygon(b_lat, b_lng, b_radius, 4)
                b_area = calculate_area(b_coords)
                b_height = random.uniform(3, 25)
                b_floors = random.randint(1, 8)

                building = Building(
                    id=f"B-{2000 + building_idx}",
                    parcel_id=parcel.id,
                    area=round(b_area, 2),
                    height=round(b_height, 1),
                    floors=b_floors,
                    confidence=round(random.uniform(0.85, 0.98), 3),
                    coordinates=b_coords,
                    centroid=Coordinate(lat=round(b_lat, 6), lng=round(b_lng, 6))
                )
                buildings.append(building)
                building_idx += 1

    return buildings


def generate_roads(center_lat: float, center_lng: float) -> List[Road]:
    roads = []
    road_names = [
        "MG Road", "Station Road", "Park Avenue", "Main Street",
        "Nehru Road", "Gandhi Road", "Patel Road", "Rajiv Avenue"
    ]

    for i, name in enumerate(road_names):
        start_lat = center_lat + random.uniform(-0.004, 0.004)
        start_lng = center_lng + random.uniform(-0.004, 0.004)
        coords = [Coordinate(lat=round(start_lat, 6), lng=round(start_lng, 6))]

        direction_lat = random.choice([-1, 1]) * random.uniform(0.0005, 0.002)
        direction_lng = random.choice([-1, 1]) * random.uniform(0.0005, 0.002)

        for j in range(1, random.randint(4, 8)):
            lat = start_lat + direction_lat * j + random.uniform(-0.0002, 0.0002)
            lng = start_lng + direction_lng * j + random.uniform(-0.0002, 0.0002)
            coords.append(Coordinate(lat=round(lat, 6), lng=round(lng, 6)))

        road_length = calculate_perimeter(coords)
        road = Road(
            id=f"R-{3000 + i}",
            name=name,
            length=round(road_length, 2),
            width=random.choice([6, 8, 10, 12, 15]),
            coordinates=coords,
            confidence=round(random.uniform(0.88, 0.97), 3)
        )
        roads.append(road)

    return roads


def generate_vegetation(center_lat: float, center_lng: float, count: int = 8) -> List[Vegetation]:
    vegetation = []

    for i in range(count):
        v_lat = center_lat + random.uniform(-0.004, 0.004)
        v_lng = center_lng + random.uniform(-0.004, 0.004)
        v_radius = random.uniform(10, 30) / 111000
        v_coords = generate_polygon(v_lat, v_lng, v_radius, random.choice([5, 6, 8]))
        v_area = calculate_area(v_coords)

        veg = Vegetation(
            id=f"V-{4000 + i}",
            area=round(v_area, 2),
            vegetation_type=random.choice(VEGETATION_TYPES),
            coordinates=v_coords,
            centroid=Coordinate(lat=round(v_lat, 6), lng=round(v_lng, 6))
        )
        vegetation.append(veg)

    return vegetation


def generate_demo_analysis() -> AnalysisResult:
    random.seed(42)

    parcels = generate_parcels(CENTER_LAT, CENTER_LNG, 12)
    buildings = generate_buildings(parcels)
    roads = generate_roads(CENTER_LAT, CENTER_LNG)
    vegetation = generate_vegetation(CENTER_LAT, CENTER_LNG, 8)

    features = DetectedFeatures(
        parcels=parcels,
        buildings=buildings,
        roads=roads,
        vegetation=vegetation
    )

    total_area = sum(p.area for p in parcels)
    total_buildings = len(buildings)
    road_coverage = sum(r.length * r.width for r in roads)
    green_area = sum(v.area for v in vegetation)
    avg_confidence = sum(p.confidence for p in parcels) / len(parcels) if parcels else 0

    statistics = {
        "total_parcels": len(parcels),
        "total_buildings": total_buildings,
        "total_mapped_area": round(total_area, 2),
        "total_road_length": round(sum(r.length for r in roads), 2),
        "road_coverage": round(road_coverage, 2),
        "green_area": round(green_area, 2),
        "average_confidence": round(avg_confidence, 3),
        "processing_time": 12.4,
        "land_use_distribution": {
            "residential": len([p for p in parcels if p.land_use == LandUseType.RESIDENTIAL]),
            "commercial": len([p for p in parcels if p.land_use == LandUseType.COMMERCIAL]),
            "industrial": len([p for p in parcels if p.land_use == LandUseType.INDUSTRIAL]),
            "green_area": len([p for p in parcels if p.land_use == LandUseType.GREEN_AREA]),
            "vacant": len([p for p in parcels if p.land_use == LandUseType.VACANT]),
        },
        "building_size_distribution": {
            "small": len([b for b in buildings if b.area < 200]),
            "medium": len([b for b in buildings if 200 <= b.area < 500]),
            "large": len([b for b in buildings if b.area >= 500]),
        },
        "confidence_distribution": {
            "high": len([p for p in parcels if p.confidence >= 0.9]),
            "medium": len([p for p in parcels if 0.8 <= p.confidence < 0.9]),
            "low": len([p for p in parcels if p.confidence < 0.8]),
        }
    }

    return AnalysisResult(
        id="analysis-demo-001",
        project_id="demo-project-001",
        status="completed",
        features=features,
        statistics=statistics,
        timestamp=datetime.now()
    )


DEMO_ANALYSIS = generate_demo_analysis()
