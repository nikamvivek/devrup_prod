// src/pages/admin/SalesReport.jsx
import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import adminService from '../../services/adminService';
import CategorySalesChart from '../../components/admin/CategorySalesChart';
import SalesReportExport from '../../components/admin/SalesReportExport';

const SalesReport = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('monthly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [chartType, setChartType] = useState('line');

  useEffect(() => {
    const fetchSalesReport = async () => {
      setLoading(true);
      try {
        const params = {
          period,
          startDate,
          endDate
        };
        
        const data = await adminService.getSalesReport(params);
        setReportData(data);
        setError(null);
      } catch (err) {
        
        setError('Failed to load sales report. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchSalesReport();
  }, [period, startDate, endDate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // The useEffect will trigger the fetch
  };

  const formatChartData = (data) => {
    if (!data || !data.data) return [];
    
    return data.data.map(item => ({
      name: item.month || item.date,
      sales: parseFloat(item.sales),
      orders: item.orders,
      avg: parseFloat(item.avg_order_value || 0)
    }));
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Sales Report</h1>
          <p className="text-gray-600">View and analyze your sales performance</p>
        </div>
        <div>
          {/* Replace the export button with our new component */}
          <SalesReportExport 
            period={period}
            startDate={startDate}
            endDate={endDate}
          />
        </div>
      </div>

      {/* Filter Form */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label htmlFor="period" className="block text-sm font-medium text-gray-700 mb-1">Period</label>
            <select
              id="period"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              <option value="daily">Daily</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              id="startDate"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              id="endDate"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          
          <div>
            <label htmlFor="chartType" className="block text-sm font-medium text-gray-700 mb-1">Chart Type</label>
            <select
              id="chartType"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
            >
              <option value="line">Line Chart</option>
              <option value="bar">Bar Chart</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Apply Filters
            </button>
          </div>
        </form>
      </div>

      {/* Summary Cards */}
      {!loading && !error && reportData?.summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm font-medium text-gray-500">Total Sales</div>
            <div className="mt-1 text-3xl font-semibold text-gray-900">
              {formatCurrency(reportData.summary.total_sales)}
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm font-medium text-gray-500">Total Orders</div>
            <div className="mt-1 text-3xl font-semibold text-gray-900">
              {reportData.summary.total_orders}
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm font-medium text-gray-500">Average Order Value</div>
            <div className="mt-1 text-3xl font-semibold text-gray-900">
              {formatCurrency(reportData.summary.avg_order_value)}
            </div>
          </div>
        </div>
      )}

      {/* Sales Chart */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="loader">Loading...</div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : (
        <>
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {period === 'daily' ? 'Daily Sales' : 'Monthly Sales'}
            </h2>
            
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'line' ? (
                  <LineChart
                    data={formatChartData(reportData)}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip formatter={(value, name) => {
                      if (name === 'sales') return [formatCurrency(value), 'Sales'];
                      if (name === 'avg') return [formatCurrency(value), 'Avg Order'];
                      return [value, name];
                    }} />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="sales"
                      stroke="#3B82F6"
                      activeDot={{ r: 8 }}
                      name="Sales"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="orders"
                      stroke="#10B981"
                      name="Orders"
                    />
                  </LineChart>
                ) : (
                  <BarChart
                    data={formatChartData(reportData)}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip formatter={(value, name) => {
                      if (name === 'sales') return [formatCurrency(value), 'Sales'];
                      if (name === 'avg') return [formatCurrency(value), 'Avg Order'];
                      return [value, name];
                    }} />
                    <Legend />
                    <Bar
                      yAxisId="left"
                      dataKey="sales"
                      fill="#3B82F6"
                      name="Sales"
                    />
                    <Bar
                      yAxisId="right"
                      dataKey="orders"
                      fill="#10B981"
                      name="Orders"
                    />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
            
            {/* Table View */}
            <div className="mt-8">
              <h3 className="text-lg font-medium mb-3">Sales Data</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {period === 'daily' ? 'Date' : 'Month'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Orders
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sales
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Avg Order Value
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData?.data?.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.month || item.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.orders}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(item.sales)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(item.avg_order_value)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          {/* Category Sales Chart */}
          <CategorySalesChart startDate={startDate} endDate={endDate} />
        </>
      )}
    </AdminLayout>
  );
};

export default SalesReport;