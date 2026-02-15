
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import { useAuth } from '../../contexts/AuthContext';
import productService from '../../services/productService';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Eye, 
  Tag, 
  Loader, 
  Package, 
  AlertCircle,
  ShoppingBag,
  X,
  CheckCircle,
  AlertTriangle,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

// Toast notification component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' 
    ? 'bg-green-500' 
    : type === 'error' 
      ? 'bg-red-500' 
      : type === 'info' 
        ? 'bg-blue-500' 
        : 'bg-gray-700';

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center p-4 mb-4 text-white ${bgColor} rounded-lg shadow-lg transition-all duration-300 transform translate-x-0`}>
      {type === 'success' && <CheckCircle className="w-5 h-5 mr-2" />}
      {type === 'error' && <AlertCircle className="w-5 h-5 mr-2" />}
      {type === 'info' && <ShoppingBag className="w-5 h-5 mr-2" />}
      <div className="text-sm font-medium mr-3">{message}</div>
      <button 
        onClick={onClose} 
        className="ml-auto -mx-1.5 -my-1.5 bg-white bg-opacity-10 text-white rounded-lg p-1.5 hover:bg-opacity-20 inline-flex h-6 w-6 items-center justify-center"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
};

// Custom delete confirmation modal
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, productName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
        
        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Product</h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete "<span className="font-medium text-gray-700">{productName}</span>"? This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onConfirm}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductManagement = () => {
  const [toggleLoading, setToggleLoading] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    productSlug: null,
    productName: ''
  });
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Use the productService instead of direct axios calls
        const data = await productService.getProducts();
        
        // Check if the response contains a results array (paginated response)
        if (data && data.results) {
          setProducts(data.results);
        } else if (Array.isArray(data)) {
          // If the response is directly an array
          setProducts(data);
        } else {
          // If the response is in an unexpected format
          setToast({
            message: 'Received data in an unexpected format.',
            type: 'error'
          });
          setProducts([]);
        }
        
        setLoading(false);
      } catch (err) {
        setToast({
          message: 'Failed to load products. Please try again.',
          type: 'error'
        });
        setLoading(false);
        setProducts([]); // Ensure products is an array even on error
      }
    };

    fetchProducts();
  }, []);

  const openDeleteModal = (slug, name) => {
    setDeleteModal({
      isOpen: true,
      productSlug: slug,
      productName: name
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      productSlug: null,
      productName: ''
    });
  };

  const handleToggleStatus = async (productSlug) => {
    try {
      setToggleLoading(productSlug);
      const updatedProduct = await productService.toggleProductStatus(productSlug);
      
      setProducts(products.map(product => 
        product.slug === productSlug ? updatedProduct : product
      ));
      
      setToast({ 
        message: `Product ${updatedProduct.is_active ? 'activated' : 'deactivated'} successfully`, 
        type: 'success' 
      });
    } catch (err) {
      setToast({ 
        message: 'Failed to update product status. Please try again.', 
        type: 'error' 
      });
    } finally {
      setToggleLoading(null);
    }
  };

  const confirmDelete = async () => {
    try {
      await productService.deleteProduct(deleteModal.productSlug);
      setProducts(products.filter(product => product.slug !== deleteModal.productSlug));
      setToast({
        message: 'Product deleted successfully',
        type: 'success'
      });
      closeDeleteModal();
    } catch (err) {
      setToast({
        message: 'Failed to delete product. Please try again.',
        type: 'error'
      });
      closeDeleteModal();
    }
  };

  return (
    <AdminLayout>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      <DeleteConfirmationModal 
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        productName={deleteModal.productName}
      />
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <Package className="mr-3 h-8 w-8 text-blue-500" />
            Product Management
          </h1>
          <p className="text-gray-600 ml-11">Manage your product inventory</p>
        </div>
        <Link 
          to="/admin/products/create" 
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Product
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader className="animate-spin h-10 w-10 text-blue-500 mr-3" />
          <span className="text-lg font-medium text-gray-700">Loading products...</span>
        </div>
      ) : (
        <div className="bg-white shadow-lg overflow-hidden rounded-lg border border-gray-100">
          {products.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500 flex flex-col items-center">
              <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
              <p className="text-lg font-medium mb-2">No products available</p>
              <p className="mb-6">Add your first product using the button above</p>
              <Link 
                to="/admin/products/create" 
                className="bg-blue-100 text-blue-700 py-2 px-4 rounded-lg hover:bg-blue-200 transition-colors duration-200 flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Product
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {products.map(product => (
                <li key={product.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <div className="px-6 py-5 flex items-center justify-between">
                    <div className="flex items-center">
                      {product.main_image ? (
                        <img 
                          src={product.main_image} 
                          alt={product.name} 
                          className="h-20 w-20 object-cover rounded-lg shadow-sm border border-gray-200"
                        />
                      ) : (
                        <div className="h-20 w-20 flex items-center justify-center bg-gray-100 rounded-lg border border-gray-200">
                          <Package className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                      <div className="ml-5">
                        <p className="text-lg font-medium text-blue-600 truncate mb-1">{product.name}</p>
                        <div className="flex items-center text-sm text-gray-500">
                          <Tag className="h-3.5 w-3.5 mr-1" />
                          <span>Category: {product.category_name}</span>
                          <span className="mx-2">•</span>
                          <span>Brand: {product.brand_name || 'N/A'}</span>
                        </div>
                        <div className="mt-2 flex items-center">
                          <span className="text-sm text-gray-600 mr-2 font-medium">
                            {product.discount_price ? (
                              <>
                                <span className="line-through text-gray-400">${product.price}</span>
                                <span className="ml-1 text-red-600">${product.discount_price}</span>
                              </>
                            ) : (
                              <span>${product.price}</span>
                            )}
                          </span>
                          <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                            {product.variants_count} variant{product.variants_count !== 1 ? 's' : ''}
                          </span>
                           <div className="px-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            product.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {product.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        </div>                       
                     
                      </div>
                    </div>
                    <div className="flex space-x-2">
                       <Link 
                        to={`/admin/products/edit/${product.slug}`}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 bg-white rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-150"
                      >
                        <Pencil className="w-4 h-4 mr-1 text-blue-600" /> 
                        Edit
                      </Link>
                      <button
                        onClick={() => handleToggleStatus(product.slug)}
                        disabled={toggleLoading === product.slug}
                        className={`inline-flex items-center px-3 py-1.5 border rounded-md text-sm font-medium transition-colors duration-150 ${
                          product.is_active
                            ? 'border-yellow-200 bg-white text-yellow-600 hover:bg-yellow-50'
                            : 'border-green-200 bg-white text-green-600 hover:bg-green-50'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {toggleLoading === product.slug ? (
                          <Loader className="h-4 w-4 mr-1 animate-spin" />
                        ) : product.is_active ? (
                          <ToggleRight className="h-4 w-4 mr-1" />
                        ) : (
                          <ToggleLeft className="h-4 w-4 mr-1" />
                        )}
                        {product.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                     
                      <button 
                        onClick={() => openDeleteModal(product.slug, product.name)}
                        className="inline-flex items-center px-3 py-1.5 border border-red-200 bg-white rounded-md text-sm font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-150"
                      >
                        <Trash2 className="w-4 h-4 mr-1" /> 
                        Delete
                      </button>
                      <Link 
                        to={`/products/${product.slug}`}
                        className="inline-flex items-center px-3 py-1.5 border border-green-200 bg-white rounded-md text-sm font-medium text-green-600 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-150"
                        target="_blank"
                      >
                        <Eye className="w-4 h-4 mr-1" /> 
                        View
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </AdminLayout>
  );
};

export default ProductManagement;