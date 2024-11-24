import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { api } from "@/utils/axios";
import { Plus, Search, Edit, Trash2, Building2 } from 'lucide-react';
import AddRoomModal from './AddRoomModal';
import { useToast } from "@/hooks/use-toast";
import EditRoomModal from './EditRoomModal';

// Add this helper function inside the file but outside the component
const getRoomStatusBadgeVariant = (status) => {
  switch (status?.toLowerCase()) {
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

const RoomManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const { toast } = useToast();
  
  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await api().get('rooms/', {
        params: {
          search: searchTerm,
          type: filterType === 'all' ? null : filterType,
          status: filterStatus === 'all' ? null : filterStatus
        }
      });
      setRooms(response.data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch rooms"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api().delete(`rooms/${id}/`);
      toast({
        title: "Success",
        description: "Room deleted successfully"
      });
      fetchRooms();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete room"
      });
    }
  };

  const handleEdit = (room) => {
    setSelectedRoom(room);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (data) => {
    try {
      await api().put(`rooms/${selectedRoom.id}/`, data);
      toast({
        title: "Success",
        description: "Room updated successfully"
      });
      setIsEditModalOpen(false);
      setSelectedRoom(null);
      fetchRooms();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update room"
      });
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Room Management</h2>
          <p className="text-gray-500">Manage hospital rooms and their allocation</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Room
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex gap-4">
            <Input
              placeholder="Search rooms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Room Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="lab">Laboratory</SelectItem>
                <SelectItem value="patient">Patient Room</SelectItem>
                <SelectItem value="surgery">Surgery Room</SelectItem>
                <SelectItem value="icu">ICU</SelectItem>
                <SelectItem value="emergency">Emergency Room</SelectItem>
                <SelectItem value="consultation">Consultation Room</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="occupied">Occupied</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="cleaning">Cleaning</SelectItem>
                <SelectItem value="reserved">Reserved</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchRooms}>
              Search
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Room Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Floor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Current Occupant</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rooms.map((room) => (
                <TableRow key={room.id}>
                  <TableCell className="font-medium">{room.name}</TableCell>
                  <TableCell>{room.room_type_display}</TableCell>
                  <TableCell>{room.floor}</TableCell>
                  <TableCell>
                    <Badge variant={getRoomStatusBadgeVariant(room.status)}>
                      {room.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{room.current_occupant_name || '-'}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEdit(room)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDelete(room.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AddRoomModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={async (data) => {
          try {
            await api().post('rooms/', data);
            toast({
              title: "Success",
              description: "Room added successfully"
            });
            setIsAddModalOpen(false);
            fetchRooms();
          } catch (error) {
            toast({
              variant: "destructive",
              title: "Error",
              description: "Failed to add room"
            });
          }
        }}
      />

      <EditRoomModal 
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedRoom(null);
        }}
        onSubmit={handleUpdate}
        room={selectedRoom}
      />
    </div>
  );
};

export default RoomManagement; 