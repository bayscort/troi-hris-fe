import React from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  fullValue?: string;
  percentageChange: number;
  dateRange: string;
  valueClassName?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title: cardTitle,
  value,
  fullValue,
  percentageChange,
  dateRange,
  valueClassName,
}) => {
  const isPositive = percentageChange >= 0;

  return (
    <div className="relative bg-white rounded-lg p-6 shadow-sm h-40 flex flex-col justify-between">
      <div>
        <h3 className="text-gray-600 font-medium mb-2">{cardTitle}</h3>

        <p
          className={`text-3xl font-bold text-gray-800 mb-1 ${valueClassName ?? ''}`}
          title={fullValue}
        >
          {value}
        </p>

        <p className="text-sm text-gray-500">{dateRange}</p>
      </div>

      <div
        className={`absolute bottom-4 right-4 flex items-center text-sm ${isPositive ? 'text-green-600' : 'text-red-600'
          }`}
      >
        {isPositive ? (
          <ArrowUp size={16} className="mr-1 rotate-[45deg]" />
        ) : (
          <ArrowDown size={16} className="mr-1 rotate-[-45deg]" />
        )}
        <span>{Math.abs(percentageChange).toFixed(2)}%</span>
      </div>
    </div>
  );
};

export default MetricCard;
