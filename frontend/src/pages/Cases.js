import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { casesAPI } from '../services/api';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function Cases() {
  const [cases, setCases] = useState([]);
  const [filteredCases, setFilteredCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadCases();
  }, []);

  useEffect(() => {
    filterCases();
  }, [cases, searchTerm, statusFilter]);

  const loadCases = async () => {
    try {
      setLoading(true);
      const response = await casesAPI.getAll();
      setCases(response.data);
      setError('');
    } catch (err) {
      console.error('Error loading cases:', err);
      setError('Failed to load cases');
    } finally {
      setLoading(false);
    }
  };

  const filterCases = () => {
    let filtered = cases;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          c.case_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.client_email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }

    setFilteredCases(filtered);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-yellow-100 text-yellow-800';
      case 'Invoiced':
        return 'bg-blue-100 text-blue-800';
      case 'Paid':
        return 'bg-green-100 text-green-800';
      case 'Closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading cases...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="sm:flex sm:items-center mb-6">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900">Cases</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage motorcycle rental cases and claims
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            New Case
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <div className="text-sm text-red-700">{error}</div>
          <button
            onClick={loadCases}
            className="mt-2 text-sm text-red-600 hover:text-red-500"
          >
            Try again
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Search */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                Search cases
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  name="search"
                  id="search"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Case number, client name, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Filter by status
              </label>
              <select
                id="status"
                name="status"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All statuses</option>
                <option value="Active">Active</option>
                <option value="Invoiced">Invoiced</option>
                <option value="Paid">Paid</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Cases Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="min-w-full divide-y divide-gray-200">
          <div className="bg-gray-50 px-6 py-3">
            <div className="grid grid-cols-6 gap-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div>Case Number</div>
              <div>Client</div>
              <div>Status</div>
              <div>Invoiced</div>
              <div>Paid</div>
              <div>Last Updated</div>
            </div>
          </div>
          <div className="bg-white divide-y divide-gray-200">
            {filteredCases.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-gray-500">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'No cases match your filters' 
                    : 'No cases found'
                  }
                </p>
              </div>
            ) : (
              filteredCases.map((caseItem) => (
                <Link
                  key={caseItem.id}
                  to={`/cases/${caseItem.id}`}
                  className="block hover:bg-gray-50"
                >
                  <div className="px-6 py-4">
                    <div className="grid grid-cols-6 gap-4 items-center">
                      <div className="text-sm font-medium text-blue-600">
                        {caseItem.case_number}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {caseItem.client_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {caseItem.client_email}
                        </div>
                      </div>
                      <div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(caseItem.status)}`}>
                          {caseItem.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-900">
                        ${parseFloat(caseItem.invoiced || 0).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-900">
                        ${parseFloat(caseItem.paid || 0).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {caseItem.last_updated}
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}