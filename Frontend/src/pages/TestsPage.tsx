// src/pages/TestsPage.tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { testsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Search, BookOpen, Clock, Users, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export const TestsPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: tests, isLoading } = useQuery({
    queryKey: ['tests'],
    queryFn: () => testsAPI.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => testsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests'] });
    },
  });

  const filteredTests = tests?.data?.filter((test: any) => {
    return test.questions?.some((q: any) =>
      q.questionText.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Tests</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage educational tests and assessments
          </p>
        </div>
        {(user?.role === 'Tutor' || user?.role === 'Admin') && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Test
          </button>
        )}
      </div>

      {/* Search */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search tests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Tests List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredTests?.map((test: any) => (
              <li key={test.testId}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <BookOpen className="h-5 w-5 text-gray-400 mr-2" />
                        <h3 className="text-lg font-medium text-gray-900">
                          Test #{test.testId}
                        </h3>
                        {test.material && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {test.material.category}
                          </span>
                        )}
                      </div>
                      
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">
                          {test.questions?.length || 0} questions
                        </p>
                        {test.material?.content && (
                          <p className="mt-1 text-sm text-gray-500">
                            Material: {test.material.content.text.substring(0, 100)}...
                          </p>
                        )}
                      </div>
                      
                      <div className="mt-3 flex items-center text-sm text-gray-500">
                        <Clock className="flex-shrink-0 mr-1.5 h-4 w-4" />
                        <span>Created recently</span>
                        <Users className="ml-4 flex-shrink-0 mr-1.5 h-4 w-4" />
                        <span>For all students</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <button className="text-sm text-primary hover:text-primary/90 font-medium">
                        Take Test
                      </button>
                      {(user?.role === 'Tutor' || user?.role === 'Admin') && (
                        <>
                          <button className="p-2 text-gray-400 hover:text-gray-600">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteMutation.mutate(test.testId)}
                            className="p-2 text-red-400 hover:text-red-600"
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};