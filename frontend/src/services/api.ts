import axios from 'axios';

const API_BASE = '/api';
const USE_MOCK = true;

export interface Coordinate {
  lat: number;
  lng: number;
}

export interface Parcel {
  id: string;
  project_id: string;
  area: number;
  perimeter: number;
  land_use: string;
  buildings: number;
  building_coverage: number;
  confidence: number;
  coordinates: Coordinate[];
  centroid: Coordinate;
  status: string;
  timestamp: string;
}

export interface Building {
  id: string;
  parcel_id: string;
  area: number;
  height: number;
  floors: number;
  confidence: number;
  coordinates: Coordinate[];
  centroid: Coordinate;
}

export interface Road {
  id: string;
  name: string;
  length: number;
  width: number;
  coordinates: Coordinate[];
  confidence: number;
}

export interface Vegetation {
  id: string;
  area: number;
  vegetation_type: string;
  coordinates: Coordinate[];
  centroid: Coordinate;
}

export interface Features {
  parcels: Parcel[];
  buildings: Building[];
  roads: Road[];
  vegetation: Vegetation[];
}

export interface Statistics {
  total_parcels: number;
  total_buildings: number;
  total_mapped_area: number;
  total_road_length: number;
  road_coverage: number;
  green_area: number;
  average_confidence: number;
  processing_time: number;
  land_use_distribution: Record<string, number>;
  building_size_distribution: Record<string, number>;
  confidence_distribution: Record<string, number>;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  image_count: number;
  area_covered: number;
  created_at: string;
  updated_at: string;
  analysis_id?: string;
}

function generatePolygon(cx: number, cy: number, r: number, sides: number): Coordinate[] {
  const coords: Coordinate[] = [];
  for (let i = 0; i < sides; i++) {
    const angle = (2 * Math.PI * i) / sides + (Math.random() - 0.5) * 0.5;
    const dist = r * (0.7 + Math.random() * 0.6);
    const lat = cx + dist * Math.cos(angle);
    const lng = cy + (dist * Math.sin(angle)) / Math.cos((cx * Math.PI) / 180);
    coords.push({ lat: +lat.toFixed(6), lng: +lng.toFixed(6) });
  }
  coords.push(coords[0]);
  return coords;
}

function calcArea(coords: Coordinate[]): number {
  if (coords.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    area += coords[i].lng * coords[i + 1].lat;
    area -= coords[i + 1].lng * coords[i].lat;
  }
  return Math.abs(area / 2) * 111000 * 111000;
}

function calcPerimeter(coords: Coordinate[]): number {
  let total = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    const dlat = (coords[i + 1].lat - coords[i].lat) * 111000;
    const dlng = (coords[i + 1].lng - coords[i].lng) * 111000 * Math.cos(((coords[i].lat + coords[i + 1].lat) / 2 * Math.PI) / 180);
    total += Math.sqrt(dlat * dlat + dlng * dlng);
  }
  return +total.toFixed(2);
}

