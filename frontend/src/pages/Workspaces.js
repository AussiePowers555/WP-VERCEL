import React, { useState, useEffect } from 'react';
import { workspacesAPI } from '../services/api';

export default function Workspaces() {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const loadWorkspaces = async () => {
    try {
      setLoading(true);
      const response = await workspacesAPI.getAll();
      setWorkspaces(response.data);
      setError('');
    } catch (err) {
      console.error('Error loading workspaces:', err);
      setError('Failed to load workspaces');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading workspaces...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Workspaces</h1>
        <p className="mt-2 text-sm text-gray-700">
          Manage client workspaces and access
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <div className="text-sm text-red-700">{error}</div>
          <button
            onClick={loadWorkspaces}
            className="mt-2 text-sm text-red-600 hover:text-red-500"
          >
            Try again
          </button>
        </div>
      )}

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {workspaces.length === 0 ? (
            <p className="text-gray-500">No workspaces found</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {workspaces.map((workspace) => (
                <li key={workspace.id} className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {workspace.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Contact ID: {workspace.contact_id}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}