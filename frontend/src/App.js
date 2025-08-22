import React from 'react';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">TenderMatch AI</h1>
          <p className="text-gray-600">Intelligent Tender Management Platform</p>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Welcome to TenderMatch AI</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900">Dashboard</h3>
                <p className="text-blue-700">Overview of your tender activities</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900">Opportunities</h3>
                <p className="text-green-700">Discover new tender opportunities</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-900">Portfolio</h3>
                <p className="text-purple-700">Manage your project portfolio</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">API Status</h2>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  Backend API Ready
                </p>
                <p className="text-sm text-gray-500">
                  FastAPI backend is configured and ready for deployment
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;