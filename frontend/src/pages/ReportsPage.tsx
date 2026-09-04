import { useState, useEffect } from 'react';
import {
  FileText, Download, Printer, Calendar, Map, BarChart3,
  CheckCircle2, Building2, Clock, Target, RefreshCw
} from 'lucide-react';
import Sidebar from '../layouts/Sidebar';
import { reportAPI, featureAPI, Statistics } from '../services/api';

export default function ReportsPage() {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [report, setReport] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const [options, setOptions] = useState({
    include_map: true,
    include_statistics: true,
    include_parcels: true,
    include_buildings: true,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await featureAPI.getStatistics();
      setStats(res.data);
    } catch (err) { console.error(err); }
  };

  const generateReport = async () => {
    setGenerating(true);
    await new Promise(r => setTimeout(r, 1500));
    try {
      const res = await reportAPI.generate({
        project_id: 'demo-project-001',
        ...options,
      });
      setReport(res.data);
    } catch (err) { console.error(err); }
    setGenerating(false);
  };

  return (
    <Sidebar>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-sm text-navy-400 mt-1">Generate and download cadastral mapping reports</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card rounded-xl p-6 animate-in">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-accent-400" />
                Report Configuration
              </h2>

              <div className="space-y-4">
                <div className="bg-navy-800/50 rounded-lg p-4">
                  <label className="text-sm font-medium mb-3 block">Report Sections</label>
                  <div className="space-y-3">
{([
                       { key: 'include_map', label: 'Map Preview', desc: 'Interactive map snapshot of detected features' },
                       { key: 'include_statistics', label: 'Statistics & Analytics', desc: 'AI confidence, land use, and coverage analysis' },
                       { key: 'include_parcels', label: 'Parcel Details', desc: 'Individual parcel information and building data' },
                       { key: 'include_buildings', label: 'Building Analysis', desc: 'Detailed building data and floor information' },
                     ] as const).map(({ key, label, desc }) => (
                       <label key={key} className="flex items-start gap-3 cursor-pointer group">
                         <input
                           type="checkbox"
                           checked={options[key]}
                           onChange={e => setOptions(prev => ({ ...prev, [key]: e.target.checked }))}
                           className="mt-1 rounded border-navy-600 bg-navy-800 text-accent-500 focus:ring-accent-500"
                         />
                         <div>
                           <p className="text-sm font-medium group-hover:text-accent-300 transition-colors">{label}</p>
                           <p className="text-xs text-navy-400">{desc}</p>
                         </div>
                       </label>
                     ))}
                  </div>
                </div>

                <button
                  onClick={generateReport}
                  disabled={generating}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-accent-600 hover:bg-accent-500 disabled:bg-navy-700 text-white font-medium transition-all"
                >
                  {generating ? (
                    <><RefreshCw className="w-4 h-4 animate-spin" /> Generating Report...</>
                  ) : (
                    <><FileText className="w-4 h-4" /> Generate Report</>
                  )}
                </button>
              </div>
            </div>

            {report && (
              <div className="glass rounded-xl p-6 animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-success-500" />
                    Report Generated
                  </h2>
                  <div className="flex gap-2">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-800/50 border border-navy-700/30 text-sm hover:bg-navy-700/50 transition-all">
                      <Printer className="w-3.5 h-3.5" /> Print
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-600/20 border border-accent-500/30 text-sm text-accent-300 hover:bg-accent-600/30 transition-all">
                      <Download className="w-3.5 h-3.5" /> Download PDF
                    </button>
                  </div>
                </div>

                <div className="bg-navy-800/50 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-xs text-navy-400">Report ID</p>
                      <p className="font-mono text-sm">{report.report_id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-navy-400">Project</p>
                      <p className="text-sm font-medium">{report.project_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-navy-400">Date</p>
                      <p className="text-sm">{new Date(report.date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-navy-400">Status</p>
                      <p className="text-sm text-success-500 font-medium capitalize">{report.status}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Report Sections</h3>
                  {report.sections.map((section: any) => (
                    <div key={section.name} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className={`w-4 h-4 ${section.included ? 'text-success-500' : 'text-navy-600'}`} />
                      <span className={section.included ? '' : 'text-navy-500'}>{section.name}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-navy-700/30">
                  <h3 className="text-sm font-semibold mb-3">Report Summary</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label: 'Parcels', value: report.summary.total_parcels, icon: Map },
                      { label: 'Buildings', value: report.summary.total_buildings, icon: Building2 },
                      { label: 'Area', value: `${(report.summary.total_mapped_area / 10000).toFixed(1)} ha`, icon: Target },
                      { label: 'Processing', value: `${report.summary.processing_time}s`, icon: Clock },
                    ].map(item => (
                      <div key={item.label} className="bg-navy-900/50 rounded-lg p-3 text-center">
                        <item.icon className="w-4 h-4 text-accent-400 mx-auto mb-1" />
                        <p className="text-lg font-bold">{item.value}</p>
                        <p className="text-xs text-navy-400">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="glass-card rounded-xl p-6 animate-in">
              <h3 className="font-semibold mb-4">Project Summary</h3>
              {stats ? (
                <div className="space-y-3">
                  {[
                    { label: 'Total Parcels', value: stats.total_parcels },
                    { label: 'Total Buildings', value: stats.total_buildings },
                    { label: 'Mapped Area', value: `${(stats.total_mapped_area / 10000).toFixed(1)} ha` },
                    { label: 'Road Length', value: `${(stats.total_road_length / 1000).toFixed(1)} km` },
                    { label: 'Green Area', value: `${(stats.green_area / 10000).toFixed(1)} ha` },
                    { label: 'AI Confidence', value: `${(stats.average_confidence * 100).toFixed(1)}%` },
                    { label: 'Processing Time', value: `${stats.processing_time}s` },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between text-sm">
                      <span className="text-navy-400">{item.label}</span>
                      <span className="font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-navy-400">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
                  <p className="text-sm">Loading...</p>
                </div>
              )}
            </div>

            <div className="glass-card rounded-xl p-6 animate-in">
              <h3 className="font-semibold mb-4">Export Options</h3>
              <div className="space-y-2">
                <button className="w-full flex items-center gap-2 p-3 rounded-lg bg-navy-800/50 border border-navy-700/30 hover:bg-navy-700/50 transition-all text-sm">
                  <Download className="w-4 h-4 text-accent-400" />
                  Download PDF Report
                </button>
                <button className="w-full flex items-center gap-2 p-3 rounded-lg bg-navy-800/50 border border-navy-700/30 hover:bg-navy-700/50 transition-all text-sm">
                  <Download className="w-4 h-4 text-success-500" />
                  Export as GeoJSON
                </button>
                <button className="w-full flex items-center gap-2 p-3 rounded-lg bg-navy-800/50 border border-navy-700/30 hover:bg-navy-700/50 transition-all text-sm">
                  <Download className="w-4 h-4 text-warning-500" />
                  Export as CSV
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
