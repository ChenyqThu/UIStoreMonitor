import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Wifi, Activity, BarChart2, Tag, Bell } from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2 text-blue-600">
              <Wifi className="h-8 w-8" />
              <span className="font-bold text-xl tracking-tight text-slate-900">UniFi Monitor</span>
            </Link>
            <div className="hidden md:flex space-x-4">
              <Link
                to="/"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${location.pathname === '/'
                  ? 'border-blue-500 text-gray-900'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
              >
                <Activity className="w-4 h-4 mr-2" />
                Dashboard
              </Link>
              <Link
                to="/deals"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${location.pathname === '/deals'
                  ? 'border-blue-500 text-gray-900'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
              >
                <Tag className="w-4 h-4 mr-2" />
                Deals
              </Link>
              <Link
                to="/alerts"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${location.pathname === '/alerts'
                  ? 'border-blue-500 text-gray-900'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
              >
                <Bell className="w-4 h-4 mr-2" />
                Alerts
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-full border border-slate-100">
              v2.4.0
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
};