const CENTER = { lat: 28.6139, lng: 77.2090 };
const LAND_USES = ['residential', 'commercial', 'industrial', 'green_area', 'vacant'];

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateMockFeatures(): Features {
  const rand = seededRandom(42);
  const parcels: Parcel[] = [];
  const buildings: Building[] = [];
  const roads: Road[] = [];
  const vegetation: Vegetation[] = [];

  const usedPositions: [number, number][] = [];

  for (let i = 0; i < 12; i++) {
    let lat: number, lng: number;
    let attempts = 0;
    do {
      lat = CENTER.lat + (rand() - 0.5) * 0.01;
      lng = CENTER.lng + (rand() - 0.5) * 0.01;
      attempts++;
    } while (
      attempts < 100 &&
      usedPositions.some(
        ([pl, plng]) => Math.sqrt(((lat - pl) * 111000) ** 2 + ((lng - plng) * 111000) ** 2) < 60
      )
    );
    usedPositions.push([lat, lng]);

    const sides = [4, 5, 6, 6, 8][Math.floor(rand() * 5)];
    const radius = 25 + rand() * 35;
    const coords = generatePolygon(lat, lng, radius / 111000, sides);
    const area = calcArea(coords);
    const perimeter = calcPerimeter(coords);
    const landUse = LAND_USES[Math.floor(rand() * 5)];
    const bCount = landUse === 'residential' || landUse === 'commercial' ? 1 + Math.floor(rand() * 3) : Math.floor(rand() * 2);
    const coverage = bCount > 0 ? +(10 + rand() * 50).toFixed(1) : 0;
    const confidence = +(0.82 + rand() * 0.17).toFixed(3);

    const parcel: Parcel = {
      id: `P-${1000 + i}`,
      project_id: 'demo-project-001',
      area: +area.toFixed(2),
      perimeter,
      land_use: landUse,
      buildings: bCount,
      building_coverage: coverage,
      confidence,
      coordinates: coords,
      centroid: { lat: +lat.toFixed(6), lng: +lng.toFixed(6) },
      status: 'detected',
      timestamp: new Date().toISOString(),
    };
    parcels.push(parcel);

    for (let b = 0; b < bCount; b++) {
      const bLat = lat + (rand() - 0.5) * 0.002;
      const bLng = lng + (rand() - 0.5) * 0.002;
      const bRadius = (5 + rand() * 10) / 111000;
      const bCoords = generatePolygon(bLat, bLng, bRadius, 4);
      buildings.push({
        id: `B-${2000 + buildings.length}`,
        parcel_id: parcel.id,
        area: +calcArea(bCoords).toFixed(2),
        height: +(3 + rand() * 22).toFixed(1),
        floors: 1 + Math.floor(rand() * 7),
        confidence: +(0.85 + rand() * 0.13).toFixed(3),
        coordinates: bCoords,
        centroid: { lat: +bLat.toFixed(6), lng: +bLng.toFixed(6) },
      });
    }
  }

  const roadNames = ['MG Road', 'Station Road', 'Park Avenue', 'Main Street', 'Nehru Road', 'Gandhi Road', 'Patel Road', 'Rajiv Avenue'];
  for (let i = 0; i < 8; i++) {
    const startLat = CENTER.lat + (rand() - 0.5) * 0.008;
    const startLng = CENTER.lng + (rand() - 0.5) * 0.008;
    const dLat = (rand() - 0.5) * 0.004;
    const dLng = (rand() - 0.5) * 0.004;
    const coords: Coordinate[] = [];
    const segments = 4 + Math.floor(rand() * 4);
    for (let j = 0; j < segments; j++) {
      coords.push({
        lat: +(startLat + dLat * j + (rand() - 0.5) * 0.0004).toFixed(6),
        lng: +(startLng + dLng * j + (rand() - 0.5) * 0.0004).toFixed(6),
      });
    }
    roads.push({
      id: `R-${3000 + i}`,
      name: roadNames[i],
      length: +calcPerimeter(coords).toFixed(2),
      width: [6, 8, 10, 12, 15][Math.floor(rand() * 5)],
      coordinates: coords,
      confidence: +(0.88 + rand() * 0.09).toFixed(3),
    });
  }

  for (let i = 0; i < 8; i++) {
    const vLat = CENTER.lat + (rand() - 0.5) * 0.008;
    const vLng = CENTER.lng + (rand() - 0.5) * 0.008;
    const vRadius = (10 + rand() * 20) / 111000;
    const vCoords = generatePolygon(vLat, vLng, vRadius, 5 + Math.floor(rand() * 4));
    vegetation.push({
      id: `V-${4000 + i}`,
      area: +calcArea(vCoords).toFixed(2),
      vegetation_type: ['urban_tree', 'park', 'garden', 'grassland'][Math.floor(rand() * 4)],
      coordinates: vCoords,
      centroid: { lat: +vLat.toFixed(6), lng: +vLng.toFixed(6) },
    });
  }

  return { parcels, buildings, roads, vegetation };
}

