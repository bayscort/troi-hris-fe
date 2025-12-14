import React, { useState } from 'react';

interface FinanceItem {
  financeItem: string;
  totalTransaction: number;
  totalAmount: number;
}

interface ReportCategory {
  itemCategory: string;
  items: FinanceItem[];
  totalTransaction: number;
  totalAmount: number;
}

interface ReceiptSummaryTableProps {
  categories: ReportCategory[];
  loading: boolean;
}

const ITEM_CATEGORY_LABELS: Record<string, string> = {
  CONTRACTOR_PAYMENT: "Pembayaran Anemer",
  CASH: "Kas",
  BANK: "Bank",
  LIABILITY: "Kewajiban",
  EXPENSE: "Biaya",
  TRUCK_EXPENSE: "Biaya Truk",
  POK_EXPENSE: "Biaya POK",
  OTHER_PLANTATION_EXPENSE: "Biaya Lain-Lain Kebun",
  PLANTATION_OFFICE_EXPENSE: "Biaya Kantor Kebun",
  OTHER_EXPENSE: "Beban Lain - Lain",
};


const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatPercentage = (value: number): string => {
  return `${value.toFixed(2)}%`;
};

const ChevronIcon = ({ expanded }: { expanded: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`h-5 w-5 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
      clipRule="evenodd"
    />
  </svg>
);


export default function ReceiptSummaryTable({ categories, loading }: ReceiptSummaryTableProps) {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName],
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff832f]"></div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-center justify-center h-32">
        <p className="text-gray-500">Tidak ada data penerimaan untuk periode yang dipilih.</p>
      </div>
    );
  }

  const totalAmountOverall = categories.reduce((acc, curr) => acc + curr.totalAmount, 0);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="w-12"></th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kategori Item
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Transaksi
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Jumlah
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Persentase
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.map((category) => {
              const percentage = totalAmountOverall > 0 ? (category.totalAmount / totalAmountOverall) * 100 : 0;
              const isExpanded = expandedCategories[category.itemCategory] || false;

              return (
                <React.Fragment key={category.itemCategory}>
                  <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => toggleCategory(category.itemCategory)}>
                    <td className="px-4 py-4 text-center">
                      <button className="text-gray-500 hover:text-gray-800">
                        <ChevronIcon expanded={isExpanded} />
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {ITEM_CATEGORY_LABELS[category.itemCategory] ?? category.itemCategory}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm text-gray-800">{category.totalTransaction}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-medium text-gray-600">
                        {formatCurrency(category.totalAmount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-medium text-gray-600">
                        {formatPercentage(percentage)}
                      </div>
                    </td>
                  </tr>

                  {isExpanded && category.items.map((item, itemIndex) => (
                    <tr key={`${category.itemCategory}-${itemIndex}`} className="bg-gray-50">
                      <td></td>
                      <td className="pl-12 pr-6 py-3 whitespace-normal break-words max-w-md">
                        <div className="text-sm text-gray-700" title={item.financeItem}>
                          {item.financeItem}
                        </div>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-right">
                        <div className="text-sm text-gray-700">{item.totalTransaction}</div>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-right">
                        <div className="text-sm text-gray-600">
                          {formatCurrency(item.totalAmount)}
                        </div>
                      </td>
                      <td></td>
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}