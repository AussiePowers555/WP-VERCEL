import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { signatureAPI } from '../services/api';

export default function SignAgreement() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tokenData, setTokenData] = useState(null);
  const [signed, setSigned] = useState(false);
  const [signerName, setSignerName] = useState('');

  useEffect(() => {
    if (token) {
      validateToken();
    } else {
      setError('No signature token provided');
      setLoading(false);
    }
  }, [token]);

  const validateToken = async () => {
    try {
      setLoading(true);
      const response = await signatureAPI.validateToken({ token });
      setTokenData(response.data.token);
      setError('');
    } catch (err) {
      console.error('Error validating token:', err);
      setError(err.response?.data?.error || 'Invalid or expired token');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!signerName.trim()) {
      setError('Please enter your name');
      return;
    }

    try {
      setLoading(true);
      await signatureAPI.submit({
        token,
        signatureData: `Signed by ${signerName} on ${new Date().toISOString()}`,
        signerName,
        ipAddress: '', // Would be set by backend
        userAgent: navigator.userAgent
      });
      
      setSigned(true);
      setError('');
    } catch (err) {
      console.error('Error submitting signature:', err);
      setError(err.response?.data?.error || 'Failed to submit signature');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full">
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (signed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full text-center">
          <div className="rounded-md bg-green-50 p-4">
            <div className="text-sm text-green-700">
              Document signed successfully! You can now close this window.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign Agreement
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {tokenData?.document_type} for Case {tokenData?.case_id}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="signerName" className="block text-sm font-medium text-gray-700">
              Your Full Name
            </label>
            <input
              id="signerName"
              name="signerName"
              type="text"
              required
              className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Enter your full name"
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Agreement Terms</h3>
            <p className="text-sm text-gray-600">
              By signing this document, you agree to the terms and conditions of the motorcycle rental agreement.
              This is a legally binding document.
            </p>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing...' : 'Sign Agreement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}