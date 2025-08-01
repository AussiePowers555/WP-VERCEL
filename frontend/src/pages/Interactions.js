import React, { useState, useEffect } from 'react';
import { interactionsAPI } from '../services/api';

export default function Interactions() {
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadInteractions();
  }, []);

  const loadInteractions = async () => {
    try {
      setLoading(true);
      const response = await interactionsAPI.getAll();
      setInteractions(response.data);
      setError('');
    } catch (err) {
      console.error('Error loading interactions:', err);
      setError('Failed to load interactions');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading interactions...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Interactions</h1>
        <p className="mt-2 text-sm text-gray-700">
          Case interaction history and communications
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <div className="text-sm text-red-700">{error}</div>
          <button
            onClick={loadInteractions}
            className="mt-2 text-sm text-red-600 hover:text-red-500"
          >
            Try again
          </button>
        </div>
      )}

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {interactions.length === 0 ? (
            <p className="text-gray-500">No interactions found</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {interactions.map((interaction) => (
                <li key={interaction.id} className="py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-medium text-gray-900">
                          Case {interaction.case_number}
                        </h3>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-500">{interaction.source}</span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">
                        <strong>Method:</strong> {interaction.method} | 
                        <strong> Situation:</strong> {interaction.situation}
                      </p>
                      <p className="mt-1 text-sm text-gray-600">
                        <strong>Action:</strong> {interaction.action}
                      </p>
                      <p className="mt-1 text-sm text-gray-600">
                        <strong>Outcome:</strong> {interaction.outcome}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(interaction.timestamp).toLocaleString()}
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