import { useState } from 'react';
import {
  Download, FileJson, FileSpreadsheet, Globe, Copy,
  CheckCircle2, RefreshCw, ExternalLink
} from 'lucide-react';
import Sidebar from '../layouts/Sidebar';
import { exportAPI } from '../services/api';

type ExportFormat = 'geojson' | 'csv' | 'kml';

const FORMATS: { id: ExportFormat; label: string; icon: any; color: string; desc: string }[] = [
  { id: 'geojson', label: 'GeoJSON', icon: FileJson, color: 'text-accent-400', desc: 'Standard format for GIS applications and web maps' },
  { id: 'csv', label: 'CSV', icon: FileSpreadsheet, color: 'text-success-500', desc: 'Spreadsheet-compatible tabular data format' },
  { id: 'kml', label: 'KML', icon: Globe, color: 'text-warning-500', desc: 'Keyhole Markup Language for Google Earth' },
];

export default function ExportPage() {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('geojson');
  const [exportData, setExportData] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    setExportData('');
    try {
      let res;
      switch (selectedFormat) {
        case 'geojson': res = await exportAPI.geojson(); break;
        case 'csv': res = await exportAPI.csv(); break;
        case 'kml': res = await exportAPI.kml(); break;
      }
      setExportData(res?.data.data || '');
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(exportData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const extensions: Record<ExportFormat, string> = { geojson: 'geojson', csv: 'csv', kml: 'kml' };
    const mimeTypes: Record<ExportFormat, string> = { geojson: 'application/json', csv: 'text/csv', kml: 'application/vnd.google-earth.kml+xml' };
    const blob = new Blob([exportData], { type: mimeTypes[selectedFormat] });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cadastral-export.${extensions[selectedFormat]}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Sidebar>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Export Data</h1>
          <p className="text-sm text-navy-400 mt-1">Export your GIS data in various formats</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-card rounded-xl p-6 animate-in">
              <h2 className="text-lg font-semibold mb-4">Export Format</h2>
              <div className="space-y-3">
                {FORMATS.map(fmt => (
                  <button
                    key={fmt.id}
                    onClick={() => { setSelectedFormat(fmt.id); setExportData(''); }}
                    className={`w-full flex items-start gap-3 p-4 rounded-xl border transition-all text-left
                      ${selectedFormat === fmt.id
                        ? 'bg-accent-600/10 border-accent-500/30'
                        : 'bg-navy-800/30 border-navy-700/30 hover:border-navy-600/50'}`}
                  >
                    <fmt.icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${fmt.color}`} />
                    <div>
                      <p className="font-medium text-sm">{fmt.label}</p>
                      <p className="text-xs text-navy-400 mt-0.5">{fmt.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleExport}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-accent-600 hover:bg-accent-500 disabled:bg-navy-700 text-white font-medium transition-all"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {loading ? 'Exporting...' : 'Generate Export'}
            </button>
          </div>

          <div className="lg:col-span-2">
            <div className="glass rounded-xl h-full flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-navy-700/30">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm">Export Preview</h3>
                  {exportData && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-success-500/10 text-success-500 border border-success-500/20">
                      {(exportData.length / 1024).toFixed(1)} KB
                    </span>
                  )}
                </div>
                {exportData && (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-800/50 border border-navy-700/30 text-sm hover:bg-navy-700/50 transition-all"
                    >
                      {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-success-500" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                    <button
                      onClick={handleDownload}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-600/20 border border-accent-500/30 text-sm text-accent-300 hover:bg-accent-600/30 transition-all"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </button>
                  </div>
                )}
              </div>

              <div className="flex-1 p-4 overflow-auto max-h-[600px]">
                {exportData ? (
                  <pre className="text-xs text-navy-200 font-mono whitespace-pre-wrap break-all leading-relaxed">
                    {exportData}
                  </pre>
                ) : (
                  <div className="h-full flex items-center justify-center text-navy-500">
                    <div className="text-center">
                      <FileJson className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">Select a format and click "Generate Export"</p>
                      <p className="text-xs mt-1">Preview will appear here</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
