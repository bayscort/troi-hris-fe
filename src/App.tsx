import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/LoginPage';
import Sidebar from './components/Sidebar';
import HomePage from './pages/HomePage';
import RolesPage from './pages/RolesPage';
import RolePermissionsPage from './pages/RolePermissionsPage';
import ContactSupportPage from './pages/ContactSupportPage';
import ClientsPage from './pages/ClientsPage';
import ClientsSitePage from './pages/ClientsSitePage';
import TalentPoolEmployeesPage from './pages/TalentPoolEmployeePage';
import OnboardEmployeePage from './pages/OnboardEmployeePage';
import CombineEmployee from './pages/CombineEmployee';
import ShiftMasterPage from './pages/ShiftMasterPage';
import ShiftPatternPage from './pages/ShiftPatternPage';
import ShiftAssignmentPage from './pages/ShiftAssignmentPage';
import ShiftRosterPage from './pages/ShiftRosterPage';
import DeploymentPage from './pages/DeploymentPage';
import AttendanceLogPage from './pages/AttendanceLogPage';

export function App() {
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <div className="flex h-screen w-screen overflow-hidden" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <Sidebar />
                  <div className="flex-1 overflow-y-auto">
                    <Routes>
                      <Route path="/home" element={<HomePage />} />
                      <Route path="/client-directory" element={<ClientsPage />} />
                      <Route path="/client-site" element={<ClientsSitePage />} />
                      <Route path="/attendance-log" element={<AttendanceLogPage />} />
                      <Route path="/employees" element={<CombineEmployee />} />
                      <Route path="/deploy-employee" element={<DeploymentPage />} />
                      <Route path="/shift-roster" element={<ShiftRosterPage />} />
                      <Route path="/shift-assignment" element={<ShiftAssignmentPage />} />
                      <Route path="/shift-master" element={<ShiftMasterPage />} />
                      <Route path="/shift-pattern" element={<ShiftPatternPage />} />
                      <Route path="/talent-pool" element={<TalentPoolEmployeesPage />} />
                      <Route path="/onboarding" element={<OnboardEmployeePage />} />
                      <Route path="/role" element={<RolesPage />} />
                      <Route path="/role-permission-configuration" element={<RolePermissionsPage />} />
                      <Route path="/contact-support" element={<ContactSupportPage />} />

                    </Routes>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
