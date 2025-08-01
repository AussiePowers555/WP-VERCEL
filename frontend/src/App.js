import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Cases from './pages/Cases';
import CaseDetail from './pages/CaseDetail';
import Fleet from './pages/Fleet';
import Contacts from './pages/Contacts';
import Workspaces from './pages/Workspaces';
import Interactions from './pages/Interactions';
import Settings from './pages/Settings';
import Layout from './components/Layout';
import SignAgreement from './pages/SignAgreement';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Public Route component (redirects to dashboard if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  return !isAuthenticated ? children : <Navigate to="/" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            <Route path="/sign-agreement" element={<SignAgreement />} />
            
            {/* Protected Routes */}
            <Route 
              path="/*" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/cases" element={<Cases />} />
                      <Route path="/cases/:id" element={<CaseDetail />} />
                      <Route path="/fleet" element={<Fleet />} />
                      <Route path="/contacts" element={<Contacts />} />
                      <Route path="/workspaces" element={<Workspaces />} />
                      <Route path="/interactions" element={<Interactions />} />
                      <Route path="/settings" element={<Settings />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;