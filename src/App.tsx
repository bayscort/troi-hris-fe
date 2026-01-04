import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/LoginPage';
import Sidebar from './components/Sidebar';
import LocationManagement from './pages/LocationManagement';
import RateConfiguration from './pages/RateConfiguration';
import DriversPage from './pages/DriversPage';
import ContractorsPage from './pages/ContractorsPage';
import VehiclesPage from './pages/VehiclesPage';
import CombineReport from './pages/CombineReport';
import TripsPage from './pages/TripsPage';
import HomePage from './pages/HomePage';
import UsersPage from './pages/UserPage';
import RolesPage from './pages/RolesPage';
import RolePermissionsPage from './pages/RolePermissionsPage';
import ContactSupportPage from './pages/ContactSupportPage';
import FinanceItemPage from './pages/FinanceItem';
import FundRequestPage from './pages/FundRequestPage';
import AccountsPage from './pages/AccountPage';
import LedgerPage from './pages/LedgerPage';
import ReceiptPage from './pages/ReceiptPage';
import ExpenditurePage from './pages/ExpenditurePage';
import BankStatementPage from './pages/BankStatementPage';
import ReconciliationPage from './pages/ReconciliationPage';
import CombineDashboard from './pages/CombineDashboard';
import CombineFinanceReport from './pages/CombineFinanceReport';
import ClientsPage from './pages/ClientsPage';
import ActiveEmployeesPage from './pages/ActiveEmployeesPage';
import TalentPoolEmployeesPage from './pages/TalentPoolEmployeePage';
import OnboardEmployeePage from './pages/OnboardEmployeePage';
import CombineEmployee from './pages/CombineEmployee';
import ShiftMasterPage from './pages/ShiftMasterPage';

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
                      <Route path="/combine-dashboard" element={<CombineDashboard />} />
                      <Route path="/client-directory" element={<ClientsPage />} />
                      <Route path="/employees" element={<CombineEmployee />} />
                      <Route path="/shift-master" element={<ShiftMasterPage />} />
                      <Route path="/talent-pool" element={<TalentPoolEmployeesPage />} />
                      <Route path="/onboarding" element={<OnboardEmployeePage />} />
                      <Route path="/trip" element={<TripsPage />} />
                      <Route path="/finance-item" element={<FinanceItemPage />} />
                      <Route path="/account" element={<AccountsPage />} />
                      <Route path="/fund-request" element={<FundRequestPage />} />
                      <Route path="/ledger" element={<LedgerPage />} />
                      <Route path="/receipt" element={<ReceiptPage />} />
                      <Route path="/expenditure" element={<ExpenditurePage />} />
                      <Route path="/bank-statement" element={<BankStatementPage />} />
                      <Route path="/reconciliation" element={<ReconciliationPage />} />
                      <Route path="/user" element={<UsersPage />} />
                      <Route path="/role" element={<RolesPage />} />
                      <Route path="/driver" element={<DriversPage />} />
                      <Route path="/location" element={<LocationManagement />} />
                      <Route path="/rate" element={<RateConfiguration />} />
                      <Route path="/role-permission-configuration" element={<RolePermissionsPage />} />
                      <Route path="/contractor" element={<ContractorsPage />} />
                      <Route path="/vehicle" element={<VehiclesPage />} />
                      <Route path="/combine-report" element={<CombineReport />} />
                      <Route path="/combine-finance-report" element={<CombineFinanceReport />} />
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
