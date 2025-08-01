import React, { useState, useEffect } from 'react';
import { contactsAPI } from '../services/api';
import { UsersIcon, PlusIcon } from '@heroicons/react/24/outline';

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const response = await contactsAPI.getAll();
      setContacts(response.data);
      setError('');
    } catch (err) {
      console.error('Error loading contacts:', err);
      setError('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Lawyer':
        return 'bg-blue-100 text-blue-800';
      case 'Rental Company':
        return 'bg-green-100 text-green-800';
      case 'Insurance':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading contacts...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="sm:flex sm:items-center mb-6">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage lawyers, rental companies, and other contacts
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Add Contact
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <div className="text-sm text-red-700">{error}</div>
          <button
            onClick={loadContacts}
            className="mt-2 text-sm text-red-600 hover:text-red-500"
          >
            Try again
          </button>
        </div>
      )}

      {/* Contacts List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {contacts.length === 0 ? (
          <div className="text-center py-12">
            <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No contacts</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding a new contact.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {contacts.map((contact) => (
              <li key={contact.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="text-sm font-medium text-gray-900">
                        {contact.name}
                      </h3>
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(contact.type)}`}>
                        {contact.type}
                      </span>
                    </div>
                    {contact.company && (
                      <p className="mt-1 text-sm text-gray-500">{contact.company}</p>
                    )}
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                      {contact.phone && (
                        <span>{contact.phone}</span>
                      )}
                      {contact.email && (
                        <span>{contact.email}</span>
                      )}
                    </div>
                    {contact.address && (
                      <p className="mt-1 text-sm text-gray-500">{contact.address}</p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}