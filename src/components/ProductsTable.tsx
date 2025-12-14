import { EllipsisVertical } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  revenue: number;
  sales: number;
  reviews: number;
  views: number;
}

const ProductsTable = () => {
  const products: Product[] = [
    {
      id: 1,
      name: "Premium T-Shirt",
      revenue: 26680.90,
      sales: 1072,
      reviews: 1727,
      views: 2680
    },
    {
      id: 2,
      name: "Smartphone Case",
      revenue: 18450.50,
      sales: 934,
      reviews: 1208,
      views: 3210
    },
    {
      id: 3,
      name: "Wireless Earbuds",
      revenue: 22340.75,
      sales: 756,
      reviews: 1350,
      views: 4120
    },
    {
      id: 4,
      name: "Designer Backpack",
      revenue: 15780.25,
      sales: 435,
      reviews: 890,
      views: 1950
    }
  ];

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-gray-800 font-medium">Top Products</h3>
        <button>
          <EllipsisVertical size={16} className="text-gray-400" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 px-4 text-gray-500 font-medium text-sm">Product</th>
              <th className="text-right py-3 px-4 text-gray-500 font-medium text-sm">Revenue</th>
              <th className="text-right py-3 px-4 text-gray-500 font-medium text-sm">Sales</th>
              <th className="text-right py-3 px-4 text-gray-500 font-medium text-sm">Reviews</th>
              <th className="text-right py-3 px-4 text-gray-500 font-medium text-sm">Views</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-gray-50">
                <td className="py-3 px-4">
                  <div className="text-gray-800 font-medium">{product.name}</div>
                </td>
                <td className="py-3 px-4 text-right font-medium text-gray-800">
                  ${product.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-4 text-right text-gray-600">
                  {product.sales.toLocaleString()}
                </td>
                <td className="py-3 px-4 text-right text-gray-600">
                  {product.reviews.toLocaleString()}
                </td>
                <td className="py-3 px-4 text-right text-gray-600">
                  {product.views.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductsTable;
