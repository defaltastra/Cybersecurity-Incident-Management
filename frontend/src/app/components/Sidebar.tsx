import { Link, useLocation } from 'react-router';
import { Shield, LayoutDashboard, AlertTriangle, FileText, Settings, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/incidents', icon: AlertTriangle, label: 'Incidents' },
    { path: '/report', icon: FileText, label: 'Report Incident' },
    { path: '/settings', icon: Settings, label: 'Settings' },
    ...(user?.role === 'Admin' ? [{ path: '/users', icon: Users, label: 'User Management' }] : []),
  ];

  return (
    <div className="w-64 h-screen bg-[#32302F] border-r border-[#504945] flex flex-col">
      {/* Logo/Header */}
      <div className="p-6 border-b border-[#504945]">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-[#B8BB26]" />
          <div>
            <h1 className="text-[#EBDBB2] text-lg">CyberSec</h1>
            <p className="text-[#D5C4A1] text-xs">Incident Manager</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded transition-colors ${
                    isActive
                      ? 'bg-[#B8BB26] text-[#282828]'
                      : 'text-[#D5C4A1] hover:bg-[#3C3836] hover:text-[#EBDBB2]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[#504945]">
        <div className="text-[#D5C4A1] text-xs">
          <p>Version 1.0.0</p>
          <p className="mt-1">© 2026 CyberSec</p>
        </div>
      </div>
    </div>
  );
}
