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
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static z-50 h-full bg-navy-900 border-r border-navy-700/30 transition-all duration-300 flex flex-col
          ${collapsed ? 'w-16' : 'w-60'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className={`p-4 border-b border-navy-700/30 flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-400 to-success-500 flex items-center justify-center">
                <Map className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-sm">UrbanMap AI</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:block p-1 rounded hover:bg-navy-700/50 text-navy-300"
          >
            <ChevronRight className={`w-4 h-4 transition-transform ${collapsed ? '' : 'rotate-180'}`} />
          </button>
        </div>

        <nav className="flex-1 py-4 px-2 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group
                  ${isActive
                    ? 'bg-accent-600/20 text-accent-300 border border-accent-500/20'
                    : 'text-navy-300 hover:bg-navy-700/50 hover:text-white'
                  }
                  ${collapsed ? 'justify-center' : ''}`}
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
            <div className="w-8 h-8 rounded-full bg-navy-700 flex items-center justify-center">
              <User className="w-4 h-4 text-navy-300" />
            </div>
            {!collapsed && (
              <div className="text-xs">
                <p className="font-medium">Survey Admin</p>
                <p className="text-navy-400">admin@urbanmap.ai</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 border-b border-navy-700/30 bg-navy-900/50 backdrop-blur-sm flex items-center px-4 justify-between">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-navy-700/50 text-navy-300"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden lg:flex items-center gap-4 text-sm">
            <Link to="/" className="text-navy-400 hover:text-white transition-colors">
              <Home className="w-4 h-4" />
            </Link>
            {navItems.map((item) => {
              if (location.pathname !== item.path) return null;
              return (
                <span key={item.path} className="flex items-center gap-1 text-navy-300">
                  <ChevronRight className="w-3 h-3" />
                  {item.label}
                </span>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-success-500/10 border border-success-500/20">
              <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
              <span className="text-xs text-success-500 font-medium">System Active</span>
            </div>
            <button className="p-2 rounded-lg hover:bg-navy-700/50 text-navy-300">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
