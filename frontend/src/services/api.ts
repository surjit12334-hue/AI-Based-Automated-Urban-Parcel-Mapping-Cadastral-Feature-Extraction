import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

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

export const projectAPI = {
  list: () => api.get<Project[]>('/projects'),
  get: (id: string) => api.get<Project>(`/projects/${id}`),
  create: (data: { name: string; description: string }) => api.post<Project>('/projects', data),
};

export const analysisAPI = {
  analyze: (projectId?: string) => api.post('/analyze', null, { params: { project_id: projectId } }),
  get: (id: string) => api.get(`/analysis/${id}`),
};

export const featureAPI = {
  getAll: (projectId: string = 'demo-project-001') => api.get<Features>('/features', { params: { project_id: projectId } }),
  getParcels: (projectId: string = 'demo-project-001') => api.get<Parcel[]>('/parcels', { params: { project_id: projectId } }),
  getParcel: (id: string) => api.get<Parcel>(`/parcels/${id}`),
  getStatistics: (projectId: string = 'demo-project-001') => api.get<Statistics>('/statistics', { params: { project_id: projectId } }),
};

export const exportAPI = {
  geojson: (projectId: string = 'demo-project-001') => api.get('/export/geojson', { params: { project_id: projectId } }),
  csv: (projectId: string = 'demo-project-001') => api.get('/export/csv', { params: { project_id: projectId } }),
  kml: (projectId: string = 'demo-project-001') => api.get('/export/kml', { params: { project_id: projectId } }),
};

export const reportAPI = {
  generate: (config: { project_id: string; include_map?: boolean; include_statistics?: boolean; include_parcels?: boolean }) =>
    api.post('/reports', config),
};

export const uploadAPI = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default api;
