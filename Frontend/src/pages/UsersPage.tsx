import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  User as UserIcon, 
  Search, 
  Filter, 
  Mail, 
  Shield, 
  CheckCircle, 
  XCircle, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Ban, 
  UserCheck,
  Sparkles,
  TrendingUp,
  Award,
  Clock,
  Eye,
  Plus,
  RefreshCw,
  Loader2,
  Activity,
  X
} from 'lucide-react';
import { toast } from 'sonner';

// Import shadcn/ui components
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

// Import API
import { usersAPI } from '../services/api';
import type { ApiResponse } from '@/types';

interface User {
  userId: number;
  name: string;
  email: string;
  role: string;
  status: string;
  userType: string;
  createdAt?: string;
  materialsCount?: number;
  testResultsCount?: number;
}

export const UsersPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showUnblockModal, setShowUnblockModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [animateHeader, setAnimateHeader] = useState(false);
  const [animateStats, setAnimateStats] = useState(false);
  const [animateTable, setAnimateTable] = useState(false);
  const [hoveredUser, setHoveredUser] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  const queryClient = useQueryClient();

  useEffect(() => {
    // Stagger animations
    setTimeout(() => setAnimateHeader(true), 200);
    setTimeout(() => setAnimateStats(true), 400);
    setTimeout(() => setAnimateTable(true), 600);
  }, []);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await usersAPI.getAll();
      if (response.success) {
         console.log(response.data);
         return response.data;
      }
      throw new Error(response.error || 'Failed to load users');
    },
    refetchOnWindowFocus: false,
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) ||
                         user.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.userType === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'Active' && user.status === 'Active') ||
                      (activeTab === 'Blocked' && user.status === 'Blocked') ||
                      (activeTab === 'Admin' && user.userType === 'Admin') ||
                      (activeTab === 'Tutor' && user.userType === 'Tutor') ||
                      (activeTab === 'User' && user.userType === 'User');
    return matchesSearch && matchesRole && matchesStatus && matchesTab;
  });

  const blockUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await usersAPI.blockUser(userId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to block user');
      }
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowBlockModal(false);
      toast.success(data?.message || 'User blocked successfully', {
        icon: <Ban className="h-5 w-5 text-yellow-500" />,
        duration: 3000,
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to block user', {
        icon: <XCircle className="h-5 w-5 text-red-500" />,
        duration: 3000,
      });
    },
  });

  const unblockUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await usersAPI.unblockUser(userId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to unblock user');
      }
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowUnblockModal(false);
      toast.success(data?.message || 'User unblocked successfully', {
        icon: <UserCheck className="h-5 w-5 text-green-500" />,
        duration: 3000,
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to unblock user', {
        icon: <XCircle className="h-5 w-5 text-red-500" />,
        duration: 3000,
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await usersAPI.deleteUser(userId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete user');
      }
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowDeleteModal(false);
      toast.success(data?.message || 'User deleted successfully', {
        icon: <Trash2 className="h-5 w-5 text-red-500" />,
        duration: 3000,
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete user', {
        icon: <XCircle className="h-5 w-5 text-red-500" />,
        duration: 3000,
      });
    },
  });

  const getStatusIcon = (status: string) => {
    return status === 'Active' 
      ? <CheckCircle className="h-4 w-4 text-green-500 animate-pulse-slow" /> 
      : <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Admin': return <Shield className="h-4 w-4" />;
      case 'Tutor': return <Award className="h-4 w-4" />;
      default: return <UserIcon className="h-4 w-4" />;
    }
  };

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['users'] });
    toast.success('Users list refreshed!', {
      icon: <RefreshCw className="h-5 w-5 text-primary animate-spin-slow" />,
      duration: 1500,
    });
  };

  const handleBlockUser = () => {
    if (selectedUser) {
      blockUserMutation.mutate(selectedUser.userId);
    }
  };

  const handleUnblockUser = () => {
    if (selectedUser) {
      unblockUserMutation.mutate(selectedUser.userId);
    }
  };

  const handleDeleteUser = () => {
    if (selectedUser) {
      deleteUserMutation.mutate(selectedUser.userId);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className={`
        flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4
        transform transition-all duration-700
        ${animateHeader ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}
      `}>
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 animate-pulse-slow">
              <UserIcon className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight animate-slide-in-right">
              User Management
            </h1>
          </div>
          <p className="text-muted-foreground animate-fade-in animation-delay-300">
            Manage system users, roles, and permissions
          </p>
        </div>
        
        <div className="flex items-center gap-3 animate-fade-in animation-delay-500">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
            className="hover-scale transition-smooth group"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className={`
          transform transition-all duration-700 hover:shadow-xl hover:scale-[1.02] transition-all duration-300
          group
          ${animateStats ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}
        `}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold animate-count-up">{users.length}</div>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
              <div className="p-2 rounded-lg bg-accent group-hover:scale-110 transition-transform">
                <UserIcon className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`
          transform transition-all duration-700 hover:shadow-xl hover:scale-[1.02] transition-all duration-300
          group
          ${animateStats ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}
        `}
        style={{ transitionDelay: '100ms' }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold animate-count-up animation-delay-200">
                  {users.filter(u => u.status === 'Active').length}
                </div>
                <p className="text-sm text-muted-foreground">Active Users</p>
              </div>
              <div className="p-2 rounded-lg bg-accent group-hover:scale-110 transition-transform">
                <UserCheck className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`
          transform transition-all duration-700 hover:shadow-xl hover:scale-[1.02] transition-all duration-300
          group
          ${animateStats ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}
        `}
        style={{ transitionDelay: '200ms' }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold animate-count-up animation-delay-400">
                  {users.filter(u => u.role === 'Admin').length}
                </div>
                <p className="text-sm text-muted-foreground">Admins</p>
              </div>
              <div className="p-2 rounded-lg bg-accent group-hover:scale-110 transition-transform">
                <Shield className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`
          transform transition-all duration-700 hover:shadow-xl hover:scale-[1.02] transition-all duration-300
          group
          ${animateStats ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}
        `}
        style={{ transitionDelay: '300ms' }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold animate-count-up animation-delay-600">
                  {users.filter(u => u.role === 'Tutor').length}
                </div>
                <p className="text-sm text-muted-foreground">Tutors</p>
              </div>
              <div className="p-2 rounded-lg bg-accent group-hover:scale-110 transition-transform">
                <Award className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Tabs */}
      <Card className={`
        transform transition-all duration-700 hover:shadow-xl transition-all duration-300
        ${animateStats ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
      `}>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-6 w-full">
                <TabsTrigger value="all" className="hover-scale transition-smooth">
                  All Users
                </TabsTrigger>
                <TabsTrigger value="Active" className="hover-scale transition-smooth">
                  <UserCheck className="h-4 w-4 mr-2" />
                  Active
                </TabsTrigger>
                <TabsTrigger value="Blocked" className="hover-scale transition-smooth">
                  <Ban className="h-4 w-4 mr-2" />
                  Blocked
                </TabsTrigger>
                <TabsTrigger value="Admin" className="hover-scale transition-smooth">
                  <Shield className="h-4 w-4 mr-2" />
                  Admins
                </TabsTrigger>
                <TabsTrigger value="Tutor" className="hover-scale transition-smooth">
                  <Award className="h-4 w-4 mr-2" />
                  Tutors
                </TabsTrigger>
                <TabsTrigger value="User" className="hover-scale transition-smooth">
                  <UserIcon className="h-4 w-4 mr-2" />
                  Users
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                <Input
                  placeholder="Search users by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-md"
                />
                {search && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:scale-110 transition-transform"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              
              <Select
                value={roleFilter}
                onValueChange={setRoleFilter}
              >
                <SelectTrigger className="hover-scale transition-smooth group">
                  <SelectValue placeholder="All Roles" />
                  <Filter className="h-4 w-4 ml-2 text-muted-foreground group-hover:text-primary transition-colors" />
                </SelectTrigger>
                <SelectContent className="animate-scale-in">
                  <SelectItem value="all" className="hover-scale transition-smooth">All Roles</SelectItem>
                  <SelectItem value="Admin" className="hover-scale transition-smooth">Admin</SelectItem>
                  <SelectItem value="Tutor" className="hover-scale transition-smooth">Tutor</SelectItem>
                  <SelectItem value="User" className="hover-scale transition-smooth">User</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="hover-scale transition-smooth group">
                  <SelectValue placeholder="All Status" />
                  <Activity className="h-4 w-4 ml-2 text-muted-foreground group-hover:text-primary transition-colors" />
                </SelectTrigger>
                <SelectContent className="animate-scale-in">
                  <SelectItem value="all" className="hover-scale transition-smooth">All Status</SelectItem>
                  <SelectItem value="Active" className="hover-scale transition-smooth">Active</SelectItem>
                  <SelectItem value="Blocked" className="hover-scale transition-smooth">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className={`
        transform transition-all duration-700 hover:shadow-xl transition-all duration-300
        ${animateTable ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
      `}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-primary" />
            System Users
          </CardTitle>
          <CardDescription className="animate-fade-in">
            {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found • 
            <span className="ml-2 inline-flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-yellow-500 animate-spin-slow" />
              User management
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 animate-fade-in">
              <UserIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No users found</h3>
              <p className="text-muted-foreground">Try adjusting your search filters</p>
            </div>
          ) : (
            <Table className='overflow-hidden'>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user, index) => (
                  <TableRow 
                    key={user.userId}
                    className={`
                      hover:bg-muted/50 transition-all duration-300 group
                      ${hoveredUser === user.userId ? 'bg-muted/30 scale-[1.01]' : ''}
                      animate-fade-in
                    `}
                    style={{ animationDelay: `${index * 100}ms` }}
                    onMouseEnter={() => setHoveredUser(user.userId!)}
                    onMouseLeave={() => setHoveredUser(null)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="group-hover:scale-110 transition-transform duration-300">
                          <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                            {user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium group-hover:text-primary transition-colors">
                            {user.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ID: #{user.userId}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={`$flex items-center gap-1 hover:scale-105 transition-transform`}
                      >
                        {getRoleIcon(user.userType)}
                        {user.userType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(user.status)}
                        <Badge 
                          variant="outline" 
                          className={`$hover:scale-105 transition-transform`}
                        >
                          {user.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                        <Mail className="h-4 w-4" />
                        <span className="text-sm">{user.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {user.status === 'Active' ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowBlockModal(true);
                            }}
                            className="hover-scale transition-smooth"
                            title="Block User"
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowUnblockModal(true);
                            }}
                            className="hover-scale transition-smooth"
                            title="Unblock User"
                          >
                            <UserCheck className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDeleteModal(true);
                          }}
                          className="hover-scale transition-smooth"
                          title="Delete User"
                          disabled={user.userType === 'Admin'}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Block User Alert Dialog */}
      <AlertDialog open={showBlockModal} onOpenChange={setShowBlockModal}>
        <AlertDialogContent className="animate-scale-in">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Ban className="h-5 w-5 text-yellow-600" />
              Block User
            </AlertDialogTitle>
            <AlertDialogDescription className="animate-fade-in">
              Are you sure you want to block <span className="font-semibold">{selectedUser?.name}</span>? 
              This will prevent them from accessing the platform.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="bg-accent border rounded-lg p-4 mb-4 animate-fade-in animation-delay-200">
            <div className="flex items-start gap-3">
              <Ban className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Warning</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Blocked users cannot log in or access any resources.
                </p>
              </div>
            </div>
          </div>

          <AlertDialogFooter className="animate-fade-in animation-delay-400">
            <AlertDialogCancel className="hover-scale transition-smooth" disabled={blockUserMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBlockUser}
              disabled={blockUserMutation.isPending}
              className="bg-yellow-600 text-yellow-foreground hover:bg-yellow-700 hover-scale transition-smooth"
            >
              {blockUserMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Blocking...
                </>
              ) : (
                <>
                  <Ban className="mr-2 h-4 w-4" />
                  Block User
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unblock User Alert Dialog */}
      <AlertDialog open={showUnblockModal} onOpenChange={setShowUnblockModal}>
        <AlertDialogContent className="animate-scale-in">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-green-600" />
              Unblock User
            </AlertDialogTitle>
            <AlertDialogDescription className="animate-fade-in">
              Are you sure you want to unblock <span className="font-semibold">{selectedUser?.name}</span>? 
              This will restore their access to the platform.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="bg-accent border rounded-lg p-4 mb-4 animate-fade-in animation-delay-200">
            <div className="flex items-start gap-3">
              <UserCheck className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-green-800">Restore Access</h4>
                <p className="text-sm text-green-700 mt-1">
                  User will be able to log in and access all resources.
                </p>
              </div>
            </div>
          </div>

          <AlertDialogFooter className="animate-fade-in animation-delay-400">
            <AlertDialogCancel className="hover-scale transition-smooth" disabled={unblockUserMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUnblockUser}
              disabled={unblockUserMutation.isPending}
              className="bg-green-600 text-green-foreground hover:bg-green-700 hover-scale transition-smooth"
            >
              {unblockUserMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Unblocking...
                </>
              ) : (
                <>
                  <UserCheck className="mr-2 h-4 w-4" />
                  Unblock User
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete User Alert Dialog */}
      <AlertDialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <AlertDialogContent className="animate-scale-in">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              Delete User
            </AlertDialogTitle>
            <AlertDialogDescription className="animate-fade-in">
              Are you sure you want to permanently delete <span className="font-semibold">{selectedUser?.name}</span>? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="bg-accent border rounded-lg p-4 mb-4 animate-fade-in animation-delay-200">
            <div className="flex items-start gap-3">
              <Trash2 className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-red-800">Danger Zone</h4>
                <p className="text-sm text-red-700 mt-1">
                  All user data will be permanently deleted from the system.
                </p>
                {selectedUser?.role === 'Admin' && (
                  <p className="text-sm text-red-700 mt-2 font-semibold">
                    ⚠️ Admin users cannot be deleted.
                  </p>
                )}
              </div>
            </div>
          </div>

          <AlertDialogFooter className="animate-fade-in animation-delay-400">
            <AlertDialogCancel className="hover-scale transition-smooth" disabled={deleteUserMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={deleteUserMutation.isPending || selectedUser?.role === 'Admin'}
              className="bg-red-600 text-red-foreground hover:bg-red-700 hover-scale transition-smooth"
            >
              {deleteUserMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Permanently
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};