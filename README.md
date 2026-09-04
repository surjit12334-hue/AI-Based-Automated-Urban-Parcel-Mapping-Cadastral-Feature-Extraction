# AI-Based Automated Urban Parcel Mapping & Cadastral Feature Extraction

An AI-powered cadastral intelligence platform that automatically detects parcels, buildings, roads, and urban features from high-resolution drone imagery.

## Features

- **AI Object Detection** - YOLO-based detection of buildings, roads, and urban structures
- **Semantic Segmentation** - U-Net architecture for pixel-level land parcel segmentation
- **Interactive GIS Map** - Leaflet.js-powered map with layer controls and parcel selection
- **Parcel Analysis** - Detailed parcel information including area, perimeter, and land use
- **Analytics Dashboard** - Interactive charts and KPIs for urban statistics
- **Data Export** - Export to GeoJSON, CSV, and KML formats
- **Report Generation** - Comprehensive cadastral mapping reports

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, TypeScript, Tailwind CSS, Leaflet.js, Recharts |
| Backend | Python, FastAPI, Shapely, GeoPandas |
| AI/CV | PyTorch, OpenCV, YOLO, U-Net |
| GIS | Rasterio, GDAL, PostGIS |
| Database | PostgreSQL + PostGIS (SQLite for MVP) |

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 20+
- npm or yarn

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and proxies API requests to the backend at `http://localhost:8000`.

### Docker Setup

```bash
docker-compose up --build
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List all projects |
| POST | `/api/projects` | Create a new project |
| POST | `/api/upload` | Upload drone imagery |
| POST | `/api/analyze` | Run AI analysis |
| GET | `/api/features` | Get detected features |
| GET | `/api/parcels` | Get all parcels |
| GET | `/api/parcels/{id}` | Get specific parcel |
| GET | `/api/statistics` | Get project statistics |
| POST | `/api/reports` | Generate report |
| GET | `/api/export/geojson` | Export as GeoJSON |
| GET | `/api/export/csv` | Export as CSV |
| GET | `/api/export/kml` | Export as KML |

## Project Structure

```
urban-parcel-ai/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Page components
│   │   ├── layouts/          # Layout components
│   │   ├── maps/             # Map components
│   │   ├── charts/           # Chart components
│   │   ├── services/         # API services
│   │   └── utils/            # Utility functions
│   └── package.json
├── backend/                  # Python FastAPI backend
│   ├── app/
│   │   ├── api/              # API routes
│   │   ├── models/           # Data models
│   │   ├── services/         # Business logic
│   │   ├── ai/               # AI pipeline & demo data
│   │   ├── gis/              # GIS processing
│   │   └── utils/            # Utility functions
│   └── requirements.txt
├── data/                     # Data directory
│   ├── demo/                 # Demo datasets
│   └── processed/            # Processed outputs
├── models/                   # AI model weights
├── docker-compose.yml
└── README.md
```

## AI Architecture

```
Drone Image → Preprocessor → Object Detection (YOLO)
    → Semantic Segmentation (U-Net) → Feature Extraction
    → Polygon Generation → Parcel Boundary Engine
    → GIS Processing → Cadastral Dataset
```

## Demo Mode

Click "Try Demo" on the landing page or dashboard to experience the full system with sample cadastral data for New Delhi, India. The demo includes:

- 12 land parcels with different land uses
- 18+ detected buildings
- 8 road networks
- 8 vegetation areas
- Full analytics and reporting

## Export Formats

- **GeoJSON** - Standard GIS format for web mapping
- **CSV** - Spreadsheet-compatible tabular data
- **KML** - Google Earth compatible format

## License

MIT License
