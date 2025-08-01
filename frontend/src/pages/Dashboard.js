import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { casesAPI, bikesAPI, healthAPI } from '../services/api';
import {
  FolderIcon,
  TruckIcon,
  CurrencyDollarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalCases: 0,
    activeCases: 0,
    totalBikes: 0,
    availableBikes: 0,
    totalRevenue: 0,
    pendingPayments: 0,
  });
  const [recentCases, setRecentCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Test API connection first
      await healthAPI.check();
      
      // Load cases data
      const casesResponse = await casesAPI.getAll();
      const cases = casesResponse.data;
      
      // Load bikes data
      const bikesResponse = await bikesAPI.getAll();
      const bikes = bikesResponse.data;
      
      // Calculate stats
      const activeCases = cases.filter(c => c.status === 'Active').length;
      const availableBikes = bikes.filter(b => b.status === 'Available').length;
      const totalRevenue = cases.reduce((sum, c) => sum + (parseFloat(c.paid) || 0), 0);
      const pendingPayments = cases.reduce((sum, c) => sum + (parseFloat(c.agreed) || 0) - (parseFloat(c.paid) || 0), 0);
      
      setStats({
        totalCases: cases.length,
        activeCases: activeCases,
        totalBikes: bikes.length,
        availableBikes: availableBikes,
        totalRevenue: totalRevenue,
        pendingPayments: pendingPayments,
      });
      
      // Set recent cases (last 5)
      setRecentCases(cases.slice(0, 5));
      
      setError('');
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      name: 'Total Cases',
      value: stats.totalCases,
      icon: FolderIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Active Cases',
      value: stats.activeCases,
      icon: ClockIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      name: 'Available Bikes',
      value: stats.availableBikes,
      icon: TruckIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: CurrencyDollarIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="text-sm text-red-700">{error}</div>
        <button
          onClick={loadDashboardData}
          className="mt-2 text-sm text-red-600 hover:text-red-500"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-700">
          Welcome to WhitePointer Motorcycle Rental Management System
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {statCards.map((stat) => (
          <div
            key={stat.name}
            className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden"
          >
            <dt>
              <div className={`absolute ${stat.bgColor} rounded-md p-3`}>
                <stat.icon
                  className={`h-6 w-6 ${stat.color}`}
                  aria-hidden="true"
                />
              </div>
              <p className="ml-16 text-sm font-medium text-gray-500 truncate">
                {stat.name}
              </p>
            </dt>
            <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">
                {stat.value}
              </p>
            </dd>
          </div>
        ))}
      </div>

      {/* Recent Cases */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Recent Cases
            </h3>
            <Link
              to="/cases"
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              View all cases →
            </Link>
          </div>
          
          {recentCases.length === 0 ? (
            <p className="text-gray-500 text-sm">No cases found</p>
          ) : (
            <div className="flow-root">
              <ul className="-my-5 divide-y divide-gray-200">
                {recentCases.map((caseItem) => (
                  <li key={caseItem.id} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <FolderIcon className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {caseItem.case_number}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {caseItem.client_name}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          caseItem.status === 'Active' 
                            ? 'bg-yellow-100 text-yellow-800'
                            : caseItem.status === 'Invoiced'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {caseItem.status}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}