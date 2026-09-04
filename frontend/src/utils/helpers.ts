import { Coordinate } from '../services/api';

export function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toFixed(0);
}

export function formatArea(area: number): string {
  if (area >= 1000000) return (area / 1000000).toFixed(2) + ' km²';
  if (area >= 1000) return (area / 1000).toFixed(1) + ' ha';
  return area.toFixed(0) + ' m²';
}

export function formatDistance(meters: number): string {
  if (meters >= 1000) return (meters / 1000).toFixed(2) + ' km';
  return meters.toFixed(0) + ' m';
}

export function coordinatesToLatLngs(coords: Coordinate[]): [number, number][] {
  return coords.map(c => [c.lat, c.lng]);
}

export function getLandUseColor(landUse: string): string {
  const colors: Record<string, string> = {
    residential: '#2186eb',
    commercial: '#f0b429',
    industrial: '#ff6347',
    agricultural: '#31b237',
    green_area: '#0d7d0f',
    road: '#829ab1',
    water: '#0967d2',
    vacant: '#627d98',
  };
  return colors[landUse] || '#627d98';
}

export function getLandUseLabel(landUse: string): string {
  const labels: Record<string, string> = {
    residential: 'Residential',
    commercial: 'Commercial',
    industrial: 'Industrial',
    agricultural: 'Agricultural',
    green_area: 'Green Area',
    road: 'Road',
    water: 'Water',
    vacant: 'Vacant Land',
  };
  return labels[landUse] || landUse;
}

export function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.9) return '#31b237';
  if (confidence >= 0.8) return '#f0b429';
  return '#ff6347';
}

export const MAP_CENTER: [number, number] = [28.6139, 77.2090];
export const MAP_ZOOM = 14;
