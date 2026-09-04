import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polygon, Polyline, CircleMarker, Popup, LayerGroup, ZoomControl } from 'react-leaflet';
import { Layers, Eye, EyeOff, Info, X, Maximize2, Minimize2, RefreshCw } from 'lucide-react';
import Sidebar from '../layouts/Sidebar';
import { featureAPI, Features, Parcel, Building, Road, Vegetation } from '../services/api';
import { getLandUseColor, getLandUseLabel, MAP_CENTER, MAP_ZOOM } from '../utils/helpers';

export default function MapPage() {
  const [features, setFeatures] = useState<Features | null>(null);
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);
  const [layers, setLayers] = useState({
    parcels: true, buildings: true, roads: true, vegetation: true
  });
  const [loading, setLoading] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    loadFeatures();
  }, []);

  const loadFeatures = async () => {
    setLoading(true);
    try {
      const res = await featureAPI.getAll();
      setFeatures(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const toggleLayer = (key: keyof typeof layers) => {
    setLayers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Sidebar>
      <div className={`relative ${fullscreen ? 'fixed inset-0 z-50 bg-navy-950' : 'h-full'}`}>
        <div className="absolute top-4 right-4 z-[1000] flex items-center gap-2">
          <button
            onClick={() => setFullscreen(!fullscreen)}
            className="p-2 rounded-lg glass hover:bg-navy-700/50 transition-colors"
          >
            {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button onClick={loadFeatures} className="p-2 rounded-lg glass hover:bg-navy-700/50 transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="absolute top-4 left-4 z-[1000]">
          <div className="glass rounded-xl p-3 w-56">
            <h3 className="text-xs font-semibold text-navy-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Layers className="w-3 h-3" /> Layer Controls
            </h3>
            <div className="space-y-2">
              {([
                { key: 'parcels' as const, label: 'Parcels', color: '#2186eb' },
                { key: 'buildings' as const, label: 'Buildings', color: '#ff6347' },
                { key: 'roads' as const, label: 'Roads', color: '#f0b429' },
                { key: 'vegetation' as const, label: 'Vegetation', color: '#31b237' },
              ]).map(({ key, label, color }) => (
                <button
                  key={key}
                  onClick={() => toggleLayer(key)}
                  className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg hover:bg-navy-700/50 transition-colors text-sm"
                >
                  <div className="w-4 h-4 rounded border border-navy-600 flex items-center justify-center" style={{ background: layers[key] ? color + '33' : 'transparent' }}>
                    {layers[key] && <div className="w-2 h-2 rounded-sm" style={{ background: color }} />}
                  </div>
                  <span className="flex-1 text-left">{label}</span>
                  {layers[key] ? <Eye className="w-3 h-3 text-navy-400" /> : <EyeOff className="w-3 h-3 text-navy-500" />}
                </button>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-navy-700/30 text-xs text-navy-400">
              {features && (
                <>
                  {features.parcels.length} parcels, {features.buildings.length} buildings
                </>
              )}
            </div>
          </div>
        </div>

        {selectedParcel && (
          <div className="absolute top-4 right-16 z-[1000] w-80">
            <div className="glass rounded-xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{selectedParcel.id}</h3>
                  <p className="text-xs text-navy-400">{getLandUseLabel(selectedParcel.land_use)}</p>
                </div>
                <button onClick={() => setSelectedParcel(null)} className="p-1 rounded hover:bg-navy-700/50">
                  <X className="w-4 h-4 text-navy-400" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-navy-800/50 rounded-lg p-2">
                  <p className="text-xs text-navy-400">Area</p>
                  <p className="font-semibold">{selectedParcel.area.toLocaleString()} m²</p>
                </div>
                <div className="bg-navy-800/50 rounded-lg p-2">
                  <p className="text-xs text-navy-400">Perimeter</p>
                  <p className="font-semibold">{selectedParcel.perimeter.toLocaleString()} m</p>
                </div>
                <div className="bg-navy-800/50 rounded-lg p-2">
                  <p className="text-xs text-navy-400">Buildings</p>
                  <p className="font-semibold">{selectedParcel.buildings}</p>
                </div>
                <div className="bg-navy-800/50 rounded-lg p-2">
                  <p className="text-xs text-navy-400">Coverage</p>
                  <p className="font-semibold">{selectedParcel.building_coverage}%</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 h-2 bg-navy-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${selectedParcel.confidence * 100}%`,
                      background: selectedParcel.confidence >= 0.9 ? '#31b237' : selectedParcel.confidence >= 0.8 ? '#f0b429' : '#ff6347'
                    }}
                  />
                </div>
                <span className="text-xs text-navy-300">{(selectedParcel.confidence * 100).toFixed(1)}% confidence</span>
              </div>
            </div>
          </div>
        )}

        <MapContainer
          center={MAP_CENTER}
          zoom={MAP_ZOOM}
          className="h-full w-full"
          zoomControl={false}
          style={{ background: '#102a43' }}
        >
          <ZoomControl position="bottomright" />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <TileLayer
            attribution='&copy; Esri'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />

          {features && layers.parcels && (
            <LayerGroup>
              {features.parcels.map(parcel => (
                <Polygon
                  key={parcel.id}
                  positions={parcel.coordinates.map(c => [c.lat, c.lng])}
                  pathOptions={{
                    color: getLandUseColor(parcel.land_use),
                    fillColor: getLandUseColor(parcel.land_use),
                    fillOpacity: 0.2,
                    weight: 2,
                  }}
                  eventHandlers={{
                    click: () => setSelectedParcel(parcel),
                  }}
                >
                  <Popup>
                    <div className="text-sm">
                      <strong>{parcel.id}</strong><br />
                      Area: {parcel.area.toLocaleString()} m²<br />
                      Land Use: {getLandUseLabel(parcel.land_use)}<br />
                      Confidence: {(parcel.confidence * 100).toFixed(1)}%
                    </div>
                  </Popup>
                </Polygon>
              ))}
            </LayerGroup>
          )}

          {features && layers.buildings && (
            <LayerGroup>
              {features.buildings.map(building => (
                <Polygon
                  key={building.id}
                  positions={building.coordinates.map(c => [c.lat, c.lng])}
                  pathOptions={{
                    color: '#ff6347',
                    fillColor: '#ff6347',
                    fillOpacity: 0.4,
                    weight: 1,
                  }}
                >
                  <Popup>
                    <div className="text-sm">
                      <strong>{building.id}</strong><br />
                      Area: {building.area.toLocaleString()} m²<br />
                      Floors: {building.floors}<br />
                      Height: {building.height}m
                    </div>
                  </Popup>
                </Polygon>
              ))}
            </LayerGroup>
          )}

          {features && layers.roads && (
            <LayerGroup>
              {features.roads.map(road => (
                <Polyline
                  key={road.id}
                  positions={road.coordinates.map(c => [c.lat, c.lng])}
                  pathOptions={{
                    color: '#f0b429',
                    weight: road.width / 2,
                    opacity: 0.8,
                  }}
                >
                  <Popup>
                    <div className="text-sm">
                      <strong>{road.name}</strong><br />
                      Length: {(road.length / 1000).toFixed(2)} km<br />
                      Width: {road.width}m
                    </div>
                  </Popup>
                </Polyline>
              ))}
            </LayerGroup>
          )}

          {features && layers.vegetation && (
            <LayerGroup>
              {features.vegetation.map(veg => (
                <Polygon
                  key={veg.id}
                  positions={veg.coordinates.map(c => [c.lat, c.lng])}
                  pathOptions={{
                    color: '#31b237',
                    fillColor: '#31b237',
                    fillOpacity: 0.3,
                    weight: 1,
                  }}
                >
                  <Popup>
                    <div className="text-sm">
                      <strong>{veg.vegetation_type}</strong><br />
                      Area: {veg.area.toLocaleString()} m²
                    </div>
                  </Popup>
                </Polygon>
              ))}
            </LayerGroup>
          )}

          {features && layers.parcels && (
            <LayerGroup>
              {features.parcels.map(parcel => (
                <CircleMarker
                  key={`center-${parcel.id}`}
                  center={[parcel.centroid.lat, parcel.centroid.lng]}
                  radius={4}
                  pathOptions={{
                    color: '#fff',
                    fillColor: getLandUseColor(parcel.land_use),
                    fillOpacity: 1,
                    weight: 2,
                  }}
                  eventHandlers={{
                    click: () => setSelectedParcel(parcel),
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
