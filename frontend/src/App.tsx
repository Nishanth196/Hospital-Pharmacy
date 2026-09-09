import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { LoginDemo } from './components/LoginDemo';
import { Dashboard } from './components/Dashboard';
import { PrescriptionQueue } from './components/PrescriptionQueue';
import { SubstitutionChecklist } from './components/SubstitutionChecklist';
import { EscalationCenter } from './components/EscalationCenter';
import { AuditHistory } from './components/AuditHistory';
import { ValidationDashboard } from './components/ValidationDashboard';

export const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true); // Default logged in for smooth demo
  const [currentUserRole, setCurrentUserRole] = useState<string>('Pharmacist');
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<number | null>(null);

  const handleLogin = (role: string) => {
    setCurrentUserRole(role);
    setIsLoggedIn(true);
    setCurrentTab('dashboard');
  };

  const handleSelectPrescription = (id: number) => {
    setSelectedPrescriptionId(id);
    setCurrentTab('checklist');
  };

  // Demo Journey triggers
  const handleRunRoutineJourney = () => {
    // RX-10001 is routine case (ID 1)
    setSelectedPrescriptionId(1);
    setCurrentTab('checklist');
  };

  const handleRunEmergencyJourney = () => {
    // RX-10002 is emergency case (ID 2)
    setSelectedPrescriptionId(2);
    setCurrentTab('checklist');
  };

  if (!isLoggedIn) {
    return <LoginDemo onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <div>
        <Navbar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          currentUserRole={currentUserRole}
          setCurrentUserRole={setCurrentUserRole}
          onRunRoutineJourney={handleRunRoutineJourney}
          onRunEmergencyJourney={handleRunEmergencyJourney}
        />

        <main className="max-w-7xl mx-auto px-4 py-6">
          {currentTab === 'dashboard' && (
            <Dashboard
              onSelectPrescription={handleSelectPrescription}
              onOpenValidation={() => setCurrentTab('validation')}
            />
          )}

          {currentTab === 'queue' && (
            <PrescriptionQueue onSelectPrescription={handleSelectPrescription} />
          )}

          {currentTab === 'checklist' && (
            <SubstitutionChecklist
              prescriptionId={selectedPrescriptionId || 1}
              currentUserRole={currentUserRole}
              onBackToQueue={() => setCurrentTab('queue')}
            />
          )}

          {currentTab === 'escalations' && (
            <EscalationCenter onSelectPrescription={handleSelectPrescription} />
          )}

          {currentTab === 'audit' && <AuditHistory />}

          {currentTab === 'validation' && <ValidationDashboard />}
        </main>
      </div>

      {/* Global Clinical Disclaimer Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-4 px-4 text-center text-xs text-slate-500 space-y-1">
        <p className="font-semibold text-slate-400">
          Hospital Pharmacy Substitution Decision Support Prototype
        </p>
        <p>
          "Prototype for clinical decision support. Not intended for autonomous prescribing or dispensing."
        </p>
      </footer>
    </div>
  );
};

export default App;
