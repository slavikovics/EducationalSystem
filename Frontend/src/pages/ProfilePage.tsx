// src/pages/ProfilePage.tsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Shield, Calendar, Edit } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/ui/card';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');

  const handleSave = () => {
    // Here you would call an API to update the user profile
    console.log('Saving profile with name:', editedName);
    setIsEditing(false);
    // In a real app, you would update the user context here
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          View and manage your account information
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription>
              Your personal details and account information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center mb-4">
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-3xl font-bold">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  placeholder="Enter your name"
                />
              ) : (
                <div className="flex items-center justify-between p-2 border rounded-md">
                  <span>{user.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="flex items-center">
                <Mail className="mr-2 h-4 w-4" />
                Email Address
              </Label>
              <div className="p-2 border rounded-md">
                <span>{user.email}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center">
                <Shield className="mr-2 h-4 w-4" />
                Account Type
              </Label>
              <div className="p-2 border rounded-md">
                <span className="capitalize">{user.role || user.userType || 'User'}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                Account Status
              </Label>
              <div className="p-2 border rounded-md">
                <span className="capitalize">{user.status || 'Active'}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>Save Changes</Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Account Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle>Account Statistics</CardTitle>
            <CardDescription>
              Your activity and engagement metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold">0</div>
                <div className="text-sm text-muted-foreground">Materials Created</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold">0</div>
                <div className="text-sm text-muted-foreground">Tests Taken</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold">0</div>
                <div className="text-sm text-muted-foreground">Reviews Written</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold">0</div>
                <div className="text-sm text-muted-foreground">Achievements</div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="space-y-2">
              <h3 className="font-semibold">Recent Activity</h3>
              <div className="text-sm text-muted-foreground">
                <p>No recent activity to display</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};