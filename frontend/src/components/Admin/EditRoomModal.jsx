import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm, Controller } from "react-hook-form";

const EditRoomModal = ({ isOpen, onClose, onSubmit, room }) => {
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: room?.name || '',
      room_type: room?.room_type || null,
      floor: room?.floor || '',
      capacity: room?.capacity || 1,
      description: room?.description || '',
      status: room?.status || 'available'
    }
  });

  // Reset form when room data changes
  React.useEffect(() => {
    if (room) {
      reset({
        name: room.name,
        room_type: room.room_type,
        floor: room.floor,
        capacity: room.capacity,
        description: room.description,
        status: room.status
      });
    }
  }, [room, reset]);

  const handleFormSubmit = async (data) => {
    // Convert floor and capacity to numbers
    data.floor = parseInt(data.floor);
    data.capacity = parseInt(data.capacity);
    await onSubmit(data);
    reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {
      onClose();
      reset();
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Room</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Room Name</Label>
              <Input
                id="name"
                {...register("name", { required: "Room name is required" })}
                placeholder="e.g., Surgery Room 101"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="room_type">Room Type</Label>
              <Controller
                name="room_type"
                control={control}
                rules={{ required: "Room type is required" }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select room type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lab">Laboratory</SelectItem>
                      <SelectItem value="patient">Patient Room</SelectItem>
                      <SelectItem value="surgery">Surgery Room</SelectItem>
                      <SelectItem value="icu">ICU</SelectItem>
                      <SelectItem value="emergency">Emergency Room</SelectItem>
                      <SelectItem value="consultation">Consultation Room</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.room_type && (
                <p className="text-sm text-red-500">{errors.room_type.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="floor">Floor Number</Label>
              <Input
                id="floor"
                type="number"
                {...register("floor", { 
                  required: "Floor number is required",
                  min: { value: 0, message: "Floor number must be 0 or greater" }
                })}
                placeholder="e.g., 1"
              />
              {errors.floor && (
                <p className="text-sm text-red-500">{errors.floor.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                {...register("capacity", { 
                  required: "Capacity is required",
                  min: { value: 1, message: "Capacity must be at least 1" }
                })}
                placeholder="e.g., 1"
              />
              {errors.capacity && (
                <p className="text-sm text-red-500">{errors.capacity.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Room description..."
              />
            </div>


            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Controller
                name="status"
                control={control}
                rules={{ required: "Status is required" }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="occupied">Occupied</SelectItem>
                      <SelectItem value="maintenance">Under Maintenance</SelectItem>
                      <SelectItem value="cleaning">Being Cleaned</SelectItem>
                      <SelectItem value="reserved">Reserved</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.status && (
                <p className="text-sm text-red-500">{errors.status.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditRoomModal; 