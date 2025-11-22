import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { ProductDetail } from './components/ProductDetail';
import { DealsPage } from './components/deals/DealsPage';
import { AlertsPage } from './components/alerts/AlertsPage';
import { ToastProvider } from './components/common/ToastProvider';

const App: React.FC = () => {
  return (
    <ToastProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/deals" element={<DealsPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/product/:id" element={<ProductDetail />} />
          </Routes>
        </Layout>
      </Router>
    </ToastProvider>
  );
};

export default App;