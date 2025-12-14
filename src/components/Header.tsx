import React, { useState } from 'react';
import { ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
}

const Header: React.FC<HeaderProps> = ({ }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { authState, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userName = authState.username || 'Guest';
  const userRole = authState.role || 'Unknown';

  return (
    <div className="px-8 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Hi, {userName}</h1>
        </div>
        <div className="flex items-center">
          <div className="relative">
            <div
              className="flex items-center cursor-pointer"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div className="mr-2">
                <p className="font-medium text-sm">{userName}</p>
                <p className="text-xs text-gray-500">{userRole}</p>
              </div>
              <ChevronDown size={16} className="text-gray-400" />
            </div>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <button
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={handleLogout}
                >
                  <LogOut size={16} className="mr-2" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
