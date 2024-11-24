import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Database,
  Brain,
  BarChart2,
  RefreshCw,
  Search,
  Plus,
  ArrowUpRight,
  Building2,
  DoorClosed
} from 'lucide-react';
import { api } from "@/utils/axios";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import AddUserModal from './AddUserModal';
import toast from 'react-hot-toast';
import AddRoomModal from './AddRoomModal';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentRooms, setRecentRooms] = useState([]);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchRecentUsers();
    fetchRecentRooms();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api().get('admin/stats/');
      setStats(response.data);
    } catch (error) {
      toast.error("Failed to fetch system statistics")
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentUsers = async () => {
    try {
      const response = await api().get('admin/users/', {
        params: { limit: 5 }
      });
      setRecentUsers(response.data.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch recent users:', error);
    }
  };

  const fetchRecentRooms = async () => {
    try {
      const response = await api().get('rooms/', {
        params: { limit: 5 }
      });
      setRecentRooms(response.data.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch recent rooms:', error);
    }
  };

  const handleAddUser = async (userData) => {
    try {
      await api().post('admin/users/', userData);
      toast.success("User added successfully")
      setIsAddUserModalOpen(false);
      fetchRecentUsers();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add user")
    }
  };

  const handleAddRoom = async (roomData) => {
    try {
      await api().post('rooms/', roomData);
      toast.success("Room added successfully")
      setIsAddRoomModalOpen(false);
      fetchRecentRooms();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add room")
    }
  };

  const handleRetrainModel = async () => {
    try {
      await api().post('admin/model/retrain/');
      toast.success("Model retraining initiated successfully")
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to initiate model retraining")
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-2 md:space-y-8 md:p-8 md:pt-6 max-w-full overflow-x-hidden">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500">System overview and management</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* User Stats */}
        <Card className="bg-white border-none hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Users className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.users.total}</div>
            <p className="text-sm text-green-600 flex items-center mt-1">
              <span className="text-gray-500 ml-1">Currently active</span>
            </p>
          </CardContent>
        </Card>

        {/* Room Stats */}
        <Card className="bg-white border-none hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rooms
            </CardTitle>
            <div className="p-2 bg-purple-50 rounded-lg">
              <Building2 className="h-4 w-4 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.rooms?.total || 0}</div>
            <p className="text-sm text-green-600 flex items-center mt-1">
              <span className="text-gray-500 ml-1">Currently occupied</span>
            </p>
          </CardContent>
        </Card>

        {/* Model Performance */}
        <Card className="bg-white border-none hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Model Accuracy
            </CardTitle>
            <div className="p-2 bg-green-50 rounded-lg">
              <Brain className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.model_performance.accuracy}%
            </div>
            <p className="text-sm text-green-600 flex items-center mt-1">
              <span className="flex items-center">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                +2.5%
              </span>
              <span className="text-gray-500 ml-1">from last version</span>
            </p>
          </CardContent>
        </Card>

        {/* Actions Card */}
        <Card className="bg-white border-none hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Quick Actions
            </CardTitle>
            <div className="p-2 bg-yellow-50 rounded-lg">
              <BarChart2 className="h-4 w-4 text-yellow-500" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start hover:bg-gray-100"
              onClick={handleRetrainModel}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retrain Model
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* User Management Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white border-none hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg flex items-center">
                <Users className="mr-2 h-5 w-5 text-blue-500" />
                Recent Users
              </CardTitle>
              <Button 
                size="sm" 
                className="bg-blue-500 hover:bg-blue-600"
                onClick={() => setIsAddUserModalOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.user_role)}>
                        {user.user_role}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Room Management Section */}
        <Card className="bg-white border-none hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg flex items-center">
                <DoorClosed className="mr-2 h-5 w-5 text-purple-500" />
                Recent Rooms
              </CardTitle>
              <Button 
                size="sm" 
                className="bg-purple-500 hover:bg-purple-600"
                onClick={() => setIsAddRoomModalOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Room
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Floor</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentRooms.map((room) => (
                  <TableRow key={room.id}>
                    <TableCell className="font-medium">{room.name}</TableCell>
                    <TableCell>{room.room_type_display}</TableCell>
                    <TableCell>{room.floor}</TableCell>
                    <TableCell>
                      <Badge variant={getRoomStatusBadgeVariant(room.status)}>
                        {room.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <AddUserModal 
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onSubmit={handleAddUser}
      />
      
      <AddRoomModal 
        isOpen={isAddRoomModalOpen}
        onClose={() => setIsAddRoomModalOpen(false)}
        onSubmit={handleAddRoom}
      />
    </div>
  );
};

// Helper functions for badge variants
const getRoleBadgeVariant = (role) => {
  switch (role.toLowerCase()) {
    case 'admin':
      return 'default';
    case 'doctor':
      return 'blue';
    case 'patient':
      return 'secondary';
    default:
      return 'outline';
  }
};

const getRoomStatusBadgeVariant = (status) => {
  switch (status.toLowerCase()) {
    case 'available':
      return 'success';
    case 'occupied':
      return 'destructive';
    case 'maintenance':
      return 'warning';
    case 'cleaning':
      return 'secondary';
    case 'reserved':
      return 'blue';
    default:
      return 'outline';
  }
};

export default AdminDashboard; 