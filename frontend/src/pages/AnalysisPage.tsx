import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Upload, Cpu, Map, Layers, CheckCircle2, Circle, Loader2,
  Image, FileCheck, BarChart3, Play, ArrowRight, Check
} from 'lucide-react';
import Sidebar from '../layouts/Sidebar';
import { uploadAPI, analysisAPI, AnalysisResponse } from '../services/api';

interface PipelineStage {
  name: string;
  status: 'pending' | 'processing' | 'completed';
  icon: any;
}

const INITIAL_STAGES: PipelineStage[] = [
  { name: 'Image uploaded & validated', status: 'pending', icon: Upload },
  { name: 'Preprocessing & Geo-referencing', status: 'pending', icon: Image },
  { name: 'YOLOv8 Urban Structure Detection', status: 'pending', icon: Cpu },
  { name: 'U-Net Semantic Parcel Segmentation', status: 'pending', icon: Map },
  { name: 'Parcel Boundary & Topology Engine', status: 'pending', icon: Layers },
  { name: 'Cadastral GIS Dataset Generation', status: 'pending', icon: FileCheck },
];

export default function AnalysisPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>(INITIAL_STAGES);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleFile = (selected: File) => {
    setFile(selected);
    if (selected.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(selected));
    } else {
      setPreviewUrl(null);
    }
    const reset = INITIAL_STAGES.map((s, i) =>
      i === 0 ? { ...s, status: 'completed' as const } : { ...s, status: 'pending' as const }
    );
    setPipelineStages(reset);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const executePipeline = async () => {
    setAnalyzing(true);
    setResult(null);

    const stages = INITIAL_STAGES.map(s => ({ ...s }));
    for (let i = 0; i < stages.length; i++) {
      stages[i] = { ...stages[i], status: 'processing' };
      setPipelineStages([...stages]);
      await new Promise(r => setTimeout(r, 450 + Math.random() * 400));
      stages[i] = { ...stages[i], status: 'completed' };
      setPipelineStages([...stages]);
    }

    try {
      if (file) {
        await uploadAPI.upload(file);
      }
      const res = await analysisAPI.analyze();
      setResult(res.data);
    } catch (err) {
      console.error(err);
    }
    setAnalyzing(false);
  };

  const runDemo = async () => {
    setFile(new File(['dummy drone tiff'], 'new_delhi_orthophoto_survey_01.tif', { type: 'image/tiff' }));
    setPreviewUrl(null);
    await executePipeline();
  };

  return (
    <Sidebar>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">AI Analysis Module</h1>
          <p className="text-sm text-navy-400 mt-1">Upload drone imagery and run AI-powered cadastral feature extraction</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="glass rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-accent-400" />
              Upload Drone Imagery
            </h2>

            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
                ${dragActive ? 'border-accent-400 bg-accent-600/10' : 'border-navy-600/50 hover:border-navy-500/50 hover:bg-navy-800/30'}
                ${file ? 'border-success-500/50 bg-success-500/5' : ''}`}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <input
                id="file-input"
                type="file"
                accept=".jpg,.jpeg,.png,.tiff,.tif,.geotiff"
                onChange={handleFileSelect}
                className="hidden"
              />
              {previewUrl ? (
                <div className="space-y-2">
                  <div className="relative rounded-lg overflow-hidden border border-navy-700/50 max-h-40 mx-auto">
                    <img src={previewUrl} alt="Drone imagery preview" className="w-full h-36 object-cover" />
                  </div>
                  <p className="font-medium text-xs truncate max-w-xs mx-auto">{file?.name}</p>
                  <p className="text-xs text-navy-400">{file ? (file.size / 1024 / 1024).toFixed(2) : 0} MB &bull; <span className="text-success-400">Ready</span></p>
                </div>
              ) : file ? (
                <div className="space-y-2">
                  <FileCheck className="w-12 h-12 text-success-500 mx-auto" />
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-navy-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  <p className="text-xs text-success-500">Ready for analysis</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <Upload className="w-12 h-12 text-navy-400 mx-auto" />
                  <div>
                    <p className="font-medium">Drag & drop drone imagery here</p>
                    <p className="text-sm text-navy-400 mt-1">or click to browse files</p>
                  </div>
                  <p className="text-xs text-navy-500">Supports JPG, PNG, TIFF, GeoTIFF (max 50MB)</p>
                </div>
              )}
            </div>

            <div className="mt-4 flex gap-3">
              <button
                onClick={executePipeline}
                disabled={!file || analyzing}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-accent-600 hover:bg-accent-500 disabled:bg-navy-700 disabled:text-navy-400 text-white font-medium transition-all"
              >
                {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                {analyzing ? 'Analyzing...' : 'Start Analysis'}
              </button>
              <button
                onClick={runDemo}
                disabled={analyzing}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-navy-800/50 border border-navy-700/30 hover:bg-navy-700/50 text-white font-medium transition-all disabled:text-navy-400"
              >
                <Cpu className="w-4 h-4" />
                Try Demo
              </button>
            </div>
          </div>

          <div className="glass rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-success-500" />
              Processing Pipeline
            </h2>

            <div className="space-y-3">
              {pipelineStages.map((stage, i) => (
                <div key={i} className="flex items-center gap-3">
                  {stage.status === 'completed' ? (
                    <CheckCircle2 className="w-5 h-5 text-success-500 flex-shrink-0" />
                  ) : stage.status === 'processing' ? (
                    <Loader2 className="w-5 h-5 text-accent-400 animate-spin flex-shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-navy-600 flex-shrink-0" />
                  )}
                  <span className={`text-sm ${stage.status === 'completed' ? 'text-white' : stage.status === 'processing' ? 'text-accent-300 font-medium' : 'text-navy-500'}`}>
                    {stage.name}
                  </span>
                  {stage.status === 'processing' && (
                    <div className="flex-1 h-1.5 bg-navy-800 rounded-full overflow-hidden ml-2">
                      <div className="h-full bg-accent-500 rounded-full animate-pulse" style={{ width: '70%' }} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {result && (
              <div className="mt-6 pt-4 border-t border-navy-700/30">
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-accent-400" />
                  Analysis Results
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-navy-800/50 rounded-lg p-3">
                    <p className="text-xs text-navy-400">Parcels Detected</p>
                    <p className="text-xl font-bold text-accent-400">{result.features_summary.parcels_detected}</p>
                  </div>
                  <div className="bg-navy-800/50 rounded-lg p-3">
                    <p className="text-xs text-navy-400">Buildings Found</p>
                    <p className="text-xl font-bold text-success-500">{result.features_summary.buildings_detected}</p>
                  </div>
                  <div className="bg-navy-800/50 rounded-lg p-3">
                    <p className="text-xs text-navy-400">Roads Mapped</p>
                    <p className="text-xl font-bold text-warning-500">{result.features_summary.roads_detected}</p>
                  </div>
                  <div className="bg-navy-800/50 rounded-lg p-3">
                    <p className="text-xs text-navy-400">Avg Confidence</p>
                    <p className="text-xl font-bold text-emerald-400">{(result.features_summary.average_confidence * 100).toFixed(1)}%</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xs text-navy-400">Processing time: {result.processing_time}s</p>
                  <Link
                    to="/map"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent-600 hover:bg-accent-500 text-white text-xs font-semibold shadow-lg shadow-accent-600/20 transition-all"
                  >
                    View on GIS Map
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 glass rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">AI Architecture Overview</h2>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {[
              'Drone Image', 'Preprocessor', 'Object Detection (YOLO)',
              'Semantic Segmentation (U-Net)', 'Feature Extraction',
              'Polygon Generation', 'Parcel Boundary Engine', 'GIS Processing', 'Cadastral Dataset'
            ].map((step, i, arr) => (
              <div key={i} className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-lg bg-navy-800/50 border border-navy-700/30 text-xs">
                  {step}
                </span>
                {i < arr.length - 1 && <span className="text-navy-500">→</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
