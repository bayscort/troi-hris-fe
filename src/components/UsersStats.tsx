import { ArrowUp } from 'lucide-react';

const UsersStats = () => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-gray-800 font-medium">Active user in countries</h3>
      </div>

      <div className="flex items-end">
        <div className="flex-1">
          <h2 className="text-4xl font-bold text-gray-800 mb-2">7,269</h2>
          <div className="flex items-center">
            <div className="flex items-center text-green-600 mr-3">
              <ArrowUp size={16} className="mr-1" />
              <span className="text-sm font-medium">8.72%</span>
            </div>
            <p className="text-sm text-gray-500">User added <span className="font-medium">972</span> this week</p>
          </div>
        </div>
        <div className="w-1/3">
          <div className="rounded-lg overflow-hidden h-20 bg-gray-100 relative">
            <div className="absolute inset-0 flex items-end">
              <div className="bg-[#ff832f] w-1/6 h-40%" style={{ height: '40%' }}></div>
              <div className="bg-[#ff6908] w-1/6 h-60%" style={{ height: '60%' }}></div>
              <div className="bg-[#e55e07] w-1/6 h-80%" style={{ height: '80%' }}></div>
              <div className="bg-[#b94d06] w-1/6 h-70%" style={{ height: '70%' }}></div>
              <div className="bg-[#ff6908] w-1/6 h-50%" style={{ height: '50%' }}></div>
              <div className="bg-[#ff832f] w-1/6 h-30%" style={{ height: '30%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersStats;
