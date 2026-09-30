import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pill, ShieldCheck, UserCheck, AlertTriangle } from 'lucide-react';

const PRESET_USERS = [
  {
    userId: 'PHARM-101',
    name: 'Dr. Sarah Lin, PharmD',
    role: 'Clinical Pharmacist',
    department: 'Central Inpatient Pharmacy',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    userId: 'PHARM-202',
    name: 'James Miller, RPh',
    role: 'Senior Pharmacy Specialist',
    department: 'Cardiology & Acute Care',
    badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  {
    userId: 'DOC-301',
    name: 'Dr. Alex Thorne, MD',
    role: 'Attending Physician',
    department: 'Intensive Care Unit (ICU)',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  {
    userId: 'CHIEF-001',
    name: 'Dr. Eleanor Vance, PharmD',
    role: 'Chief Pharmacy Officer',
    department: 'Pharmacy Governance & Formulary Committee',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
  },
];

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState(PRESET_USERS[0]);

  const handleLogin = (userToLogin = selectedUser) => {
    localStorage.setItem('hospital_pharmacy_user', JSON.stringify(userToLogin));
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="p-3 bg-hospital-600 rounded-2xl text-white shadow-md">
            <Pill size={36} className="rotate-45" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-extrabold text-slate-900 tracking-tight">
          Hospital Pharmacy DSS
        </h2>
        <p className="mt-1 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Substitution Decision Support System
        </p>

        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 flex items-start gap-2">
          <AlertTriangle size={16} className="shrink-0 mt-0.5 text-amber-600" />
          <span>
            <strong>Academic Prototype:</strong> Synthetic credentials for software demonstration and validation. Select a persona below to enter.
          </span>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-10">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <UserCheck size={18} className="text-hospital-600" />
            Select Clinical Persona
          </h3>

          <div className="space-y-3">
            {PRESET_USERS.map((user) => {
              const isSelected = selectedUser.userId === user.userId;
              return (
                <div
                  key={user.userId}
                  onClick={() => {
                    setSelectedUser(user);
                  }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-hospital-500 bg-hospital-50/40 ring-2 ring-hospital-500/20'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{user.name}</h4>
                      <p className="text-xs text-slate-500">{user.department}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${user.badgeColor}`}>
                      {user.role}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => handleLogin(selectedUser)}
            className="mt-6 w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent rounded-xl shadow-xs text-sm font-bold text-white bg-hospital-600 hover:bg-hospital-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-hospital-500 transition-colors"
          >
            <ShieldCheck size={18} />
            <span>Launch Clinical Workspace</span>
          </button>
        </div>
      </div>
    </div>
  );
};
