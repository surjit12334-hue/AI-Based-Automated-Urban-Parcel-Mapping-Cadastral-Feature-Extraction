import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Map, Upload, BarChart3, ArrowRight, Layers, Cpu, Globe,
  Zap, Shield, Target, ChevronDown, Play
} from 'lucide-react';

function AnimatedCounter({ end, duration = 2000, suffix = '' }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);
  return <span>{count.toLocaleString()}{suffix}</span>;
}

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const heroOpacity = Math.max(0, 1 - scrollY / 800);
  const heroTranslate = scrollY * 0.3;

  return (
    <div className="min-h-screen bg-navy-950 overflow-hidden bg-gradient-mesh bg-grid">
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrollY > 50 ? 'glass shadow-lg shadow-navy-900/50' : 'bg-navy-950/80 backdrop-blur-md'}`}>
        <div className="nav-gradient-line"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent-400 to-success-500 flex items-center justify-center">
                <Map className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg">UrbanMap AI</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm text-navy-300 hover:text-white transition-colors">Features</a>
              <a href="#workflow" className="text-sm text-navy-300 hover:text-white transition-colors">Workflow</a>
              <a href="#tech" className="text-sm text-navy-300 hover:text-white transition-colors">Technology</a>
              <Link to="/dashboard" className="text-sm text-navy-300 hover:text-white transition-colors">Dashboard</Link>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/dashboard"
                className="px-4 py-2 rounded-lg bg-accent-600 hover:bg-accent-500 text-white text-sm font-medium transition-all hover:shadow-lg hover:shadow-accent-600/25"
              >
                Open Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-accent-600/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-success-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-navy-700/20 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-navy-700/10 rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ opacity: heroOpacity, transform: `translateY(${heroTranslate}px)` }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-600/10 border border-accent-500/20 mb-8 animate-scale-in">
              <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
              <span className="text-sm text-accent-300">AI-Powered Cadastral Intelligence Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight mb-6 animate-fade-in">
              Transform Drone Imagery into
              <br />
              <span className="gradient-text">Intelligent Urban Maps</span>
            </h1>

            <p className="text-lg sm:text-xl text-navy-300 max-w-3xl mx-auto mb-10 leading-relaxed animate-fade-in delay-200">
              AI-powered cadastral mapping that automatically detects parcels, buildings, roads
              and urban features from high-resolution drone imagery.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in delay-300">
              <Link
                to="/map"
                className="group flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-400 text-white font-semibold text-lg transition-all hover:shadow-xl hover:shadow-accent-600/30 hover:-translate-y-0.5 glow-accent"
              >
                <Upload className="w-5 h-5" />
                Upload Dataset
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-8 py-4 rounded-xl bg-navy-800/50 hover:bg-navy-700/50 border border-navy-600/30 text-white font-semibold text-lg transition-all hover:-translate-y-0.5 btn-secondary"
              >
                <Play className="w-5 h-5" />
                Explore Demo
              </Link>
            </div>
          </div>

          <div className="mt-20 relative animate-slide-in-right delay-500">
            <div className="glass rounded-2xl p-1 max-w-5xl mx-auto">
              <div className="bg-navy-900 rounded-xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-navy-700/30">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/70" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                    <div className="w-3 h-3 rounded-full bg-green-500/70" />
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-xs text-navy-400">UrbanMap AI - Cadastral Intelligence Dashboard</span>
                  </div>
                </div>
                <div className="p-6 grid grid-cols-3 gap-4">
                  <div className="bg-navy-800/50 rounded-lg p-4 border border-navy-700/30">
                    <div className="text-xs text-navy-400 mb-2">Detected Parcels</div>
                    <div className="text-2xl font-bold text-accent-400">
                      <AnimatedCounter end={247} />
                    </div>
                    <div className="mt-2 h-1.5 bg-navy-700 rounded-full overflow-hidden">
                      <div className="h-full w-4/5 bg-gradient-to-r from-accent-500 to-success-500 rounded-full" />
                    </div>
                  </div>
                  <div className="bg-navy-800/50 rounded-lg p-4 border border-navy-700/30">
                    <div className="text-xs text-navy-400 mb-2">Building Coverage</div>
                    <div className="text-2xl font-bold text-success-500">
                      <AnimatedCounter end={68} suffix="%" />
                    </div>
                    <div className="mt-2 h-1.5 bg-navy-700 rounded-full overflow-hidden">
                      <div className="h-full w-3/5 bg-gradient-to-r from-success-500 to-success-700 rounded-full" />
                    </div>
                  </div>
                  <div className="bg-navy-800/50 rounded-lg p-4 border border-navy-700/30">
                    <div className="text-xs text-navy-400 mb-2">AI Confidence</div>
                    <div className="text-2xl font-bold text-warning-500">
                      <AnimatedCounter end={94} suffix="%" />
                    </div>
                    <div className="mt-2 h-1.5 bg-navy-700 rounded-full overflow-hidden">
                      <div className="h-full w-[94%] bg-gradient-to-r from-warning-500 to-warning-700 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-6 h-6 text-navy-400" />
        </div>
      </section>

      <section id="stats" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-navy-800/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent-600/3 to-transparent opacity-30"></div>
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 relative">
          {[
            { label: 'Parcels Mapped', value: 247, suffix: '+' },
            { label: 'Area Surveyed', value: 2.4, suffix: ' km²' },
            { label: 'Buildings Detected', value: 189, suffix: '' },
            { label: 'Detection Accuracy', value: 94, suffix: '%' },
          ].map((stat, i) => (
            <div key={stat.label} className="text-center group animate-in delay-100" style={{ animationDelay: `${0.3 + i * 0.15}s` }}>
              <div className="relative inline-block">
                <div className="text-3xl sm:text-4xl font-bold gradient-text mb-2 group-hover:scale-110 transition-transform duration-300">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <div className="absolute -inset-2 bg-gradient-to-r from-accent-500/20 to-success-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              <div className="text-sm text-navy-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Powered by <span className="gradient-text">AI & GIS Technology</span>
            </h2>
            <p className="text-navy-300 max-w-2xl mx-auto">
              Our platform combines cutting-edge computer vision, deep learning, and geospatial intelligence
              to automate cadastral mapping from drone imagery.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Cpu,
                title: 'AI Object Detection',
                desc: 'YOLO-based detection identifies buildings, roads, vehicles, and urban structures with high accuracy.',
              },
              {
                icon: Layers,
                title: 'Semantic Segmentation',
                desc: 'U-Net architecture segments land parcels, vegetation, water bodies, and built-up areas pixel by pixel.',
              },
              {
                icon: Target,
                title: 'Boundary Extraction',
                desc: 'Automated parcel boundary detection using road networks, structures, and image geometry analysis.',
              },
              {
                icon: Globe,
                title: 'GIS Integration',
                desc: 'Full geospatial processing with GeoPandas, Shapely, and Rasterio for coordinate-accurate mapping.',
              },
              {
                icon: Zap,
                title: 'Real-time Processing',
                desc: 'Optimized AI pipeline processes drone imagery and generates cadastral maps in minutes.',
              },
              {
                icon: Shield,
                title: 'Export & Reporting',
                desc: 'Export to GeoJSON, KML, CSV, and generate comprehensive cadastral mapping reports.',
              },
            ].map((feature, i) => (
              <div
                key={feature.title}
                className="group glass-card rounded-xl p-6 hover:border-accent-500/30 transition-all duration-500 hover:-translate-y-1 animate-in delay-100"
                style={{ animationDelay: `${0.1 + i * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-lg bg-accent-600/10 flex items-center justify-center mb-4 group-hover:bg-accent-600/20 group-hover:scale-110 transition-all duration-300">
                  <feature.icon className="w-6 h-6 text-accent-400 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-accent-300 transition-colors">{feature.title}</h3>
                <p className="text-sm text-navy-300 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="workflow" className="py-20 px-4 sm:px-6 lg:px-8 bg-navy-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Simple <span className="gradient-text">Workflow</span>
            </h2>
            <p className="text-navy-300 max-w-2xl mx-auto">
              Upload drone imagery, let our AI analyze the area, and receive an intelligent cadastral map
              with parcel boundaries, buildings, and urban features.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Upload', desc: 'Upload drone imagery of the urban area', icon: Upload },
              { step: '02', title: 'Analyze', desc: 'AI detects buildings, roads, and parcels', icon: Cpu },
              { step: '03', title: 'Visualize', desc: 'Interactive cadastral map with layer controls', icon: Map },
              { step: '04', title: 'Export', desc: 'Download GeoJSON, KML, CSV, and reports', icon: BarChart3 },
            ].map((item, i) => (
              <div key={item.step} className="relative group animate-in delay-100" style={{ animationDelay: `${0.2 + i * 0.15}s` }}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-600 to-accent-500 flex items-center justify-center font-bold text-lg group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-accent-600/30 transition-all duration-300">
                    {item.step}
                  </div>
                  {i < 3 && (
                    <div className="hidden md:block flex-1 h-px bg-gradient-to-r from-accent-500/50 to-transparent" />
                  )}
                </div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-accent-300 transition-colors">{item.title}</h3>
                <p className="text-sm text-navy-300">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="tech" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Built with <span className="gradient-text">Modern Technology</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'React', desc: 'Frontend' },
              { name: 'Python', desc: 'Backend' },
              { name: 'FastAPI', desc: 'API Server' },
              { name: 'PyTorch', desc: 'AI Framework' },
              { name: 'Leaflet', desc: 'GIS Mapping' },
              { name: 'OpenCV', desc: 'Vision' },
              { name: 'PostGIS', desc: 'Spatial DB' },
              { name: 'Tailwind', desc: 'UI Styling' },
            ].map((tech, i) => (
              <div
                key={tech.name}
                className="glass-card-sm rounded-xl p-5 text-center hover:border-accent-500/30 transition-all duration-300 animate-in delay-100 hover:-translate-y-1"
                style={{ animationDelay: `${0.1 + i * 0.08}s` }}
              >
                <div className="font-semibold text-sm md:text-base group-hover:text-accent-300 transition-colors">{tech.name}</div>
                <div className="text-xs text-navy-400 mt-1">{tech.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-navy-900/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-mesh"></div>
        <div className="max-w-4xl mx-auto text-center relative animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-600/10 border border-accent-500/20 mb-8">
            <div className="glow-dot"></div>
            <span className="text-sm text-accent-300">Get Started Today</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Ready to Map <span className="gradient-text">Smarter Cities</span>?
          </h2>
          <p className="text-navy-300 mb-8 max-w-2xl mx-auto text-lg">
            Experience the power of AI-driven cadastral mapping. Upload drone imagery and let our
            system generate intelligent urban maps automatically.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/map"
              className="group flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-accent-600 to-accent-500 text-white font-semibold text-lg transition-all hover:shadow-xl hover:shadow-accent-600/30 hover:-translate-y-0.5 btn-primary"
            >
              <Map className="w-5 h-5" />
              Start Mapping
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-8 py-4 rounded-xl bg-navy-800/50 border border-navy-600/30 text-white font-semibold text-lg transition-all hover:border-accent-500/30 hover:-translate-y-0.5 btn-secondary"
            >
              <BarChart3 className="w-5 h-5" />
              View Dashboard
            </Link>
          </div>
        </div>
      </section>

      <footer className="py-10 px-4 sm:px-6 lg:px-8 border-t border-navy-800/30 footer-gradient">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-400 to-success-500 flex items-center justify-center shadow-lg shadow-accent-600/20">
              <Map className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm">UrbanMap AI</span>
          </div>
          <div className="text-xs text-navy-400">
            AI-Based Automated Urban Parcel Mapping &amp; Cadastral Feature Extraction
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse"></div>
              <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <span className="text-xs text-navy-500">All systems operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
