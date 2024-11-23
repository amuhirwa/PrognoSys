import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Brain,
  Database,
  Settings,
  LogOut,
  Shield
} from 'lucide-react';

const AdminSidebar = () => {
  const location = useLocation();
  
  const menuItems = [
    {
      title: 'Dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      path: '/admin'
    },
    {
      title: 'User Management',
      icon: <Users className="h-5 w-5" />,
      path: '/admin/users'
    },
    {
      title: 'Model Management',
      icon: <Brain className="h-5 w-5" />,
      path: '/admin/models'
    },
    {
      title: 'Resources',
      icon: <Database className="h-5 w-5" />,
      path: '/admin/resources'
    },
    {
      title: 'Settings',
      icon: <Settings className="h-5 w-5" />,
      path: '/admin/settings'
    }
  ];

  return (
    <div className="flex flex-col w-64 bg-white border-r min-h-screen">
      <div className="flex items-center gap-2 p-6 border-b">
        <div className="bg-blue-600 text-white w-8 h-8 rounded-xl flex items-center justify-center text-xl font-bold">
          P
        </div>
        <div>
          <span className="text-xl font-bold">PrognoSys</span>
          <div className="flex items-center text-sm text-gray-500">
            <Shield className="h-3 w-3 mr-1" />
            Admin Panel
          </div>
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={cn(
                  "flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all duration-200",
                  location.pathname === item.path
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                {item.icon}
                <span>{item.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t">
        <button className="flex items-center space-x-3 px-4 py-2.5 w-full rounded-lg text-red-600 hover:bg-red-50 transition-colors duration-200">
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar; 