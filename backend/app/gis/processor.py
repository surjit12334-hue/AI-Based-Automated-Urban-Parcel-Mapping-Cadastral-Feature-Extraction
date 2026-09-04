from typing import List, Dict, Any
from app.models.models import Coordinate, GeoJsonFeature, GeoJsonCollection, GeoJsonPolygon
import json


def coordinates_to_geojson(coords: List[Coordinate]) -> GeoJsonPolygon:
    ring = [[c.lng, c.lat] for c in coords]
    if ring[0] != ring[-1]:
        ring.append(ring[0])
    return GeoJsonPolygon(coordinates=[ring])


def parcel_to_geojson(parcel) -> GeoJsonFeature:
    geometry = coordinates_to_geojson(parcel.coordinates)
    return GeoJsonFeature(
        properties={
            "parcel_id": parcel.id,
            "area": parcel.area,
            "perimeter": parcel.perimeter,
            "land_use": parcel.land_use.value,
            "buildings": parcel.buildings,
            "building_coverage": parcel.building_coverage,
            "confidence": parcel.confidence,
            "status": parcel.status,
        },
        geometry=geometry
    )


def building_to_geojson(building) -> GeoJsonFeature:
    geometry = coordinates_to_geojson(building.coordinates)
    return GeoJsonFeature(
        properties={
            "building_id": building.id,
            "parcel_id": building.parcel_id,
            "area": building.area,
            "height": building.height,
            "floors": building.floors,
            "confidence": building.confidence,
        },
        geometry=geometry
    )


def road_to_geojson(road) -> GeoJsonFeature:
    ring = [[c.lng, c.lat] for c in road.coordinates]
    geometry = GeoJsonPolygon(coordinates=[ring])
    return GeoJsonFeature(
        properties={
            "road_id": road.id,
            "name": road.name,
            "length": road.length,
            "width": road.width,
            "confidence": road.confidence,
        },
        geometry=geometry
    )


def vegetation_to_geojson(veg) -> GeoJsonFeature:
    geometry = coordinates_to_geojson(veg.coordinates)
    return GeoJsonFeature(
        properties={
            "vegetation_id": veg.id,
            "area": veg.area,
            "vegetation_type": veg.vegetation_type,
        },
        geometry=geometry
    )


def features_to_geojson(features) -> GeoJsonCollection:
    all_features = []

    for parcel in features.parcels:
        all_features.append(parcel_to_geojson(parcel))

    for building in features.buildings:
        all_features.append(building_to_geojson(building))

    for road in features.roads:
        all_features.append(road_to_geojson(road))

    for veg in features.vegetation:
        all_features.append(vegetation_to_geojson(veg))

    return GeoJsonCollection(features=all_features)


def features_to_csv(features) -> str:
    lines = ["type,id,area,perimeter,land_use,confidence,latitude,longitude"]

    for p in features.parcels:
        lines.append(f"parcel,{p.id},{p.area},{p.perimeter},{p.land_use.value},{p.confidence},{p.centroid.lat},{p.centroid.lng}")

    for b in features.buildings:
        lines.append(f"building,{b.id},{b.area},,{b.parcel_id},{b.confidence},{b.centroid.lat},{b.centroid.lng}")

    for r in features.roads:
        lines.append(f"road,{r.id},{r.length},{r.width},{r.name},{r.confidence},,")

    for v in features.vegetation:
        lines.append(f"vegetation,{v.id},{v.area},,{v.vegetation_type},,{v.centroid.lat},{v.centroid.lng}")

    return "\n".join(lines)


def features_to_kml(features) -> str:
    kml_parts = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<kml xmlns="http://www.opengis.net/kml/2.2">',
        '<Document>',
        '<name>Cadastral Map Export</name>',
        '<description>AI-Based Automated Urban Parcel Mapping</description>',
    ]

    for p in features.parcels:
        kml_parts.append('<Placemark>')
        kml_parts.append(f'<name>{p.id}</name>')
        kml_parts.append(f'<description>Area: {p.area}m² | Land Use: {p.land_use.value} | Confidence: {p.confidence}</description>')
        kml_parts.append('<Polygon>')
        kml_parts.append('<outerBoundaryIs><LinearRing><coordinates>')
        for c in p.coordinates:
            kml_parts.append(f'{c.lng},{c.lat},0')
        kml_parts.append('</coordinates></LinearRing></outerBoundaryIs>')
        kml_parts.append('</Polygon>')
        kml_parts.append('</Placemark>')

    for b in features.buildings:
        kml_parts.append('<Placemark>')
        kml_parts.append(f'<name>Building {b.id}</name>')
        kml_parts.append(f'<description>Floors: {b.floors} | Area: {b.area}m²</description>')
        kml_parts.append('<Polygon>')
        kml_parts.append('<outerBoundaryIs><LinearRing><coordinates>')
        for c in b.coordinates:
            kml_parts.append(f'{c.lng},{c.lat},0')
        kml_parts.append('</coordinates></LinearRing></outerBoundaryIs>')
        kml_parts.append('</Polygon>')
        kml_parts.append('</Placemark>')

    kml_parts.append('</Document>')
    kml_parts.append('</kml>')

    return "\n".join(kml_parts)
