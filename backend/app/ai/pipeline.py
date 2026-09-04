import time
import random
from typing import Dict, Any
from app.models.models import DetectedFeatures, Coordinate
from app.ai.demo_data import generate_demo_analysis


class MockAIPipeline:
    def __init__(self):
        self.stages = [
            {"name": "Image Validation", "duration": 0.5},
            {"name": "Preprocessing", "duration": 1.0},
            {"name": "Object Detection", "duration": 2.5},
            {"name": "Semantic Segmentation", "duration": 2.0},
            {"name": "Feature Extraction", "duration": 1.5},
            {"name": "Parcel Boundary Extraction", "duration": 2.0},
            {"name": "GIS Processing", "duration": 1.5},
            {"name": "Area & Geometry Calculation", "duration": 1.0},
        ]

    def process_image(self, filename: str) -> Dict[str, Any]:
        start_time = time.time()
        completed_stages = []

        for stage in self.stages:
            time.sleep(stage["duration"] * 0.05)
            completed_stages.append({
                "name": stage["name"],
                "status": "completed",
                "duration": stage["duration"]
            })

        analysis = generate_demo_analysis()
        processing_time = round(time.time() - start_time, 2)

        return {
            "status": "completed",
            "processing_time": processing_time,
            "stages": completed_stages,
            "analysis_id": analysis.id,
            "features_summary": {
                "parcels_detected": len(analysis.features.parcels),
                "buildings_detected": len(analysis.features.buildings),
                "roads_detected": len(analysis.features.roads),
                "vegetation_areas": len(analysis.features.vegetation),
                "average_confidence": analysis.statistics.get("average_confidence", 0),
            }
        }

    def get_progress(self) -> Dict[str, Any]:
        return {
            "current_stage": random.choice(self.stages)["name"],
            "progress_percent": random.randint(30, 90),
            "stages_completed": random.randint(3, len(self.stages) - 1),
            "total_stages": len(self.stages),
            "estimated_remaining": f"{random.uniform(2, 8):.1f}s"
        }


ai_pipeline = MockAIPipeline()
