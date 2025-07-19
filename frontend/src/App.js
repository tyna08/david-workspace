import React, { useState } from 'react';
import CollaborationPlatform from './CollaborationPlatform';
import { BookOpen, User, ArrowRight } from 'lucide-react';
import './App.css';

function App() {
  const [user, setUser] = useState(null);

  const handleQuickLogin = (role) => {
    // Create a mock user for testing
    const mockUser = {
      _id: '123456',
      name: role === 'tutor' ? 'Mr Raj' : 'The Lord is my Strength',
      email: role === 'tutor' ? 'tutor@test.com' : 'student@test.com',
      role: role
    };
    
    // Save to localStorage so it persists on refresh
    localStorage.setItem('user', JSON.stringify(mockUser));
    setUser(mockUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  // Check if user is already "logged in"
  React.useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // If no user, show quick login options
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">David Nwokoloh Learning Workspace</h1>
            <p className="text-gray-600 mt-2">Quick Access (Test Mode)</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">Select Your Role</h2>
            
            <div className="space-y-4">
              <button
                onClick={() => handleQuickLogin('student')}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center group"
              >
                <User className="h-5 w-5 mr-3" />
                <span>Enter as Student</span>
                <ArrowRight className="h-5 w-5 ml-3 transform group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => handleQuickLogin('tutor')}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-4 rounded-lg font-medium hover:from-purple-600 hover:to-purple-700 transition-all flex items-center justify-center group"
              >
                <User className="h-5 w-5 mr-3" />
                <span>Enter as Tutor</span>
                <ArrowRight className="h-5 w-5 ml-3 transform group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => handleQuickLogin('admin')}
                className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white py-4 rounded-lg font-medium hover:from-gray-700 hover:to-gray-800 transition-all flex items-center justify-center group"
              >
                <User className="h-5 w-5 mr-3" />
                <span>Enter as Admin</span>
                <ArrowRight className="h-5 w-5 ml-3 transform group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 text-center">
                <strong>Test Mode:</strong> Authentication is disabled. Click any role to access the platform.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If logged in, show main app
  return <CollaborationPlatform user={user} onLogout={handleLogout} />;
}

export default App;