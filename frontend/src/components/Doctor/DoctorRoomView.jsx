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
import { useToast } from "@/hooks/use-toast";
import { Search, DoorOpen } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

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

const DoctorRoomView = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('available'); // Default to showing available rooms
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isOccupyModalOpen, setIsOccupyModalOpen] = useState(false);
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

  const handleOccupyRoom = async () => {
    try {
      await api().post(`rooms/${selectedRoom.id}/occupy/`);
      toast({
        title: "Success",
        description: "Room occupied successfully"
      });
      setIsOccupyModalOpen(false);
      setSelectedRoom(null);
      fetchRooms();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to occupy room"
      });
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Available Rooms</h2>
          <p className="text-gray-500">View and occupy available rooms</p>
        </div>
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
                <TableHead>Equipment</TableHead>
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
                  <TableCell>{room.equipment || '-'}</TableCell>
                  <TableCell>
                    {room.status === 'available' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedRoom(room);
                          setIsOccupyModalOpen(true);
                        }}
                      >
                        <DoorOpen className="h-4 w-4 mr-2" />
                        Occupy
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Occupy Room Confirmation Modal */}
      <Dialog open={isOccupyModalOpen} onOpenChange={setIsOccupyModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Occupy Room</DialogTitle>
            <DialogDescription>
              Are you sure you want to occupy {selectedRoom?.name}? This will mark the room as occupied and assign it to you.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsOccupyModalOpen(false);
                setSelectedRoom(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleOccupyRoom}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorRoomView; 