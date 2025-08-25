import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './pages/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Opportunities from './pages/Opportunities.jsx';
import Portfolio from './pages/Portfolio.jsx';
import TenderAnalysis from './pages/TenderAnalysis.jsx';
import Integrations from './pages/Integrations.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={
          <Layout currentPageName="Dashboard">
            <Dashboard />
          </Layout>
        } />
        <Route path="/opportunities" element={
          <Layout currentPageName="Opportunities">
            <Opportunities />
          </Layout>
        } />
        <Route path="/portfolio" element={
          <Layout currentPageName="Portfolio">
            <Portfolio />
          </Layout>
        } />
        <Route path="/tender-analysis" element={
          <Layout currentPageName="TenderAnalysis">
            <TenderAnalysis />
          </Layout>
        } />
        <Route path="/integrations" element={
          <Layout currentPageName="Integrations">
            <Integrations />
          </Layout>
        } />
      </Routes>
    </Router>
  );
}

export default App;