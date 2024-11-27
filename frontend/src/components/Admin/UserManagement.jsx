import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { api } from "@/utils/axios";
import { Search, Plus, Edit, Trash2, RefreshCw } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserPlus, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';
import AddUserModal from './AddUserModal';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [editingUser, setEditingUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeletingUser, setIsDeletingUser] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter]);

  const fetchUsers = async () => {
    try {
      const response = await api().get('admin/users/', {
        params: { 
          search, 
          role: roleFilter === 'all' ? '' : roleFilter 
        }
      });
      setUsers(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch users")
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const updatedUser = {
        name: editingUser.name,
        email: editingUser.email,
        user_role: editingUser.user_role,
        is_active: editingUser.is_active
      };

      await api().put(`admin/users/${editingUser.id}/`, updatedUser);
      toast.success("User updated successfully")
      setIsEditModalOpen(false);
      setEditingUser(null); // Reset the editing user
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update user")
    }
  };

  const handleDeleteUser = async () => {
    try {
      await api().delete(`admin/users/${isDeletingUser.id}/`);
      toast.success("User deleted successfully")
      setIsDeleteModalOpen(false);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete user")
    }
  };

  const handleAddUser = async (userData) => {
    try {
      await api().post('admin/users/', userData);
      toast.success("User added successfully");
      setIsAddModalOpen(false);
      fetchUsers(); // Refresh the user list
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add user")
    }
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
          </div>
          <p className="text-muted-foreground">
            Manage system users, roles, and permissions
          </p>
        </div>
        <Button size="sm" className="gap-2" onClick={() => setIsAddModalOpen(true)}>
          <UserPlus className="h-4 w-4" />
          Add New User
        </Button>
      </div>

      <Card className="border-border/50">
        <CardHeader className="pb-0">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                className="pl-9 bg-background"
                placeholder="Search users by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select
              value={roleFilter}
              onValueChange={setRoleFilter}
              defaultValue="all"
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="doctor">Doctor</SelectItem>
                <SelectItem value="patient">Patient</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : users.length > 0 ? (
            <ScrollArea className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.user_role)}>
                          {user.user_role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setEditingUser(user);
                              setIsEditModalOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {user.user_role !== 'admin' && (
                            <Button 
                              variant="ghost" 
                            size="sm" 
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              setIsDeletingUser(user);
                              setIsDeleteModalOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium text-muted-foreground mb-2">No users found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit User
            </DialogTitle>
          </DialogHeader>
          <Separator />
          <form onSubmit={handleEditUser} className="space-y-6 py-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={editingUser?.name || ''}
                  onChange={(e) => setEditingUser(prev => ({...prev, name: e.target.value}))}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={editingUser?.email || ''}
                  onChange={(e) => setEditingUser(prev => ({...prev, email: e.target.value}))}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="user_role">Role</Label>
                <Select
                  name="user_role"
                  value={editingUser?.user_role || "patient"}
                  onValueChange={(value) => setEditingUser(prev => ({...prev, user_role: value}))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="Health Professional">Doctor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="is_active">Status</Label>
                <Select
                  name="is_active"
                  value={editingUser?.is_active?.toString() || "true"}
                  onValueChange={(value) => setEditingUser(prev => ({...prev, is_active: value === "true"}))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Delete User
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {isDeletingUser?.name}'s account? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AddUserModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddUser}
      />
    </div>
  );
};

// Helper function for role badge variants
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

export default UserManagement; 