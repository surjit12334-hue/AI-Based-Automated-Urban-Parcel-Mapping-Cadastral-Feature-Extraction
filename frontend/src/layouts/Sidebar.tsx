import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Map, BarChart3, FileText, Download, Upload,
  Menu, X, Home, Settings, User, ChevronRight
} from 'lucide-react';

interface SidebarProps {
  children: React.ReactNode;
}

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/map', icon: Map, label: 'GIS Map' },
  { path: '/analysis', icon: BarChart3, label: 'AI Analysis' },
  { path: '/reports', icon: FileText, label: 'Reports' },
  { path: '/export', icon: Download, label: 'Export Data' },
];

export default function Sidebar({ children }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex h-screen bg-navy-950">
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static z-50 h-full bg-navy-900/95 backdrop-blur-xl border-r border-navy-700/30 transition-all duration-500 ease-in-out flex flex-col
          ${collapsed ? 'w-16' : 'w-64'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="sidebar-glow">
          <div className={`p-4 border-b border-navy-700/30 flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
            {!collapsed && (
              <div className="flex items-center gap-3 group">
                <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-accent-400 to-success-500 flex items-center justify-center shadow-lg shadow-accent-600/20 group-hover:shadow-accent-600/40 transition-shadow">
                  <Map className="w-5 h-5 text-white" />
                  <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-success-500 rounded-full border-2 border-navy-900 animate-pulse"></div>
                </div>
                <span className="font-bold text-sm bg-gradient-to-r from-accent-300 to-success-400 bg-clip-text text-transparent">UrbanMap AI</span>
              </div>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:block p-1 rounded-lg hover:bg-navy-700/50 text-navy-400 hover:text-accent-400 transition-colors"
            >
              <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${collapsed ? '' : 'rotate-180'}`} />
            </button>
          </div>
        </div>

        <nav className="flex-1 py-4 px-2 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-accent-400' : 'text-navy-400 group-hover:text-accent-400'}`} />
                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className={`p-4 border-t border-navy-700/30 ${collapsed ? 'px-2' : ''}`}>
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-600/30 to-success-500/30 flex items-center justify-center ring-2 ring-navy-700/50">
                <User className="w-4 h-4 text-accent-300" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success-500 rounded-full border-2 border-navy-900"></div>
            </div>
            {!collapsed && (
              <div className="text-xs">
                <p className="font-medium text-white">Survey Admin</p>
                <p className="text-navy-400 truncate">admin@urbanmap.ai</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 border-b border-navy-700/30 bg-navy-900/70 backdrop-blur-xl flex items-center px-4 justify-between relative">
          <div className="nav-gradient-line"></div>
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-navy-700/50 text-navy-300 hover:text-white transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden lg:flex items-center gap-4 text-sm">
            <Link to="/" className="text-navy-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-navy-700/50">
              <Home className="w-4 h-4" />
            </Link>
            {navItems.map((item) => {
              if (location.pathname !== item.path) return null;
              return (
                <span key={item.path} className="flex items-center gap-1 text-accent-300">
                  <ChevronRight className="w-3 h-3" />
                  {item.label}
                </span>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-success-500/10 border border-success-500/20 hover:bg-success-500/20 transition-colors cursor-default">
              <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse"></div>
              <span className="text-xs text-success-500 font-medium">System Active</span>
            </div>
            <button className="p-2 rounded-lg hover:bg-navy-700/50 text-navy-400 hover:text-white transition-colors">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-navy-950">
          {children}
        </main>
      </div>
    </div>
  );
}
