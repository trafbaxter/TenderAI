import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '../Pages/Layout';
import Dashboard from '../Pages/Dashboard';
import Portfolio from '../Pages/Portfolio';
import Opportunities from '../Pages/Opportunities';
import TenderAnalysis from '../Pages/TenderAnalysis';
import Integrations from '../Pages/Integrations';
import AgentSettings from '../Pages/AgentSettings';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <Layout currentPageName="Dashboard">
            <Dashboard />
          </Layout>
        } />
        <Route path="/portfolio" element={
          <Layout currentPageName="Portfolio">
            <Portfolio />
          </Layout>
        } />
        <Route path="/opportunities" element={
          <Layout currentPageName="Opportunities">
            <Opportunities />
          </Layout>
        } />
        <Route path="/analysis" element={
          <Layout currentPageName="Analysis">
            <TenderAnalysis />
          </Layout>
        } />
        <Route path="/integrations" element={
          <Layout currentPageName="Integrations">
            <Integrations />
          </Layout>
        } />
        <Route path="/settings" element={
          <Layout currentPageName="Settings">
            <AgentSettings />
          </Layout>
        } />
      </Routes>
    </Router>
  );
}

export default App;