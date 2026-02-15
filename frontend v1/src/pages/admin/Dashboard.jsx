import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package, Calendar, Clock } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import adminService from '../../services/adminService';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await adminService.getDashboardOverview();
        console.log('Dashboard API Response:', response);
        setDashboardData(response);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </AdminLayout>
    );
  }

  const totalRevenue = parseFloat(dashboardData?.total_revenue || 0);
  const todaySale = parseFloat(dashboardData?.today_sale || 0);
  const yesterdaySale = parseFloat(dashboardData?.yesterday_sale || 0);
  const weekSale = parseFloat(dashboardData?.week_sale || 0);
  const monthSale = parseFloat(dashboardData?.month_sale || 0);

  // Calculate percentage changes
  const todayVsYesterday = yesterdaySale > 0 ? ((todaySale - yesterdaySale) / yesterdaySale * 100).toFixed(1) : 0;
  const orderCompletionRate = dashboardData?.total_orders > 0 
    ? ((dashboardData?.delivered_orders / dashboardData?.total_orders) * 100).toFixed(1) 
    : 0;

  // Prepare data for charts
  const salesTrendData = [
    { name: 'Yesterday', sales: yesterdaySale, orders: dashboardData?.yesterday_orders },
    { name: 'Today', sales: todaySale, orders: dashboardData?.today_orders },
    { name: 'Week', sales: weekSale, orders: dashboardData?.week_orders },
    { name: 'Month', sales: monthSale, orders: dashboardData?.month_orders }
  ];

  const orderStatusData = [
    { name: 'Delivered', value: dashboardData?.delivered_orders || 0, color: '#10b981' },
    { name: 'Pending', value: dashboardData?.pending_orders || 0, color: '#f59e0b' },
    { name: 'Cancelled', value: dashboardData?.cancelled_orders || 0, color: '#ef4444' }
  ];

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color, subtitle }) => (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
            {trendValue}%
          </div>
        )}
      </div>
      <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
      <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-2">{subtitle}</p>}
    </div>
  );

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>
            <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your store today.</p>
          </div>

        {/* Top Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <StatCard
            title="Pending Orders"
            value={`${dashboardData.pending_orders.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`}
            icon={ShoppingCart}
            color="bg-yellow-500"
  subtitle={
              <Link to="/admin/orders" className="text-blue-600 text-lg hover:underline">
                View orders →
              </Link>
            }          />
          <StatCard
            title="Total Revenue"
            value={`₹${totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`}
            icon={DollarSign}
            color="bg-green-500"
            subtitle={`Avg Order: ₹${dashboardData?.avg_order_value?.toLocaleString('en-IN')}`}
          />
          <StatCard
            title="Total Orders"
            value={dashboardData?.total_orders}
            icon={ShoppingCart}
            color="bg-blue-500"
          
          />
          <StatCard
            title="Total Customers"
            value={dashboardData?.total_customers}
            icon={Users}
            color="bg-purple-500"
            subtitle={
              <Link to="/admin/users" className="text-purple-600 hover:underline">
                {dashboardData?.customer_repeat_rate}x repeat rate →
              </Link>
            }
          />
          <StatCard
            title="Total Products"
            value={dashboardData?.total_products}
            icon={Package}
            color="bg-orange-500"
            subtitle={
              <Link to="/admin/products" className="text-orange-600 hover:underline">
                {orderCompletionRate}% completion →
              </Link>
            }
          />
        </div>

        {/* Today's Performance */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-lg shadow-lg text-white">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-8 h-8 opacity-80" />
              <span className="text-sm font-medium bg-white bg-opacity-20 px-3 py-1 rounded-full">
                Today
              </span>
            </div>
            <h3 className="text-lg font-medium opacity-90">Today's Sales</h3>
            <p className="text-3xl font-bold mt-2">₹{todaySale.toLocaleString('en-IN')}</p>
            <p className="text-sm mt-2 opacity-90">{dashboardData?.today_orders} orders</p>
            <div className={`flex items-center mt-3 text-sm ${parseFloat(todayVsYesterday) >= 0 ? 'text-green-200' : 'text-red-200'}`}>
              {parseFloat(todayVsYesterday) >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              {todayVsYesterday}% vs yesterday
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-lg shadow-lg text-white">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 opacity-80" />
              <span className="text-sm font-medium bg-white bg-opacity-20 px-3 py-1 rounded-full">
                This Week
              </span>
            </div>
            <h3 className="text-lg font-medium opacity-90">Weekly Sales</h3>
            <p className="text-3xl font-bold mt-2">₹{weekSale.toLocaleString('en-IN')}</p>
            <p className="text-sm mt-2 opacity-90">{dashboardData?.week_orders} orders</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-lg shadow-lg text-white">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-8 h-8 opacity-80" />
              <span className="text-sm font-medium bg-white bg-opacity-20 px-3 py-1 rounded-full">
                This Month
              </span>
            </div>
            <h3 className="text-lg font-medium opacity-90">Monthly Sales</h3>
            <p className="text-3xl font-bold mt-2">₹{monthSale.toLocaleString('en-IN')}</p>
            <p className="text-sm mt-2 opacity-90">{dashboardData?.month_orders} orders</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Sales Trend Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Sales Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Sales']}
                />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={3} dot={{ r: 5 }} name="Sales (₹)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Order Status Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Status Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Row: Top Products and Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Products */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Products</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboardData?.top_products || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" stroke="#6b7280" />
                <YAxis dataKey="product" type="category" width={150} stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Bar dataKey="total_sales" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Categories */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Categories</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboardData?.top_categories || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="category" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Bar dataKey="total_sales" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Recent Orders</h3>
              <Link to="/admin/orders" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View all orders →
              </Link>
            </div>
            <p className="text-sm text-gray-500 mt-1">{dashboardData?.pending_orders} pending orders</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardData?.recent_orders?.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <Link to={`/admin/orders/${order.id}`} className="text-blue-600 hover:text-blue-800 hover:underline">
                        #{order.id.slice(-8)}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {order.user?.first_name} {order.user?.last_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {order.items?.length || 0} items
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      ₹{parseFloat(order.total_price).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          order.status === 'processing' ? 'bg-blue-100 text-blue-800' : 
                          order.status === 'shipped' ? 'bg-indigo-100 text-indigo-800' : 
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;