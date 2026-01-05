import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  CircleHelp,
  MapPin,
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
  Shield,
  CalendarDays,
  Database,
  Repeat,
  Users,
  Send,
} from 'lucide-react';

type SectionKey =
  | 'clientManagement'
  | 'employeeManagement'
  | 'workforceManagement'
  | 'timeAndAttendance'
  | 'shiftManagement'
  | 'userManagement'
  | 'configuration'
  | 'support'
  | 'account';

const Sidebar = () => {
  const { authState, logout } = useAuth();
  const navigate = useNavigate();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [isCollapsed, setIsCollapsed] = useState<Record<SectionKey, boolean>>({
    clientManagement: true,
    employeeManagement: true,
    workforceManagement: true,
    timeAndAttendance: true,
    shiftManagement: true,
    userManagement: true,
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
    
    { name: 'Client Directory', path: '/client-directory', icon: <Building2 size={20} className="mr-3" />, apiName: 'client-directory' },
    { name: 'Client Site', path: '/client-site', icon: <MapPin size={20} className="mr-3" />, apiName: 'client-site' },
    { name: 'Employees', path: '/employees', icon: <Users size={20} className="mr-3" />, apiName: 'employees' },
    { name: 'Active Placement', path: '/active-placement', icon: <UserCheck size={20} className="mr-3" />, apiName: 'active-placement' },
    { name: 'Deploy Employee', path: '/deploy-employee', icon: <Send size={20} className="mr-3" />, apiName: 'deploy-employee' },
    { name: 'Attendance Logs', path: '/attendance-log', icon: <BarChart2 size={20} className="mr-3" />, apiName: 'attendance-log' },
    { name: 'Shift Roster', path: '/shift-roster', icon: <CalendarDays size={20} className="mr-3" />, apiName: 'shift-roster' },
    { name: 'Shift Assignment', path: '/shift-assignment', icon: <UserCheck size={20} className="mr-3" />, apiName: 'shift-assignment' },
    { name: 'Shift Master', path: '/shift-master', icon: <Database size={20} className="mr-3" />, apiName: 'shift-master' },
    { name: 'Shift Pattern', path: '/shift-pattern', icon: <Repeat size={20} className="mr-3" />, apiName: 'shift-pattern' },
    { name: 'User', path: '/user', icon: <User size={20} className="mr-3" />, apiName: 'user' },
    { name: 'Role', path: '/role', icon: <Shield size={20} className="mr-3" />, apiName: 'role' },
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
              TROI HRIS
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
                .filter((item) => ['Employees'].includes(item.name))
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
                .filter((item) => ['Active Placement', 'Deploy Employee'].includes(item.name))
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
          {!isCollapsed.timeAndAttendance && !isSidebarCollapsed && (
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
            onClick={() => toggleSection('shiftManagement')}
            title={isSidebarCollapsed ? 'Shift Management' : ''}
          >
            {!isSidebarCollapsed && (
              <p className="text-xs font-semibold tracking-wide">SHIFT MANAGEMENT</p>
            )}
            {!isSidebarCollapsed && (
              <ChevronDown
                size={16}
                className={`text-gray-500 transform transition-transform duration-200 ${isCollapsed.shiftManagement ? 'rotate-0' : 'rotate-180'
                  }`}
              />
            )}
            {isSidebarCollapsed && <UserCheck size={20} />}
          </div>
          {!isCollapsed.shiftManagement && !isSidebarCollapsed && (
            <ul className="space-y-1 mt-2">
              {filteredMenuItems
                .filter((item) => ['Shift Roster', 'Shift Assignment', 'Shift Master', 'Shift Pattern'].includes(item.name))
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