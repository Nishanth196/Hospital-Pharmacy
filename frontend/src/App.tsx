import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { CheckSubstitutionPage } from './pages/CheckSubstitutionPage';
import { DecisionResultPage } from './pages/DecisionResultPage';
import { HumanReviewPage } from './pages/HumanReviewPage';
import { OverridePage } from './pages/OverridePage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { MetricsPage } from './pages/MetricsPage';
import { TestCasesPage } from './pages/TestCasesPage';
import { AboutPage } from './pages/AboutPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Protected / Wrapped Clinical Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="check" element={<CheckSubstitutionPage />} />
          <Route path="result/:id" element={<DecisionResultPage />} />
          <Route path="human-review" element={<HumanReviewPage />} />
          <Route path="override" element={<OverridePage />} />
          <Route path="audit" element={<AuditLogsPage />} />
          <Route path="metrics" element={<MetricsPage />} />
          <Route path="test-cases" element={<TestCasesPage />} />
          <Route path="about" element={<AboutPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
