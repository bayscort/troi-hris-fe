import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  CircleHelp,
  LayoutDashboard,
  Route,
  MapPin,
  Truck,
  SlidersHorizontal,
  User,
  UserCheck,
  BarChart2,
  LogOut,
  Lock,
  Building2,
  ChevronDown,
  ChevronRight,
  Menu,
  FilePlus2,
  FileText,
  BookOpen,
  Wallet,
  Package,
  IdCard,
  Shield,
  CreditCard,
  ScrollText,
  ArrowLeftRight,
  Coins,
} from 'lucide-react';

type SectionKey =
  | 'analytic'
  | 'general'
  | 'clientManagement'
  | 'employeeManagement'
  | 'workforceManagement'
  | 'timeAndAttendance'
  | 'payrollAndBilling'
  | 'finance'
  | 'userManagement'
  | 'dataManagement'
  | 'configuration'
  | 'support'
  | 'account';

const Sidebar = () => {
  const { authState, logout } = useAuth();
  const navigate = useNavigate();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [isCollapsed, setIsCollapsed] = useState<Record<SectionKey, boolean>>({
    analytic: true,
    general: true,
    clientManagement: true,
    employeeManagement: true,
    workforceManagement: true,
    timeAndAttendance: true,
    payrollAndBilling: true,
    finance: true,
    userManagement: true,
    dataManagement: true,
    configuration: true,
    support: true,
    account: true,
  });

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  const toggleSection = (section: SectionKey) => {
    setIsCollapsed((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const menuItems = [
    { name: 'Dashboard', path: '/combine-dashboard', icon: <LayoutDashboard size={20} className="mr-3" />, apiName: 'dashboard' },
    { name: 'Client Directory', path: '/client-directory', icon: <Coins size={20} className="mr-3" />, apiName: 'client-directory' },
    { name: 'Client Site', path: '/client-site', icon: <Coins size={20} className="mr-3" />, apiName: 'client-site' },
    { name: 'Active Employees', path: '/active-employees', icon: <Coins size={20} className="mr-3" />, apiName: 'active-employees' },
    { name: 'Talent Pool', path: '/talent-pool', icon: <Coins size={20} className="mr-3" />, apiName: 'talent-pool' },
    { name: 'Onboarding', path: '/onboarding', icon: <Coins size={20} className="mr-3" />, apiName: 'onboarding' },
    { name: 'Offboarding', path: '/offboarding', icon: <Coins size={20} className="mr-3" />, apiName: 'offboarding' },
    { name: 'Document Center', path: '/document-center', icon: <Coins size={20} className="mr-3" />, apiName: 'document-center' },
    { name: 'Active Placement', path: '/active-placement', icon: <Coins size={20} className="mr-3" />, apiName: 'active-placement' },
    { name: 'Deploy Employee', path: '/deploy-employee', icon: <Coins size={20} className="mr-3" />, apiName: 'deploy-employee' },
    { name: 'Expiring Contract', path: '/expiring-contract', icon: <Coins size={20} className="mr-3" />, apiName: 'expiring-contract' },
    { name: 'Attendance Logs', path: '/attendance-log', icon: <BarChart2 size={20} className="mr-3" />, apiName: 'attendance-log' },
    { name: 'Finance Report', path: '/combine-finance-report', icon: <Coins size={20} className="mr-3" />, apiName: 'combine-finance-report' },
    { name: 'Trip', path: '/trip', icon: <Route size={20} className="mr-3" />, apiName: 'trip' },
    { name: 'Fund Request', path: '/fund-request', icon: <FilePlus2 size={20} className="mr-3" />, apiName: 'fund-request' },
    { name: 'Receipt', path: '/receipt', icon: <FileText size={20} className="mr-3" />, apiName: 'receipt' },
    { name: 'Expenditure', path: '/expenditure', icon: <CreditCard size={20} className="mr-3" />, apiName: 'expenditure' },
    { name: 'Ledger', path: '/ledger', icon: <BookOpen size={20} className="mr-3" />, apiName: 'ledger' },
    { name: 'Bank Statement', path: '/bank-statement', icon: <ScrollText size={20} className="mr-3" />, apiName: 'bank-statement' },
    { name: 'Reconciliation', path: '/reconciliation', icon: <ArrowLeftRight size={20} className="mr-3" />, apiName: 'reconciliation' },
    { name: 'User', path: '/user', icon: <User size={20} className="mr-3" />, apiName: 'user' },
    { name: 'Role', path: '/role', icon: <Shield size={20} className="mr-3" />, apiName: 'role' },
    { name: 'Location', path: '/location', icon: <MapPin size={20} className="mr-3" />, apiName: 'location' },
    { name: 'Driver', path: '/driver', icon: <IdCard size={20} className="mr-3" />, apiName: 'driver' },
    { name: 'Contractor', path: '/contractor', icon: <Building2 size={20} className="mr-3" />, apiName: 'contractor' },
    { name: 'Vehicle', path: '/vehicle', icon: <Truck size={20} className="mr-3" />, apiName: 'vehicle' },
    { name: 'Finance Item', path: '/finance-item', icon: <Package size={20} className="mr-3" />, apiName: 'finance-item' },
    { name: 'Finance Account', path: '/account', icon: <Wallet size={20} className="mr-3" />, apiName: 'account' },
    { name: 'Rate', path: '/rate', icon: <SlidersHorizontal size={20} className="mr-3" />, apiName: 'rate-configuration' },
    { name: 'Role Permission', path: '/role-permission-configuration', icon: <Lock size={20} className="mr-3" />, apiName: 'role-permission-configuration' },
    { name: 'Help Center', path: '/contact-support', icon: <CircleHelp size={20} className="mr-3" />, apiName: null },
  ];

  const filteredMenuItems = menuItems.filter((item) => {
    if (!item.apiName) return true;
    return authState.menus.some(
      (menu) => menu.name.toLowerCase() === item.apiName.toLowerCase()
    );
  });

  return (
    <div
      className={`${isSidebarCollapsed ? 'w-16' : 'w-64'
        } h-screen bg-gray-50 shadow-sm flex flex-col font-sans transition-all duration-300`}
    >
      <div className="flex items-center justify-between px-4 py-6 shrink-0">
        {!isSidebarCollapsed && (
          <div
            className="flex items-center space-x-3 cursor-pointer hover:bg-gray-100 transition-colors duration-200 rounded-md p-2"
            onClick={() => navigate('/home')}
          >
            <img
              src="/logo.jpeg"
              alt="Logo PT TROI"
              className="h-8 w-8 rounded-xl border border-gray-200 shadow-sm"
            />
            <h2 className="text-xl font-semibold text-gray-800 tracking-tight">
              Trust Offshore International
            </h2>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md hover:bg-gray-100 transition-colors duration-200"
        >
          {isSidebarCollapsed ? <ChevronRight size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-6">
        <div className="bg-gray-100 rounded-md p-2 mb-4">
          {filteredMenuItems
            .filter((item) => item.name === 'Dashboard')
            .map((item) => (
              <div
                key={item.name}
                className="flex items-center px-3 py-2 text-gray-800 rounded-md bg-white shadow-sm cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                onClick={() => navigate(item.path)}
                title={isSidebarCollapsed ? item.name : ''}
              >
                {item.icon}
                {!isSidebarCollapsed && (
                  <span className="font-medium text-sm">{item.name}</span>
                )}
              </div>
            ))}
        </div>

        <div className="mb-4">
          <div
            className="flex items-center justify-between px-3 py-2 text-gray-500 cursor-pointer hover:bg-gray-100 rounded-md transition-colors duration-200"
            onClick={() => toggleSection('clientManagement')}
            title={isSidebarCollapsed ? 'Client Management' : ''}
          >
            {!isSidebarCollapsed && (
              <p className="text-xs font-semibold tracking-wide">CLIENT MANAGEMENT</p>
            )}
            {!isSidebarCollapsed && (
              <ChevronDown
                size={16}
                className={`text-gray-500 transform transition-transform duration-200 ${isCollapsed.clientManagement ? 'rotate-0' : 'rotate-180'
                  }`}
              />
            )}
            {isSidebarCollapsed && <UserCheck size={20} />}
          </div>
          {!isCollapsed.clientManagement && !isSidebarCollapsed && (
            <ul className="space-y-1 mt-2">
              {filteredMenuItems
                .filter((item) => ['Client Directory', 'Client Site'].includes(item.name))
                .map((item) => (
                  <li
                    key={item.name}
                    className="flex items-center px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md cursor-pointer text-sm transition-colors duration-200"
                    onClick={() => navigate(item.path)}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </li>
                ))}
            </ul>
          )}
        </div>

        <div className="mb-4">
          <div
            className="flex items-center justify-between px-3 py-2 text-gray-500 cursor-pointer hover:bg-gray-100 rounded-md transition-colors duration-200"
            onClick={() => toggleSection('employeeManagement')}
            title={isSidebarCollapsed ? 'Employee Management' : ''}
          >
            {!isSidebarCollapsed && (
              <p className="text-xs font-semibold tracking-wide">EMPLOYEE MANAGEMENT</p>
            )}
            {!isSidebarCollapsed && (
              <ChevronDown
                size={16}
                className={`text-gray-500 transform transition-transform duration-200 ${isCollapsed.employeeManagement ? 'rotate-0' : 'rotate-180'
                  }`}
              />
            )}
            {isSidebarCollapsed && <UserCheck size={20} />}
          </div>
          {!isCollapsed.employeeManagement && !isSidebarCollapsed && (
            <ul className="space-y-1 mt-2">
              {filteredMenuItems
                .filter((item) => ['Active Employees', 'Talent Pool', 'Onboarding', 'Offboarding', 'Document Center'].includes(item.name))
                .map((item) => (
                  <li
                    key={item.name}
                    className="flex items-center px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md cursor-pointer text-sm transition-colors duration-200"
                    onClick={() => navigate(item.path)}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </li>
                ))}
            </ul>
          )}
        </div>

        <div className="mb-4">
          <div
            className="flex items-center justify-between px-3 py-2 text-gray-500 cursor-pointer hover:bg-gray-100 rounded-md transition-colors duration-200"
            onClick={() => toggleSection('workforceManagement')}
            title={isSidebarCollapsed ? 'Workforce Management' : ''}
          >
            {!isSidebarCollapsed && (
              <p className="text-xs font-semibold tracking-wide">WORKFORCE MANAGEMENT</p>
            )}
            {!isSidebarCollapsed && (
              <ChevronDown
                size={16}
                className={`text-gray-500 transform transition-transform duration-200 ${isCollapsed.workforceManagement ? 'rotate-0' : 'rotate-180'
                  }`}
              />
            )}
            {isSidebarCollapsed && <UserCheck size={20} />}
          </div>
          {!isCollapsed.workforceManagement && !isSidebarCollapsed && (
            <ul className="space-y-1 mt-2">
              {filteredMenuItems
                .filter((item) => ['Active Placement', 'Deploy Employee', 'Expiring Contract'].includes(item.name))
                .map((item) => (
                  <li
                    key={item.name}
                    className="flex items-center px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md cursor-pointer text-sm transition-colors duration-200"
                    onClick={() => navigate(item.path)}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </li>
                ))}
            </ul>
          )}
        </div>

        <div className="mb-4">
          <div
            className="flex items-center justify-between px-3 py-2 text-gray-500 cursor-pointer hover:bg-gray-100 rounded-md transition-colors duration-200"
            onClick={() => toggleSection('timeAndAttendance')}
            title={isSidebarCollapsed ? 'Time And Attendance' : ''}
          >
            {!isSidebarCollapsed && (
              <p className="text-xs font-semibold tracking-wide">TIME AND ATTENDANCE</p>
            )}
            {!isSidebarCollapsed && (
              <ChevronDown
                size={16}
                className={`text-gray-500 transform transition-transform duration-200 ${isCollapsed.timeAndAttendance ? 'rotate-0' : 'rotate-180'
                  }`}
              />
            )}
            {isSidebarCollapsed && <UserCheck size={20} />}
          </div>
          {!isCollapsed.workforceManagement && !isSidebarCollapsed && (
            <ul className="space-y-1 mt-2">
              {filteredMenuItems
                .filter((item) => ['Attendance Logs'].includes(item.name))
                .map((item) => (
                  <li
                    key={item.name}
                    className="flex items-center px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md cursor-pointer text-sm transition-colors duration-200"
                    onClick={() => navigate(item.path)}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </li>
                ))}
            </ul>
          )}
        </div>

        <div className="mb-4">
          <div
            className="flex items-center justify-between px-3 py-2 text-gray-500 cursor-pointer hover:bg-gray-100 rounded-md transition-colors duration-200"
            onClick={() => toggleSection('userManagement')}
            title={isSidebarCollapsed ? 'User Management' : ''}
          >
            {!isSidebarCollapsed && (
              <p className="text-xs font-semibold tracking-wide">USER MANAGEMENT</p>
            )}
            {!isSidebarCollapsed && (
              <ChevronDown
                size={16}
                className={`text-gray-500 transform transition-transform duration-200 ${isCollapsed.userManagement ? 'rotate-0' : 'rotate-180'
                  }`}
              />
            )}
            {isSidebarCollapsed && <UserCheck size={20} />}
          </div>
          {!isCollapsed.userManagement && !isSidebarCollapsed && (
            <ul className="space-y-1 mt-2">
              {filteredMenuItems
                .filter((item) => ['User', 'Role'].includes(item.name))
                .map((item) => (
                  <li
                    key={item.name}
                    className="flex items-center px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md cursor-pointer text-sm transition-colors duration-200"
                    onClick={() => navigate(item.path)}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </li>
                ))}
            </ul>
          )}
        </div>

        <div className="mb-4">
          <div
            className="flex items-center justify-between px-3 py-2 text-gray-500 cursor-pointer hover:bg-gray-100 rounded-md transition-colors duration-200"
            onClick={() => toggleSection('configuration')}
            title={isSidebarCollapsed ? 'Configuration' : ''}
          >
            {!isSidebarCollapsed && (
              <p className="text-xs font-semibold tracking-wide">CONFIGURATION</p>
            )}
            {!isSidebarCollapsed && (
              <ChevronDown
                size={16}
                className={`text-gray-500 transform transition-transform duration-200 ${isCollapsed.configuration ? 'rotate-0' : 'rotate-180'
                  }`}
              />
            )}
            {isSidebarCollapsed && <SlidersHorizontal size={20} />}
          </div>
          {!isCollapsed.configuration && !isSidebarCollapsed && (
            <ul className="space-y-1 mt-2">
              {filteredMenuItems
                .filter((item) => ['Rate', 'Role Permission'].includes(item.name))
                .map((item) => (
                  <li
                    key={item.name}
                    className="flex items-center px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md cursor-pointer text-sm transition-colors duration-200"
                    onClick={() => navigate(item.path)}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </li>
                ))}
            </ul>
          )}
        </div>

        <div className="mb-4">
          <div
            className="flex items-center justify-between px-3 py-2 text-gray-500 cursor-pointer hover:bg-gray-100 rounded-md transition-colors duration-200"
            onClick={() => toggleSection('support')}
            title={isSidebarCollapsed ? 'Support' : ''}
          >
            {!isSidebarCollapsed && (
              <p className="text-xs font-semibold tracking-wide">SUPPORT</p>
            )}
            {!isSidebarCollapsed && (
              <ChevronDown
                size={16}
                className={`text-gray-500 transform transition-transform duration-200 ${isCollapsed.support ? 'rotate-0' : 'rotate-180'
                  }`}
              />
            )}
            {isSidebarCollapsed && <CircleHelp size={20} />}
          </div>
          {!isCollapsed.support && !isSidebarCollapsed && (
            <ul className="space-y-1 mt-2">
              {filteredMenuItems
                .filter((item) => ['Help Center'].includes(item.name))
                .map((item) => (
                  <li
                    key={item.name}
                    className="flex items-center px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md cursor-pointer text-sm transition-colors duration-200"
                    onClick={() => navigate(item.path)}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </li>
                ))}
            </ul>
          )}
        </div>

        <div className="mb-4">
          <div
            className="flex items-center justify-between px-3 py-2 text-gray-500 cursor-pointer hover:bg-gray-100 rounded-md transition-colors duration-200"
            onClick={() => toggleSection('account')}
            title={isSidebarCollapsed ? 'Account' : ''}
          >
            {!isSidebarCollapsed && (
              <p className="text-xs font-semibold tracking-wide">ACCOUNT</p>
            )}
            {!isSidebarCollapsed && (
              <ChevronDown
                size={16}
                className={`text-gray-500 transform transition-transform duration-200 ${isCollapsed.account ? 'rotate-0' : 'rotate-180'
                  }`}
              />
            )}
            {isSidebarCollapsed && <LogOut size={20} />}
          </div>
          {!isCollapsed.account && !isSidebarCollapsed && (
            <ul className="space-y-1 mt-2">
              <li
                className="flex items-center px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md cursor-pointer text-sm transition-colors duration-200"
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
              >
                <LogOut size={20} className="mr-3" />
                <span>Logout</span>
              </li>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;