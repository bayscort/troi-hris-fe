import { EllipsisVertical } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TransactionChart = () => {
  const data = [
    { month: 'Jan', total: 400, success: 300 },
    { month: 'Feb', total: 380, success: 290 },
    { month: 'Mar', total: 500, success: 420 },
    { month: 'Apr', total: 350, success: 280 },
    { month: 'May', total: 450, success: 390 },
    { month: 'Jun', total: 400, success: 320 },
    { month: 'Jul', total: 500, success: 430 },
    { month: 'Aug', total: 550, success: 470 },
    { month: 'Sep', total: 480, success: 400 },
    { month: 'Oct', total: 520, success: 450 },
    { month: 'Nov', total: 600, success: 520 },
    { month: 'Dec', total: 530, success: 450 },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-md shadow-md">
          <p className="font-medium text-sm mb-1">{`${label} 24, 2024`}</p>
          <div className="flex items-center mb-1">
            <div className="w-3 h-3 rounded-full bg-[#ffa257] mr-2"></div>
            <p className="text-sm text-gray-600">Total transaction <span className="font-medium">{payload[0].value}</span></p>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-gray-500 mr-2"></div>
            <p className="text-sm text-gray-600">Success Transaction <span className="font-medium">{payload[1].value}</span></p>
          </div>
        </div>
      );
    }
  
    return null;
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-gray-800 font-medium">Transaction activity</h3>
        <button>
          <EllipsisVertical size={16} className="text-gray-400" />
        </button>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#6B7280' }} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#6B7280' }} 
              domain={[0, 1000]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="total" 
              stroke="#8884d8" 
              strokeWidth={2} 
              dot={false} 
              activeDot={{ r: 6 }} 
            />
            <Line 
              type="monotone" 
              dataKey="success" 
              stroke="#4B5563" 
              strokeWidth={2} 
              dot={false} 
              activeDot={{ r: 6 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center mt-4 gap-8">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-[#ffa257] mr-2"></div>
          <p className="text-sm text-gray-600">Total transaction <span className="font-medium ml-1">456</span></p>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-gray-500 mr-2"></div>
          <p className="text-sm text-gray-600">Success Transaction <span className="font-medium ml-1">587</span></p>
        </div>
      </div>
    </div>
  );
};

export default TransactionChart;