function generateMockStats(features: Features): Statistics {
  const totalArea = features.parcels.reduce((s, p) => s + p.area, 0);
  const roadLen = features.roads.reduce((s, r) => s + r.length, 0);
  const roadCov = features.roads.reduce((s, r) => s + r.length * r.width, 0);
  const greenArea = features.vegetation.reduce((s, v) => s + v.area, 0);
  const avgConf = features.parcels.reduce((s, p) => s + p.confidence, 0) / features.parcels.length;

  return {
    total_parcels: features.parcels.length,
    total_buildings: features.buildings.length,
    total_mapped_area: +totalArea.toFixed(2),
    total_road_length: +roadLen.toFixed(2),
    road_coverage: +roadCov.toFixed(2),
    green_area: +greenArea.toFixed(2),
    average_confidence: +avgConf.toFixed(3),
    processing_time: 12.4,
    land_use_distribution: {
      residential: features.parcels.filter((p) => p.land_use === 'residential').length,
      commercial: features.parcels.filter((p) => p.land_use === 'commercial').length,
      industrial: features.parcels.filter((p) => p.land_use === 'industrial').length,
      green_area: features.parcels.filter((p) => p.land_use === 'green_area').length,
      vacant: features.parcels.filter((p) => p.land_use === 'vacant').length,
    },
    building_size_distribution: {
      small: features.buildings.filter((b) => b.area < 200).length,
      medium: features.buildings.filter((b) => b.area >= 200 && b.area < 500).length,
      large: features.buildings.filter((b) => b.area >= 500).length,
    },
    confidence_distribution: {
      high: features.parcels.filter((p) => p.confidence >= 0.9).length,
      medium: features.parcels.filter((p) => p.confidence >= 0.8 && p.confidence < 0.9).length,
      low: features.parcels.filter((p) => p.confidence < 0.8).length,
    },
  };
}

const MOCK_FEATURES = generateMockFeatures();
const MOCK_STATS = generateMockStats(MOCK_FEATURES);
const MOCK_PROJECTS: Project[] = [
  {
    id: 'demo-project-001',
    name: 'New Delhi Urban Survey',
    description: 'Demo project for AI-based cadastral mapping of New Delhi area',
    status: 'completed',
    image_count: 5,
    area_covered: 2450000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    analysis_id: 'analysis-demo-001',
  },
];

