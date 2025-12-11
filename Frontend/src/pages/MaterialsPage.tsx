// src/pages/MaterialsPage.tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { materialsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Search, Filter, Edit, Trash2, Eye, Download } from 'lucide-react';
import { format } from 'date-fns';

export const MaterialsPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch materials
  const { data: materials, isLoading } = useQuery({
    queryKey: ['materials'],
    queryFn: () => materialsAPI.getAll(),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => materialsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
    },
  });

  const filteredMaterials = materials?.data?.filter((material: any) => {
    const matchesSearch = material.content?.text
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesCategory = category === 'all' || material.category === category;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    'Science',
    'Art',
    'Technology',
    'Business',
    'Health',
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Materials</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage and create educational materials
          </p>
        </div>
        {user?.role === 'Tutor' || user?.role === 'Admin' ? (
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Material
          </button>
        ) : null}
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search materials..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Materials Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials?.map((material: any) => (
            <div
              key={material.materialId}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {material.category}
                    </span>
                    <p className="mt-1 text-xs text-gray-500">
                      {format(new Date(material.creationDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <Eye className="h-4 w-4 text-gray-600" />
                    </button>
                    {(user?.role === 'Tutor' || user?.role === 'Admin') && (
                      <>
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <Edit className="h-4 w-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => deleteMutation.mutate(material.materialId)}
                          className="p-1 hover:bg-red-50 rounded text-red-600"
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {material.content?.text.substring(0, 100)}
                  {material.content?.text.length > 100 ? '...' : ''}
                </h3>
                
                {material.content?.mediaFiles?.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">Media files:</p>
                    <div className="flex flex-wrap gap-2">
                      {material.content.mediaFiles.map((file: string, index: number) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          File {index + 1}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mt-6 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {material.user?.name?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {material.user?.name || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {material.user?.role || 'User'}
                        </p>
                      </div>
                    </div>
                    <button className="text-sm text-primary hover:text-primary/90 font-medium">
                      View Details →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Material Modal */}
      {showCreateModal && (
        <CreateMaterialModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
};

// Create Material Modal Component
const CreateMaterialModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [text, setText] = useState('');
  const [category, setCategory] = useState('Science');
  const [mediaFiles, setMediaFiles] = useState<string[]>([]);
  const [newFile, setNewFile] = useState('');
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: any) => materialsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      onClose();
    },
  });

  const addFile = () => {
    if (newFile.trim()) {
      setMediaFiles([...mediaFiles, newFile.trim()]);
      setNewFile('');
    }
  };

  const removeFile = (index: number) => {
    setMediaFiles(mediaFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      text,
      category,
      mediaFiles: mediaFiles.length > 0 ? mediaFiles : undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Create New Material
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter material content..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Science">Science</option>
                <option value="Art">Art</option>
                <option value="Technology">Technology</option>
                <option value="Business">Business</option>
                <option value="Health">Health</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Media Files (Optional)
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newFile}
                  onChange={(e) => setNewFile(e.target.value)}
                  placeholder="Enter file URL..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={addFile}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Add
                </button>
              </div>
              {mediaFiles.length > 0 && (
                <div className="space-y-2">
                  {mediaFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded"
                    >
                      <span className="text-sm text-gray-600 truncate">
                        {file}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50"
              >
                {createMutation.isPending ? 'Creating...' : 'Create Material'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};