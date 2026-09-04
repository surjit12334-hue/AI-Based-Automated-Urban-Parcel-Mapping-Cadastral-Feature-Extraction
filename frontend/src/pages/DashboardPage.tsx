import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3, Map, Building2, TreePine, Route, Clock,
  Target, Upload, ArrowRight, RefreshCw, TrendingUp, Eye
} from 'lucide-react';
import Sidebar from '../layouts/Sidebar';
import { featureAPI, Statistics } from '../services/api';
import { formatArea, formatNumber } from '../utils/helpers';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';

const COLORS = ['#2186eb', '#f0b429', '#ff6347', '#31b237', '#829ab1'];

function StatCard({ icon: Icon, label, value, color, subtext }: {
  icon: any; label: string; value: string; color: string; subtext?: string;
}) {
  return (
    <div className="glass-card rounded-xl p-5 hover:border-accent-500/30 transition-all duration-300 group hover:-translate-y-1 hover:glow-accent">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-navy-400 uppercase tracking-wider mb-1">{label}</p>
          <p className="text-2xl font-bold text-white group-hover:text-accent-300 transition-colors">{value}</p>
          {subtext && <p className="text-xs text-navy-400 mt-1">{subtext}</p>}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const res = await featureAPI.getStatistics();
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const landUseData = stats ? Object.entries(stats.land_use_distribution).map(([key, val]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' '),
    value: val,
  })) : [];

  const confidenceData = stats ? Object.entries(stats.confidence_distribution).map(([key, val]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: val,
  })) : [];

  const buildingData = stats ? Object.entries(stats.building_size_distribution).map(([key, val]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    count: val,
  })) : [];

  const areaData = [
    { name: 'Parcels', value: stats?.total_mapped_area ? stats.total_mapped_area / 10000 : 0 },
    { name: 'Roads', value: stats?.road_coverage ? stats.road_coverage / 10000 : 0 },
    { name: 'Green', value: stats?.green_area ? stats.green_area / 10000 : 0 },
  ];

  return (
    <Sidebar>
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-sm text-navy-400 mt-1">Overview of your cadastral mapping project</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={loadStats} className="p-2 rounded-lg bg-navy-800/50 border border-navy-700/30 text-navy-300 hover:text-white transition-colors">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <Link to="/map" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-600 hover:bg-accent-500 text-white text-sm font-medium transition-all">
              <Map className="w-4 h-4" />
              View Map
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
            {[
              { icon: Map, label: "Total Parcels", value: stats?.total_parcels?.toString() || '0', color: "bg-accent-600" },
              { icon: Building2, label: "Buildings", value: stats?.total_buildings?.toString() || '0', color: "bg-success-700" },
              { icon: Target, label: "Mapped Area", value: stats?.total_mapped_area ? formatArea(stats.total_mapped_area) : '0', color: "bg-accent-500" },
              { icon: Route, label: "Road Length", value: stats?.total_road_length ? `${(stats.total_road_length / 1000).toFixed(1)} km` : '0', color: "bg-warning-500" },
              { icon: Target, label: "AI Accuracy", value: stats?.average_confidence ? `${(stats.average_confidence * 100).toFixed(0)}%` : '0%', color: "bg-success-500" },
              { icon: Clock, label: "Processing", value: stats?.processing_time ? `${stats.processing_time}s` : '0s', color: "bg-navy-600" },
            ].map((card, i) => (
              <div key={card.label} className="animate-in delay-100" style={{ animationDelay: `${0.1 + i * 0.08}s` }}>
                <StatCard {...card} />
              </div>
            ))}
          </div>

<div className="grid lg:grid-cols-2 gap-6 mb-6">
            <div className="glass-card rounded-xl p-6 animate-in delay-100">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-accent-400" />
                Land Use Distribution
              </h3>
              {loading ? (
                <div className="h-64 flex items-center justify-center">
                  <RefreshCw className="w-6 h-6 text-navy-400 animate-spin" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={landUseData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {landUseData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#102a43', border: '1px solid #334e68', borderRadius: '8px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
              <div className="flex flex-wrap gap-3 mt-2">
                {landUseData.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-navy-300">{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-xl p-6 animate-in delay-200">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-success-500" />
                Detection Confidence
              </h3>
              {loading ? (
                <div className="h-64 flex items-center justify-center">
                  <RefreshCw className="w-6 h-6 text-navy-400 animate-spin" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={confidenceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334e68" />
                    <XAxis dataKey="name" stroke="#627d98" fontSize={12} />
                    <YAxis stroke="#627d98" fontSize={12} />
                    <Tooltip
                      contentStyle={{ background: '#102a43', border: '1px solid #334e68', borderRadius: '8px' }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {confidenceData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
<div className="glass-card rounded-xl p-6 animate-in delay-300">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-accent-400" />
                Building Size Distribution
              </h3>
              {loading ? (
                <div className="h-48 flex items-center justify-center">
                  <RefreshCw className="w-6 h-6 text-navy-400 animate-spin" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={buildingData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334e68" />
                    <XAxis dataKey="name" stroke="#627d98" fontSize={12} />
                    <YAxis stroke="#627d98" fontSize={12} />
                    <Tooltip
                      contentStyle={{ background: '#102a43', border: '1px solid #334e68', borderRadius: '8px' }}
                    />
                    <Bar dataKey="count" fill="#2186eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="glass-card rounded-xl p-6 animate-in delay-400">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Eye className="w-4 h-4 text-warning-500" />
                Area Coverage
              </h3>
              {loading ? (
                <div className="h-48 flex items-center justify-center">
                  <RefreshCw className="w-6 h-6 text-navy-400 animate-spin" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={areaData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334e68" />
                    <XAxis dataKey="name" stroke="#627d98" fontSize={12} />
                    <YAxis stroke="#627d98" fontSize={12} />
                    <Tooltip
                      contentStyle={{ background: '#102a43', border: '1px solid #334e68', borderRadius: '8px' }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#2186eb" fill="#2186eb33" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="glass-card rounded-xl p-6 animate-in delay-500">
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link to="/map" className="flex items-center gap-3 p-3 rounded-lg bg-navy-800/50 hover:bg-navy-700/50 border border-navy-700/30 transition-all group hover:border-accent-500/30">
                  <Map className="w-5 h-5 text-accent-400 group-hover:scale-110 transition-transform" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Interactive Map</p>
                    <p className="text-xs text-navy-400">Explore detected features</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-navy-400 group-hover:text-accent-400 group-hover:translate-x-1 transition-all" />
                </Link>
                <Link to="/analysis" className="flex items-center gap-3 p-3 rounded-lg bg-navy-800/50 hover:bg-navy-700/50 border border-navy-700/30 transition-all group hover:border-success-500/30">
                  <BarChart3 className="w-5 h-5 text-success-500 group-hover:scale-110 transition-transform" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">AI Analysis</p>
                    <p className="text-xs text-navy-400">Run detection pipeline</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-navy-400 group-hover:text-success-500 group-hover:translate-x-1 transition-all" />
                </Link>
                <Link to="/export" className="flex items-center gap-3 p-3 rounded-lg bg-navy-800/50 hover:bg-navy-700/50 border border-navy-700/30 transition-all group hover:border-warning-500/30">
                  <Upload className="w-5 h-5 text-warning-500 group-hover:scale-110 transition-transform" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Export Data</p>
                    <p className="text-xs text-navy-400">Download GIS formats</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-navy-400 group-hover:text-warning-500 group-hover:translate-x-1 transition-all" />
                </Link>
                <Link to="/reports" className="flex items-center gap-3 p-3 rounded-lg bg-navy-800/50 hover:bg-navy-700/50 border border-navy-700/30 transition-all group hover:border-accent-300/30">
                  <TreePine className="w-5 h-5 text-accent-300 group-hover:scale-110 transition-transform" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Generate Report</p>
                    <p className="text-xs text-navy-400">Create cadastral report</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-navy-400 group-hover:text-accent-300 group-hover:translate-x-1 transition-all" />
                </Link>
              </div>
            </div>
        </div>
      </div>
    </Sidebar>
  );
}
