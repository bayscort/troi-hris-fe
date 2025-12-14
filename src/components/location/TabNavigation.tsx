import React from 'react';

interface TabNavigationProps {
  activeTab: 'estate' | 'mill';
  onTabChange: (tab: 'estate' | 'mill') => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="mb-6">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => onTabChange('estate')}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'estate' 
                ? 'border-[#ff832f] text-[#ff6908]' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            Origins
          </button>
          <button
            onClick={() => onTabChange('mill')}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'mill' 
                ? 'border-[#ff832f] text-[#ff6908]' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            Destinations
          </button>
        </nav>
      </div>
    </div>
  );
};

export default TabNavigation;
