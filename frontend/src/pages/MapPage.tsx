import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Polyline, CircleMarker, Popup, LayerGroup, ZoomControl, useMap } from 'react-leaflet';
import {
  Layers, Eye, EyeOff, X, Maximize2, Minimize2, RefreshCw,
  Search, Crosshair, MapPin, Building2, Trees, Navigation,
  Filter, Check, Compass
} from 'lucide-react';
import Sidebar from '../layouts/Sidebar';
import { featureAPI, Features, Parcel } from '../services/api';
import { getLandUseColor, getLandUseLabel, MAP_CENTER, MAP_ZOOM, formatArea } from '../utils/helpers';

type BasemapType = 'satellite' | 'streets' | 'dark';

const BASEMAPS: Record<BasemapType, { name: string; url: string; attribution: string }> = {
  satellite: {
    name: 'Satellite (Esri)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
  },
  streets: {
    name: 'Street Map (OSM)',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  dark: {
    name: 'Dark Canvas',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
  },
};

function MapFlyTo({ center, zoom }: { center: [number, number] | null; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
}

export default function MapPage() {
  const [features, setFeatures] = useState<Features | null>(null);
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);
  const [layers, setLayers] = useState({
    parcels: true,
    buildings: true,
    roads: true,
    vegetation: true,
  });
  const [basemap, setBasemap] = useState<BasemapType>('satellite');
  const [filterLandUse, setFilterLandUse] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [flyTarget, setFlyTarget] = useState<{ center: [number, number]; zoom: number } | null>(null);

  useEffect(() => {
    loadFeatures();
  }, []);

  const loadFeatures = async () => {
    setLoading(true);
    try {
      const res = await featureAPI.getAll();
      setFeatures(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const toggleLayer = (key: keyof typeof layers) => {
    setLayers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredParcels = (features?.parcels || []).filter(p => {
    const matchesLandUse = filterLandUse === 'all' || p.land_use === filterLandUse;
    const matchesSearch = !searchQuery || p.id.toLowerCase().includes(searchQuery.toLowerCase()) || p.land_use.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLandUse && matchesSearch;
  });

  const handleSelectParcel = (parcel: Parcel, shouldFly = false) => {
    setSelectedParcel(parcel);
    if (shouldFly) {
      setFlyTarget({ center: [parcel.centroid.lat, parcel.centroid.lng], zoom: 16 });
    }
  };

  const resetView = () => {
    setFlyTarget({ center: MAP_CENTER, zoom: MAP_ZOOM });
  };

  return (
    <Sidebar>
      <div className={`relative ${fullscreen ? 'fixed inset-0 z-50 bg-navy-950' : 'h-full'}`}>
        {/* Top Floating Control Bar */}
        <div className="absolute top-4 right-4 z-[1000] flex items-center gap-2">
          {/* Basemap Switcher */}
          <div className="glass-card rounded-xl p-1 animate-in flex items-center shadow-lg border border-navy-700/40">
            {(['satellite', 'streets', 'dark'] as BasemapType[]).map(type => (
              <button
                key={type}
                onClick={() => setBasemap(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                  basemap === type
                    ? 'bg-accent-600 text-white shadow-sm'
                    : 'text-navy-300 hover:text-white hover:bg-navy-700/40'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <button
            onClick={resetView}
            title="Reset Map Center"
            className="p-2.5 rounded-xl glass hover:bg-navy-700/50 transition-colors shadow-lg border border-navy-700/40 text-navy-200 hover:text-white"
          >
            <Compass className="w-4 h-4" />
          </button>

          <button
            onClick={() => setFullscreen(!fullscreen)}
            title={fullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            className="p-2.5 rounded-xl glass hover:bg-navy-700/50 transition-colors shadow-lg border border-navy-700/40 text-navy-200 hover:text-white"
          >
            {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={loadFeatures}
            title="Reload Layer Data"
            className="p-2.5 rounded-xl glass hover:bg-navy-700/50 transition-colors shadow-lg border border-navy-700/40 text-navy-200 hover:text-white"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Left Control Drawer: Layers & Search */}
        <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-3 w-72 max-h-[calc(100vh-6rem)] overflow-hidden">
          {/* Layer Panel */}
          <div className="glass-card rounded-xl p-4 animate-in shadow-xl border border-navy-700/40 backdrop-blur-md">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-navy-200 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-accent-400" /> Cadastral Layers
              </h3>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-accent-600/20 text-accent-300 font-mono">
                {features ? `${features.parcels.length} Parcels` : 'Loading...'}
              </span>
            </div>

            <div className="space-y-1.5">
              {[
                { key: 'parcels' as const, label: 'Parcels (Boundaries)', color: '#2186eb', count: features?.parcels.length || 0 },
                { key: 'buildings' as const, label: 'Buildings (Footprints)', color: '#ff6347', count: features?.buildings.length || 0 },
                { key: 'roads' as const, label: 'Road Networks', color: '#f0b429', count: features?.roads.length || 0 },
                { key: 'vegetation' as const, label: 'Vegetation & Parks', color: '#31b237', count: features?.vegetation.length || 0 },
              ].map(({ key, label, color, count }) => (
                <button
                  key={key}
                  onClick={() => toggleLayer(key)}
                  className="flex items-center justify-between w-full px-2.5 py-2 rounded-lg hover:bg-navy-800/60 transition-colors text-xs text-navy-200 group"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-4 h-4 rounded border flex items-center justify-center transition-all"
                      style={{
                        borderColor: color,
                        background: layers[key] ? color + '33' : 'transparent',
                      }}
                    >
                      {layers[key] && <div className="w-2 h-2 rounded-sm" style={{ background: color }} />}
                    </div>
                    <span className="font-medium group-hover:text-white">{label}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-navy-400">
                    <span className="text-[10px] font-mono opacity-70">({count})</span>
                    {layers[key] ? <Eye className="w-3.5 h-3.5 text-accent-400" /> : <EyeOff className="w-3.5 h-3.5 text-navy-600" />}
                  </div>
                </button>
              ))}
            </div>

            {/* Filter by Land Use */}
            <div className="mt-3 pt-3 border-t border-navy-700/40">
              <label className="text-[11px] font-medium text-navy-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Filter by Land Use
              </label>
              <select
                value={filterLandUse}
                onChange={e => setFilterLandUse(e.target.value)}
                className="w-full bg-navy-900/80 border border-navy-700/50 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-accent-500"
              >
                <option value="all">All Land Uses</option>
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="industrial">Industrial</option>
                <option value="green_area">Green Area</option>
                <option value="vacant">Vacant Land</option>
              </select>
            </div>
          </div>

          {/* Quick Parcel Explorer */}
          <div className="glass-card rounded-xl p-3 animate-in shadow-xl border border-navy-700/40 backdrop-blur-md flex flex-col flex-1 overflow-hidden">
            <div className="relative mb-2">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-navy-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search parcel ID..."
                className="w-full bg-navy-900/80 border border-navy-700/50 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-navy-500 focus:outline-none focus:border-accent-500"
              />
            </div>

            <div className="overflow-y-auto max-h-48 space-y-1 pr-1">
              {filteredParcels.map(p => {
                const isSelected = selectedParcel?.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectParcel(p, true)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-accent-600/30 border border-accent-500/50 text-white font-semibold'
                        : 'text-navy-300 hover:bg-navy-800/50 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: getLandUseColor(p.land_use) }}
                      />
                      <span className="font-mono">{p.id}</span>
                      <span className="text-[10px] text-navy-400 capitalize truncate">
                        {getLandUseLabel(p.land_use)}
                      </span>
                    </div>
                    <span className="text-[10px] text-navy-400 flex-shrink-0 ml-1">
                      {formatArea(p.area)}
                    </span>
                  </button>
                );
              })}
              {filteredParcels.length === 0 && (
                <div className="text-center py-3 text-xs text-navy-400">
                  No matching parcels
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Selected Parcel Inspector Floating Card */}
        {selectedParcel && (
          <div className="absolute top-4 right-16 z-[1000] w-84 max-w-sm">
            <div className="glass-card rounded-xl p-5 animate-in shadow-2xl border border-accent-500/40 backdrop-blur-lg">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg font-bold text-white">{selectedParcel.id}</span>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider"
                      style={{
                        background: getLandUseColor(selectedParcel.land_use) + '33',
                        color: getLandUseColor(selectedParcel.land_use),
                        border: `1px solid ${getLandUseColor(selectedParcel.land_use)}55`,
                      }}
                    >
                      {getLandUseLabel(selectedParcel.land_use)}
                    </span>
                  </div>
                  <p className="text-xs text-navy-300 mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-accent-400" />
                    {selectedParcel.centroid.lat.toFixed(5)}, {selectedParcel.centroid.lng.toFixed(5)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedParcel(null)}
                  className="p-1 rounded-lg hover:bg-navy-700/50 text-navy-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5 my-3 text-xs">
                <div className="bg-navy-900/60 border border-navy-700/30 rounded-lg p-2.5">
                  <p className="text-navy-400 text-[11px] mb-0.5">Cadastral Area</p>
                  <p className="font-semibold text-white text-sm">{formatArea(selectedParcel.area)}</p>
                </div>
                <div className="bg-navy-900/60 border border-navy-700/30 rounded-lg p-2.5">
                  <p className="text-navy-400 text-[11px] mb-0.5">Boundary Perimeter</p>
                  <p className="font-semibold text-white text-sm">{selectedParcel.perimeter.toLocaleString()} m</p>
                </div>
                <div className="bg-navy-900/60 border border-navy-700/30 rounded-lg p-2.5">
                  <p className="text-navy-400 text-[11px] mb-0.5">Detected Buildings</p>
                  <p className="font-semibold text-white text-sm flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-accent-400" />
                    {selectedParcel.buildings} structures
                  </p>
                </div>
                <div className="bg-navy-900/60 border border-navy-700/30 rounded-lg p-2.5">
                  <p className="text-navy-400 text-[11px] mb-0.5">Building Coverage</p>
                  <p className="font-semibold text-white text-sm">{selectedParcel.building_coverage}%</p>
                </div>
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-navy-400">AI Confidence Score</span>
                  <span className="font-semibold text-success-400">{(selectedParcel.confidence * 100).toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-navy-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${selectedParcel.confidence * 100}%`,
                      background: selectedParcel.confidence >= 0.9 ? '#31b237' : '#f0b429',
                    }}
                  />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-navy-700/40 flex items-center gap-2">
                <button
                  onClick={() => setFlyTarget({ center: [selectedParcel.centroid.lat, selectedParcel.centroid.lng], zoom: 17 })}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-accent-600/20 hover:bg-accent-600/30 border border-accent-500/30 text-xs font-medium text-accent-300 transition-all"
                >
                  <Crosshair className="w-3.5 h-3.5" /> Center Parcel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Leaflet GIS Map Container */}
        <MapContainer
          center={MAP_CENTER}
          zoom={MAP_ZOOM}
          className="h-full w-full"
          zoomControl={false}
          style={{ background: '#0a1929' }}
        >
          <ZoomControl position="bottomright" />
          <MapFlyTo center={flyTarget?.center || null} zoom={flyTarget?.zoom || MAP_ZOOM} />

          {/* Active Basemap Layer */}
          <TileLayer
            key={basemap}
            attribution={BASEMAPS[basemap].attribution}
            url={BASEMAPS[basemap].url}
          />

          {/* Cadastral Parcels Layer */}
          {features && layers.parcels && (
            <LayerGroup>
              {filteredParcels.map(parcel => {
                const isSelected = selectedParcel?.id === parcel.id;
                const landColor = getLandUseColor(parcel.land_use);
                return (
                  <Polygon
                    key={parcel.id}
                    positions={parcel.coordinates.map(c => [c.lat, c.lng])}
                    pathOptions={{
                      color: isSelected ? '#38bdf8' : landColor,
                      fillColor: isSelected ? '#38bdf8' : landColor,
                      fillOpacity: isSelected ? 0.45 : 0.22,
                      weight: isSelected ? 3.5 : 2,
                      dashArray: isSelected ? '4, 4' : undefined,
                    }}
                    eventHandlers={{
                      click: () => handleSelectParcel(parcel),
                    }}
                  >
                    <Popup>
                      <div className="text-xs font-sans text-navy-900">
                        <p className="font-bold text-sm text-accent-700">{parcel.id}</p>
                        <p className="text-gray-700 mt-0.5"><strong>Land Use:</strong> {getLandUseLabel(parcel.land_use)}</p>
                        <p className="text-gray-700"><strong>Area:</strong> {formatArea(parcel.area)}</p>
                        <p className="text-gray-700"><strong>Buildings:</strong> {parcel.buildings}</p>
                        <p className="text-gray-700"><strong>Confidence:</strong> {(parcel.confidence * 100).toFixed(1)}%</p>
                      </div>
                    </Popup>
                  </Polygon>
                );
              })}
            </LayerGroup>
          )}

          {/* Buildings Layer */}
          {features && layers.buildings && (
            <LayerGroup>
              {features.buildings.map(building => (
                <Polygon
                  key={building.id}
                  positions={building.coordinates.map(c => [c.lat, c.lng])}
                  pathOptions={{
                    color: '#ff6347',
                    fillColor: '#ff6347',
                    fillOpacity: 0.5,
                    weight: 1.5,
                  }}
                >
                  <Popup>
                    <div className="text-xs font-sans text-navy-900">
                      <p className="font-bold text-sm text-red-600">{building.id}</p>
                      <p className="text-gray-700"><strong>Parcel:</strong> {building.parcel_id}</p>
                      <p className="text-gray-700"><strong>Area:</strong> {formatArea(building.area)}</p>
                      <p className="text-gray-700"><strong>Height:</strong> {building.height}m ({building.floors} floors)</p>
                      <p className="text-gray-700"><strong>Confidence:</strong> {(building.confidence * 100).toFixed(1)}%</p>
                    </div>
                  </Popup>
                </Polygon>
              ))}
            </LayerGroup>
          )}

          {/* Road Networks Layer */}
          {features && layers.roads && (
            <LayerGroup>
              {features.roads.map(road => (
                <Polyline
                  key={road.id}
                  positions={road.coordinates.map(c => [c.lat, c.lng])}
                  pathOptions={{
                    color: '#f0b429',
                    weight: Math.max(road.width / 2.5, 3),
                    opacity: 0.85,
                  }}
                >
                  <Popup>
                    <div className="text-xs font-sans text-navy-900">
                      <p className="font-bold text-sm text-amber-600">{road.name}</p>
                      <p className="text-gray-700"><strong>Length:</strong> {(road.length / 1000).toFixed(2)} km</p>
                      <p className="text-gray-700"><strong>Width:</strong> {road.width}m</p>
                      <p className="text-gray-700"><strong>AI Confidence:</strong> {(road.confidence * 100).toFixed(1)}%</p>
                    </div>
                  </Popup>
                </Polyline>
              ))}
            </LayerGroup>
          )}

          {/* Vegetation Layer */}
          {features && layers.vegetation && (
            <LayerGroup>
              {features.vegetation.map(veg => (
                <Polygon
                  key={veg.id}
                  positions={veg.coordinates.map(c => [c.lat, c.lng])}
                  pathOptions={{
                    color: '#31b237',
                    fillColor: '#31b237',
                    fillOpacity: 0.35,
                    weight: 1.5,
                  }}
                >
                  <Popup>
                    <div className="text-xs font-sans text-navy-900">
                      <p className="font-bold text-sm text-green-700 capitalize">{veg.vegetation_type.replace('_', ' ')}</p>
                      <p className="text-gray-700"><strong>Area:</strong> {formatArea(veg.area)}</p>
                    </div>
                  </Popup>
                </Polygon>
              ))}
            </LayerGroup>
          )}

          {/* Centroid Markers */}
          {features && layers.parcels && (
            <LayerGroup>
              {filteredParcels.map(parcel => (
                <CircleMarker
                  key={`center-${parcel.id}`}
                  center={[parcel.centroid.lat, parcel.centroid.lng]}
                  radius={selectedParcel?.id === parcel.id ? 5 : 3.5}
                  pathOptions={{
                    color: '#ffffff',
                    fillColor: getLandUseColor(parcel.land_use),
                    fillOpacity: 1,
                    weight: 1.5,
                  }}
                  eventHandlers={{
                    click: () => handleSelectParcel(parcel),
                  }}
                />
              ))}
            </LayerGroup>
          )}
        </MapContainer>
      </div>
    </Sidebar>
  );
}
