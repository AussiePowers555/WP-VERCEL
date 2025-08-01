import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { casesAPI } from '../services/api';

export default function CaseDetail() {
  const { id } = useParams();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCase();
  }, [id]);

  const loadCase = async () => {
    try {
      setLoading(true);
      const response = await casesAPI.getById(id);
      setCaseData(response.data);
      setError('');
    } catch (err) {
      console.error('Error loading case:', err);
      setError('Failed to load case details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading case details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="text-sm text-red-700">{error}</div>
        <button
          onClick={loadCase}
          className="mt-2 text-sm text-red-600 hover:text-red-500"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Case not found</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Case {caseData.case_number}
        </h1>
        <p className="mt-2 text-sm text-gray-700">
          Case details and management
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Client Information */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Client Information
            </h3>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{caseData.client_name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                <dd className="mt-1 text-sm text-gray-900">{caseData.client_phone || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{caseData.client_email || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Address</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {[
                    caseData.client_street_address,
                    caseData.client_suburb,
                    caseData.client_state,
                    caseData.client_postcode
                  ].filter(Boolean).join(', ') || 'N/A'}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* At-Fault Party Information */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              At-Fault Party Information
            </h3>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{caseData.at_fault_party_name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                <dd className="mt-1 text-sm text-gray-900">{caseData.at_fault_party_phone || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{caseData.at_fault_party_email || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Insurance</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {caseData.at_fault_party_insurance_company || 'N/A'}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Financial Information */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Financial Information
            </h3>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-6">
              <div>
                <dt className="text-sm font-medium text-gray-500">Invoiced</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  ${parseFloat(caseData.invoiced || 0).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Reserve</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  ${parseFloat(caseData.reserve || 0).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Agreed</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  ${parseFloat(caseData.agreed || 0).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Paid</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  ${parseFloat(caseData.paid || 0).toLocaleString()}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Case Status */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Case Status
            </h3>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6">
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    caseData.status === 'Active' 
                      ? 'bg-yellow-100 text-yellow-800'
                      : caseData.status === 'Invoiced'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {caseData.status}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd className="mt-1 text-sm text-gray-900">{caseData.last_updated}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Rental Company</dt>
                <dd className="mt-1 text-sm text-gray-900">{caseData.rental_company || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Lawyer</dt>
                <dd className="mt-1 text-sm text-gray-900">{caseData.lawyer || 'N/A'}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}