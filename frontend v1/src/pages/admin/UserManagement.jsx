// src/pages/admin/UserManagement.jsx
import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import Pagination from '../../components/common/Pagination';
import adminService from '../../services/adminService';
import { useAuth } from '../../contexts/AuthContext';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userType, setUserType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { getToken } = useAuth();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the admin service to fetch users with filters
      const params = {
        role: userType !== 'all' ? userType : null,
        search: searchQuery || null,
        page: page
      };
      
      const responseData = await adminService.getAllUsers(params);
      
      // Check if we have a paginated response with results array
      if (responseData && responseData.results) {
        setUsers(responseData.results);
        setTotalUsers(responseData.count);
        setTotalPages(Math.ceil(responseData.count / 10)); // Assuming page size of 10
      } else if (Array.isArray(responseData)) {
        // Handle non-paginated response (direct array)
        setUsers(responseData);
        setTotalUsers(responseData.length);
        setTotalPages(1);
      } else {
        // Handle unexpected response format
        console.error('Unexpected API response format:', responseData);
        setError('Received unexpected data format from the server');
        setUsers([]);
        setTotalUsers(0);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(`Failed to load users: ${err.message || 'Unknown error'}`);
      setUsers([]);
      setTotalUsers(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Load users on initial render and when filters change
  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
    fetchUsers(1);
  }, [userType, searchQuery]);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchUsers(page);
  };

  // Handle search input
  const handleSearchInput = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers(1);
  };

  const handleToggleUserStatus = async (userId, isActive) => {
    try {
      setError(null);
      
      // First approach: Use the toggle_status endpoint
      await adminService.toggleUserStatus(userId);
      
      // Update the user's active status in the local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, is_active: !isActive } : user
      ));
    } catch (err) {
      console.error('Error updating user status:', err);
      setError(`Failed to update user status: ${err.message || 'Unknown error'}`);
    }
  };

  const handleToggleUserRole = async (userId, currentRole, newRole) => {
    try {
      setError(null);
      
      // Use the service method for changing role
      await adminService.changeUserRole(userId, newRole);
      
      // Update the user's role in the local state
      const roleUpdates = {
        is_admin: newRole === 'admin',
        is_vendor: newRole === 'vendor',
        is_customer: newRole === 'customer'
      };
      
      setUsers(users.map(user => 
        user.id === userId ? { ...user, ...roleUpdates } : user
      ));
    } catch (err) {
      console.error('Error updating user role:', err);
      setError(`Failed to update user role: ${err.message || 'Unknown error'}`);
    }
  };

  // Helper functions for UI
  const getUserRole = (user) => {
    if (!user) return 'Unknown';
    if (user.is_admin) return 'Admin';
    if (user.is_vendor) return 'Vendor';
    if (user.is_customer) return 'Customer';
    return 'Unknown';
  };
  
  const getUserRoleClass = (user) => {
    if (!user) return 'bg-gray-100 text-gray-800';
    if (user.is_admin) return 'bg-red-100 text-red-800';
    if (user.is_vendor) return 'bg-purple-100 text-purple-800';
    if (user.is_customer) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };
  
  // Debug function to inspect the users array
  const debugUsers = () => {
    console.log('Current users state:', users);
    console.log('Is array:', Array.isArray(users));
    if (Array.isArray(users) && users.length > 0) {
      console.log('First user:', users[0]);
    } else {
      console.log('Users array is empty');
    }
  };
  
  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
        <p className="text-gray-600">Manage system users</p>
        
        {/* Debug button in development */}
        {process.env.NODE_ENV === 'development' && (
          <button 
            onClick={debugUsers}
            className="text-xs bg-gray-200 p-1 mt-2 rounded"
          >
            Debug Users
          </button>
        )}
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Role Filter */}
          <div className="flex items-center">
            <label htmlFor="userType" className="mr-2 text-sm font-medium text-gray-700">Filter by Role:</label>
            <select
              id="userType"
              className="border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
            >
              <option value="all">All Users</option>
              <option value="admin">Admins</option>
              <option value="vendor">Vendors</option>
              <option value="customer">Customers</option>
            </select>
          </div>
          
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="flex items-center">
            <input
              type="text"
              placeholder="Search users..."
              className="border border-gray-300 rounded-l px-3 py-1 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={searchQuery}
              onChange={handleSearchInput}
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-1 px-4 rounded-r"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Stats Summary - update to use the count from API directly */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800">Total Users</h3>
            <p className="text-2xl font-bold">{totalUsers}</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-green-800">Active Users</h3>
            <p className="text-2xl font-bold">{users.filter(u => u.is_active).length}</p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-purple-800">Vendors</h3>
            <p className="text-2xl font-bold">{users.filter(u => u.is_vendor).length}</p>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-red-800">Admins</h3>
            <p className="text-2xl font-bold">{users.filter(u => u.is_admin).length}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="loader">Loading...</div>
        </div>
      ) : (
        <>
          <div className="bg-white shadow overflow-hidden rounded-md mb-4">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {user.first_name} {user.last_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getUserRoleClass(user)}`}>
                          {getUserRole(user)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.date_joined ? new Date(user.date_joined).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-col space-y-2">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleToggleUserStatus(user.id, user.is_active)}
                              className={user.is_active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}
                            >
                              {user.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                          </div>
                          <div>
                            <select
                              className="border border-gray-300 rounded text-sm px-2 py-1"
                              value={getUserRole(user).toLowerCase()}
                              onChange={(e) => handleToggleUserRole(user.id, getUserRole(user).toLowerCase(), e.target.value)}
                            >
                              <option value="admin">Admin</option>
                              <option value="vendor">Vendor</option>
                              <option value="customer">Customer</option>
                            </select>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </AdminLayout>
  );
};

export default UserManagement;