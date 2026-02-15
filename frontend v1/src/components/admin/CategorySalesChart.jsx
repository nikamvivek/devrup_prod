// src/components/admin/CategorySalesChart.jsx
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import adminService from '../../services/adminService';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#8DD1E1', '#A4DE6C', '#D0ED57'];

const CategorySalesChart = ({ startDate, endDate }) => {
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategorySales = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const params = { startDate, endDate };
        const response = await adminService.getCategorySales(params);
        
        // Format data for pie chart
        const formattedData = response.categories.map((category, index) => ({
          name: category.category_name,
          value: parseFloat(category.total_sales),
          percentage: category.percentage,
          fill: COLORS[index % COLORS.length]
        }));
        
        setCategoryData(formattedData);
      } catch (err) {
                setError('Failed to load category data');
      } finally {
        setLoading(false);
      }
    };

    fetchCategorySales();
  }, [startDate, endDate]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 shadow-lg rounded-md border">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-blue-600">{formatCurrency(data.value)}</p>
          <p className="text-gray-600">{data.percentage.toFixed(1)}% of total</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="loader">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (categoryData.length === 0) {
    return (
      <div className="bg-gray-100 border border-gray-300 text-gray-700 px-4 py-3 rounded text-center">
        No category sales data available for the selected period.
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Sales by Category</h2>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              innerRadius={40}
              dataKey="value"
              nameKey="name"
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-8">
        <h3 className="text-lg font-medium mb-3">Category Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sales Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Percentage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items Sold
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categoryData.map((category, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div 
                      className="flex items-center text-sm font-medium text-gray-900"
                    >
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: category.fill }}
                      ></div>
                      {category.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(category.value)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {category.percentage.toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {category.items || "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CategorySalesChart;