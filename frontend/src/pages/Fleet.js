import React, { useState, useEffect } from 'react';
import { bikesAPI } from '../services/api';
import { TruckIcon, PlusIcon } from '@heroicons/react/24/outline';

export default function Fleet() {
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadBikes();
  }, []);

  const loadBikes = async () => {
    try {
      setLoading(true);
      const response = await bikesAPI.getAll();
      setBikes(response.data);
      setError('');
    } catch (err) {
      console.error('Error loading bikes:', err);
      setError('Failed to load fleet data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available':
        return 'bg-green-100 text-green-800';
      case 'Rented':
        return 'bg-yellow-100 text-yellow-800';
      case 'Maintenance':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading fleet...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="sm:flex sm:items-center mb-6">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900">Fleet Management</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your motorcycle rental fleet
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Add Bike
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <div className="text-sm text-red-700">{error}</div>
          <button
            onClick={loadBikes}
            className="mt-2 text-sm text-red-600 hover:text-red-500"
          >
            Try again
          </button>
        </div>
      )}

      {/* Bikes Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {bikes.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <TruckIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No bikes</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding a new bike to your fleet.
            </p>
          </div>
        ) : (
          bikes.map((bike) => (
            <div key={bike.id} className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {bike.make} {bike.model}
                  </h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(bike.status)}`}>
                    {bike.status}
                  </span>
                </div>
                
                <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Registration</dt>
                    <dd className="mt-1 text-sm text-gray-900">{bike.registration || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Daily Rate</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      ${parseFloat(bike.daily_rate || 0).toFixed(2)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Location</dt>
                    <dd className="mt-1 text-sm text-gray-900">{bike.location || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Assignment</dt>
                    <dd className="mt-1 text-sm text-gray-900">{bike.assignment || '-'}</dd>
                  </div>
                </dl>

                {bike.service_notes && (
                  <div className="mt-4">
                    <dt className="text-sm font-medium text-gray-500">Service Notes</dt>
                    <dd className="mt-1 text-sm text-gray-900">{bike.service_notes}</dd>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}