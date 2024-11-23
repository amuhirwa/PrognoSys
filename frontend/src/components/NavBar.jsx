import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Search,
  Settings,
  User,
  BarChart3,
  Activity,
  Calendar,
  Users,
  AlertTriangle,
  FileText,
  Heart,
  Clock,
  Pill,
  Clipboard,
  Hospital,
  UserCog,
  Database,
  Shield,
  LogOut,
  UserCircle,
  Mail,
  Lock,
  HelpCircle,
  Bell,
  BellOff,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import createAxiosInstance from '@/utils/axios';
import { useSelector, useDispatch } from 'react-redux';
import { useNotifications } from '@/contexts/NotificationContext';
import { resetStateToDefault } from '@/utils/SharedData';
import { useNavigate } from 'react-router-dom';

const NavBar = ({ userType }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState(null);
  const selector = useSelector(state => state.sharedData.usersLogin)

  const handleLogout = () => {
    dispatch(resetStateToDefault());
    navigate('/login');
  }

  useEffect(() => {
    console.log(selector)
    const fetchUserInfo = async () => {
      try {
        const instance = createAxiosInstance();
        const response = await instance.get('user-info/');
        setUserInfo(response.data);
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    fetchUserInfo();
  }, []);

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-blue-600">PrognoSys</span>
            <span className="ml-2 text-sm text-gray-500">{userType} Portal</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative hidden sm:flex">
              <input
                type="text"
                placeholder="Search..."
                className="w-64 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            
            {/* Notifications Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {notifications.some(n => n.unread) && (
                    <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80" align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold">Notifications</h4>
                    <Badge variant="secondary" className="ml-auto">
                      {unreadCount} new
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.map((notification) => (
                  <DropdownMenuItem 
                    key={notification.id} 
                    className="flex flex-col items-start p-4 space-y-1"
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-center w-full">
                      <span className="font-medium">{notification.message}</span>
                      {!notification.seen && (
                        <span className="ml-auto text-xs text-blue-600">New</span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(notification.created).toLocaleString()}
                    </span>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="w-full flex justify-center text-sm"
                  onClick={markAllAsRead}
                >
                  Mark all as read
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Settings Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Settings</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <UserCog className="mr-2 h-4 w-4" /> Account Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Lock className="mr-2 h-4 w-4" /> Privacy & Security
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Bell className="mr-2 h-4 w-4" /> Notifications
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <HelpCircle className="mr-2 h-4 w-4" /> Help & Support
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Account Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="font-medium leading-none">{userInfo?.name}</p>
                    <p className="text-sm leading-none text-muted-foreground">
                      {userInfo?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <UserCircle className="mr-2 h-4 w-4" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Mail className="mr-2 h-4 w-4" /> Messages
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600 cursor-pointer" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;