const mockAPI = {
  projectAPI: {
    list: () => Promise.resolve({ data: MOCK_PROJECTS }),
    get: (id: string) => Promise.resolve({ data: MOCK_PROJECTS.find((p) => p.id === id) || MOCK_PROJECTS[0] }),
    create: (data: { name: string; description: string }) =>
      Promise.resolve({
        data: { id: `proj-${Date.now()}`, ...data, status: 'draft', image_count: 0, area_covered: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      }),
  },
  analysisAPI: {
    analyze: () =>
      new Promise((resolve) =>
        setTimeout(() => {
          resolve({
            data: {
              status: 'completed',
              message: 'AI analysis completed successfully',
              processing_time: 12.4,
              features_summary: {
                parcels_detected: MOCK_FEATURES.parcels.length,
                buildings_detected: MOCK_FEATURES.buildings.length,
                roads_detected: MOCK_FEATURES.roads.length,
                vegetation_areas: MOCK_FEATURES.vegetation.length,
                average_confidence: MOCK_STATS.average_confidence,
              },
              analysis_id: 'analysis-demo-001',
            },
          });
        }, 2000)
      ),
    get: (id: string) => Promise.resolve({ data: { id, status: 'completed', features: MOCK_FEATURES, statistics: MOCK_STATS } }),
  },
  featureAPI: {
    getAll: () => Promise.resolve({ data: MOCK_FEATURES }),
    getParcels: () => Promise.resolve({ data: MOCK_FEATURES.parcels }),
    getParcel: (id: string) => Promise.resolve({ data: MOCK_FEATURES.parcels.find((p) => p.id === id) || MOCK_FEATURES.parcels[0] }),
    getStatistics: () => Promise.resolve({ data: MOCK_STATS }),
  },
  exportAPI: {
    geojson: () =>
      Promise.resolve({
        data: {
          data: JSON.stringify(
            {
              type: 'FeatureCollection',
              features: MOCK_FEATURES.parcels.map((p) => ({
                type: 'Feature',
                properties: { parcel_id: p.id, area: p.area, land_use: p.land_use, confidence: p.confidence },
                geometry: { type: 'Polygon', coordinates: [p.coordinates.map((c) => [c.lng, c.lat])] },
              })),
            },
            null,
            2
          ),
          format: 'geojson',
        },
      }),
    csv: () => {
      const lines = ['type,id,area,perimeter,land_use,confidence,latitude,longitude'];
      MOCK_FEATURES.parcels.forEach((p) => lines.push(`parcel,${p.id},${p.area},${p.perimeter},${p.land_use},${p.confidence},${p.centroid.lat},${p.centroid.lng}`));
      MOCK_FEATURES.buildings.forEach((b) => lines.push(`building,${b.id},${b.area},,${b.parcel_id},${b.confidence},${b.centroid.lat},${b.centroid.lng}`));
      return Promise.resolve({ data: { data: lines.join('\n'), format: 'csv' } });
    },
    kml: () => {
      let kml = '<?xml version="1.0" encoding="UTF-8"?>\n<kml xmlns="http://www.opengis.net/kml/2.2">\n<Document>\n<name>Cadastral Map Export</name>\n';
      MOCK_FEATURES.parcels.forEach((p) => {
        kml += `<Placemark><name>${p.id}</name><description>Area: ${p.area}m²</description><Polygon><outerBoundaryIs><LinearRing><coordinates>\n`;
        p.coordinates.forEach((c) => (kml += `${c.lng},${c.lat},0\n`));
        kml += '</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark>\n';
      });
      kml += '</Document>\n</kml>';
      return Promise.resolve({ data: { data: kml, format: 'kml' } });
    },
  },
  reportAPI: {
    generate: (config: { project_id: string; include_map?: boolean; include_statistics?: boolean; include_parcels?: boolean; include_buildings?: boolean }) =>
      new Promise((resolve) =>
        setTimeout(() => {
          resolve({
            data: {
              report_id: `rpt-${Date.now()}`,
              project_name: 'New Delhi Urban Survey',
              date: new Date().toISOString(),
              status: 'generated',
              summary: {
                total_parcels: MOCK_STATS.total_parcels,
                total_buildings: MOCK_STATS.total_buildings,
                total_mapped_area: MOCK_STATS.total_mapped_area,
                road_length: MOCK_STATS.total_road_length,
                green_area: MOCK_STATS.green_area,
                average_confidence: MOCK_STATS.average_confidence,
                processing_time: MOCK_STATS.processing_time,
              },
              sections: [
                { name: 'Executive Summary', included: true },
                { name: 'Parcel Statistics', included: config.include_parcels !== false },
                { name: 'Building Analysis', included: config.include_buildings !== false },
                { name: 'Map Preview', included: config.include_map !== false },
                { name: 'AI Confidence Analysis', included: config.include_statistics !== false },
              ],
            },
          });
        }, 1500)
      ),
  },
  uploadAPI: {
    upload: (file: File) =>
      Promise.resolve({
        data: { filename: file.name, size: file.size, status: 'uploaded', message: 'Image uploaded successfully' },
      }),
  },
};

export interface AnalysisSummary {
  parcels_detected: number;
  buildings_detected: number;
  roads_detected: number;
  vegetation_areas: number;
  average_confidence: number;
}

export interface AnalysisResponse {
  status: string;
  message: string;
  processing_time: number;
  features_summary: AnalysisSummary;
  analysis_id: string;
}

export interface ReportSection {
  name: string;
  included: boolean;
}

export interface ReportSummary {
  total_parcels: number;
  total_buildings: number;
  total_mapped_area: number;
  road_length: number;
  green_area: number;
  average_confidence: number;
  processing_time: number;
}

export interface GeneratedReport {
  report_id: string;
  project_name: string;
  date: string;
  status: string;
  summary: ReportSummary;
  sections: ReportSection[];
}

export interface UploadResponse {
  filename: string;
  size: number;
  status: string;
  message: string;
}

export interface ExportResponse {
  data: string;
  format: string;
}

const api = axios.create({ baseURL: API_BASE, timeout: 30000 });

export const projectAPI = {
  list: (): Promise<{ data: Project[] }> => (USE_MOCK ? mockAPI.projectAPI.list() : api.get<Project[]>('/projects')),
  get: (id: string): Promise<{ data: Project }> => (USE_MOCK ? mockAPI.projectAPI.get(id) : api.get<Project>(`/projects/${id}`)),
  create: (data: { name: string; description: string }): Promise<{ data: Project }> => (USE_MOCK ? mockAPI.projectAPI.create(data) : api.post<Project>('/projects', data)),
};

export const analysisAPI = {
  analyze: (projectId?: string): Promise<{ data: AnalysisResponse }> =>
    (USE_MOCK ? (mockAPI.analysisAPI.analyze() as Promise<{ data: AnalysisResponse }>) : api.post<AnalysisResponse>('/analyze', null, { params: { project_id: projectId } })),
  get: (id: string): Promise<{ data: any }> =>
    (USE_MOCK ? mockAPI.analysisAPI.get(id) : api.get(`/analysis/${id}`)),
};

export const featureAPI = {
  getAll: (projectId = 'demo-project-001'): Promise<{ data: Features }> =>
    (USE_MOCK ? mockAPI.featureAPI.getAll() : api.get<Features>('/features', { params: { project_id: projectId } })),
  getParcels: (projectId = 'demo-project-001'): Promise<{ data: Parcel[] }> =>
    (USE_MOCK ? mockAPI.featureAPI.getParcels() : api.get<Parcel[]>('/parcels', { params: { project_id: projectId } })),
  getParcel: (id: string): Promise<{ data: Parcel }> =>
    (USE_MOCK ? mockAPI.featureAPI.getParcel(id) : api.get<Parcel>(`/parcels/${id}`)),
  getStatistics: (projectId = 'demo-project-001'): Promise<{ data: Statistics }> =>
    (USE_MOCK ? mockAPI.featureAPI.getStatistics() : api.get<Statistics>('/statistics', { params: { project_id: projectId } })),
};

export const exportAPI = {
  geojson: (projectId = 'demo-project-001'): Promise<{ data: ExportResponse }> =>
    (USE_MOCK ? mockAPI.exportAPI.geojson() : api.get<ExportResponse>('/export/geojson', { params: { project_id: projectId } })),
  csv: (projectId = 'demo-project-001'): Promise<{ data: ExportResponse }> =>
    (USE_MOCK ? mockAPI.exportAPI.csv() : api.get<ExportResponse>('/export/csv', { params: { project_id: projectId } })),
  kml: (projectId = 'demo-project-001'): Promise<{ data: ExportResponse }> =>
    (USE_MOCK ? mockAPI.exportAPI.kml() : api.get<ExportResponse>('/export/kml', { params: { project_id: projectId } })),
};

export const reportAPI = {
  generate: (config: { project_id: string; include_map?: boolean; include_statistics?: boolean; include_parcels?: boolean; include_buildings?: boolean }): Promise<{ data: GeneratedReport }> =>
    (USE_MOCK ? (mockAPI.reportAPI.generate(config) as Promise<{ data: GeneratedReport }>) : api.post<GeneratedReport>('/reports', config)),
};

export const uploadAPI = {
  upload: (file: File): Promise<{ data: UploadResponse }> => {
    if (USE_MOCK) return mockAPI.uploadAPI.upload(file);
    const fd = new FormData();
    fd.append('file', file);
    return api.post<UploadResponse>('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};

export default api;
