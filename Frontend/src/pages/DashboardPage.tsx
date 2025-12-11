// src/pages/DashboardPage.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { materialsAPI, testsAPI, reviewsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
  BookOpen,
  FileText,
  Star,
  Users,
  TrendingUp,
  Calendar,
  Award
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  const { data: materials } = useQuery({
    queryKey: ['materials'],
    queryFn: () => materialsAPI.getAll(),
  });

  const { data: tests } = useQuery({
    queryKey: ['tests'],
    queryFn: () => testsAPI.getAll(),
  });

  const { data: reviews } = useQuery({
    queryKey: ['reviews'],
    queryFn: () => reviewsAPI.getAll(),
  });

  const stats = [
    {
      name: 'Total Materials',
      value: materials?.data?.length || 0,
      icon: BookOpen,
      change: '+12%',
      color: 'bg-blue-500',
    },
    {
      name: 'Active Tests',
      value: tests?.data?.length || 0,
      icon: FileText,
      change: '+8%',
      color: 'bg-green-500',
    },
    {
      name: 'Reviews',
      value: reviews?.data?.length || 0,
      icon: Star,
      change: '+5%',
      color: 'bg-yellow-500',
    },
    {
      name: 'Active Users',
      value: 156,
      icon: Users,
      change: '+3%',
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Here's what's happening with your educational system today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className={`${stat.color} p-3 rounded-md`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5">
                    <p className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </p>
                    <p className="mt-1 text-3xl font-semibold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="ml-2 text-sm text-gray-500">
                    {stat.change} from last month
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Recent Activities
            </h3>
            <div className="space-y-4">
              {[
                {
                  user: 'John Doe',
                  action: 'created a new material',
                  time: '2 hours ago',
                  type: 'material',
                },
                {
                  user: 'Jane Smith',
                  action: 'submitted a test',
                  time: '4 hours ago',
                  type: 'test',
                },
                {
                  user: 'Mike Johnson',
                  action: 'left a review',
                  time: '1 day ago',
                  type: 'review',
                },
              ].map((activity, index) => (
                <div key={index} className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {activity.user.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.user}</span>{' '}
                      {activity.action}
                    </p>
                    <p className="text-sm text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Upcoming Events
          </h3>
          <div className="space-y-4">
            {[
              {
                title: 'Science Fair',
                date: 'Tomorrow, 10:00 AM',
                icon: Calendar,
              },
              {
                title: 'Monthly Test',
                date: 'Next Monday, 2:00 PM',
                icon: Award,
              },
              {
                title: 'Teacher Meeting',
                date: 'Wednesday, 4:00 PM',
                icon: Users,
              },
            ].map((event, index) => {
              const Icon = event.icon;
              return (
                <div key={index} className="flex items-center">
                  <Icon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {event.title}
                    </p>
                    <p className="text-sm text-gray-500">{event.date}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* User Stats */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Your Progress
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">85%</div>
            <p className="text-sm text-gray-600">Course Completion</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">92</div>
            <p className="text-sm text-gray-600">Test Score Average</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">15</div>
            <p className="text-sm text-gray-600">Materials Created</p>
          </div>
        </div>
      </div>
    </div>
  );
};