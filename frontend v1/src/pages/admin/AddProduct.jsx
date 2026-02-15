import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import productService from '../../services/productService';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import {
  Save,
  X,
  Plus,
  Trash2,
  ImagePlus,
  Loader,
  Tag,
  DollarSign,
  BarChart,
  FileText,
  ShoppingCart,
  CheckCircle,
  AlertCircle,
  ArrowLeft
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
      {type === 'info' && <ShoppingCart className="w-5 h-5 mr-2" />}
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

const AddProduct = () => {
  const navigate = useNavigate();

  // Base product info
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');

  // For file uploads
  const [images, setImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);

  // For variants
  const [variants, setVariants] = useState([
    { size: '', price: '', stock: '', sku: '', is_discount_active: false, discount_price: '', discount_percentage: '' }
  ]);

  // For loading available categories and brands
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // Form state
  const [loading, setLoading] = useState(false);
  const [creationStage, setCreationStage] = useState(null); // To track multi-step creation

  // Toast notification state
  const [toast, setToast] = useState(null);

  // Fetch categories and brands on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, brandsData] = await Promise.all([
          productService.getCategories(),
          productService.getBrands()
        ]);

        // Handle paginated or direct array responses
        setCategories(categoriesData.results || categoriesData);
        setBrands(brandsData.results || brandsData);
      } catch (err) {
        setToast({
          message: 'Failed to load categories or brands. Please refresh the page.',
          type: 'error'
        });
      }
    };

    fetchData();
  }, []);

  // Handle image file selection
  const handleImageChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);

      // Update file list
      setImages([...images, ...filesArray]);

      // Create preview URLs
      const previewArray = filesArray.map(file => URL.createObjectURL(file));
      setImagePreview([...imagePreview, ...previewArray]);
    }
  };

  // Remove image from the list
  const removeImage = (index) => {
    const newImages = [...images];
    const newPreviews = [...imagePreview];

    // Release object URL to avoid memory leaks
    URL.revokeObjectURL(newPreviews[index]);

    newImages.splice(index, 1);
    newPreviews.splice(index, 1);

    setImages(newImages);
    setImagePreview(newPreviews);
  };

  // Calculate discount price based on percentage
  const calculateDiscountPrice = (price, percentage) => {
    if (!price || !percentage) return '';
    const discountAmount = (price * percentage) / 100;
    const discountedPrice = price - discountAmount;
    return discountedPrice.toFixed(2);
  };

  // Handle changes to variant fields
  const handleVariantChange = (index, field, value) => {
    const updatedVariants = [...variants];

    // Convert numeric strings to numbers for price and numeric fields
    if (['price', 'stock', 'discount_percentage'].includes(field)) {
      value = value === '' ? '' : Number(value);
    }

    // Handle checkbox for is_discount_active
    if (field === 'is_discount_active') {
      value = !updatedVariants[index].is_discount_active;
    }

    updatedVariants[index][field] = value;

    // Auto-calculate discount price when percentage or price changes
    if (field === 'discount_percentage' || field === 'price') {
      if (updatedVariants[index].is_discount_active && updatedVariants[index].discount_percentage) {
        updatedVariants[index].discount_price = calculateDiscountPrice(
          updatedVariants[index].price,
          updatedVariants[index].discount_percentage
        );
      }
    }

    // Clear discount price when discount is deactivated
    if (field === 'is_discount_active' && !value) {
      updatedVariants[index].discount_price = '';
      updatedVariants[index].discount_percentage = '';
    }

    setVariants(updatedVariants);
  };

  // Add a new variant
  const addVariant = () => {
    setVariants([
      ...variants,
      { size: '', price: '', stock: '', sku: '', is_discount_active: false, discount_price: '', discount_percentage: '' }
    ]);
  };

  // Remove a variant
  const removeVariant = (index) => {
    if (variants.length > 1) {
      const updatedVariants = [...variants];
      updatedVariants.splice(index, 1);
      setVariants(updatedVariants);

      setToast({
        message: 'Variant removed',
        type: 'info'
      });
    }
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setToast(null);
    setCreationStage('starting');

    try {
      // Validate required fields
      if (!name || !description || !category || variants.some(v => !v.size || !v.price || !v.stock || !v.sku)) {
        throw new Error('Please fill all required fields');
      }

      // Validate variants
      for (const variant of variants) {
        if (variant.is_discount_active && (!variant.discount_percentage || variant.discount_percentage <= 1 || variant.discount_percentage > 100)) {
          throw new Error('Valid discount percentage (1-100) is required when discount is active');
        }
      }

      // Prepare base product data
      const productData = {
        name,
        description,
        category,
      };

      if (brand) {
        productData.brand = brand;
      }

      // Prepare clean variant data with UNIQUE SKUs
      const cleanVariants = variants.map((variant, index) => {
        // Ensure SKU is unique by appending the size in a URL-friendly format
        const uniqueSku = `${variant.sku}-${variant.size.replace(/\s+/g, '-').toLowerCase()}`;

        const cleanVariant = {
          size: variant.size,
          price: variant.price,
          stock: variant.stock,
          sku: uniqueSku,  // Use the unique SKU
          is_discount_active: variant.is_discount_active
        };

        if (variant.is_discount_active) {
          cleanVariant.discount_price = variant.discount_price;
          if (variant.discount_percentage) {
            cleanVariant.discount_percentage = variant.discount_percentage;
          }
        }

        return cleanVariant;
      });

      setToast({
        message: 'Creating product...',
        type: 'info'
      });

      setCreationStage('creating_product');

      // Use the multi-step creation process
      const result = await productService.createCompleteProduct(
        productData,
        cleanVariants,
        images
      );

      setCreationStage('completed');
      setToast({
        message: 'Product created successfully!',
        type: 'success'
      });

      // Redirect to product list after a short delay
      setTimeout(() => {
        navigate('/admin/products');
      }, 2000);

    } catch (err) {
      setCreationStage('error');

      let errorMessage = 'Failed to create product';

      // Handle different error formats
      if (err.response?.data) {
        if (typeof err.response.data === 'object') {
          // Format Django REST Framework validation errors
          const errorMessages = [];
          Object.entries(err.response.data).forEach(([field, messages]) => {
            if (Array.isArray(messages)) {
              errorMessages.push(`${field}: ${messages.join(', ')}`);
            } else if (typeof messages === 'string') {
              errorMessages.push(`${field}: ${messages}`);
            }
          });
          errorMessage = errorMessages.join('\n');
        } else {
          errorMessage = err.response.data;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      setToast({
        message: errorMessage,
        type: 'error'
      });

      setLoading(false);
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

      <div className="max-w-4xl mx-auto pb-12">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <h1 className="text-3xl font-bold text-gray-800">
              <Plus className="inline-block mr-2 h-8 w-8 text-blue-500" />
              Add New Product
            </h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/admin/products')}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors duration-150 flex items-center shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6 border border-gray-100">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200 flex items-center">
              <FileText className="mr-2 text-blue-500" /> Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                  Product Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-gray-700 font-medium mb-2">
                  Category <span className="text-red-600">*</span>
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="brand" className="block text-gray-700 font-medium mb-2">
                  Brand
                </label>
                <select
                  id="brand"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Select a brand (optional)</option>
                  {brands.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
                Description <span className="text-red-600">*</span>
              </label>
              <div className="border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 transition-all duration-200">
                <CKEditor
                  editor={ClassicEditor}
                  data={description}
                  onChange={(event, editor) => {
                    const data = editor.getData();
                    setDescription(data);
                  }}
                />
              </div>

            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200 flex items-center">
              <ImagePlus className="mr-2 text-blue-500" /> Product Images
            </h2>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Upload Images
              </label>
              <div className="flex items-center justify-center w-full">
                <label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-blue-300 border-dashed rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100 transition-colors duration-200">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                    <ImagePlus className="w-10 h-10 mb-3 text-blue-500" />
                    <p className="mb-2 text-sm text-gray-700">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG or WEBP (MAX. 2MB)
                    </p>
                  </div>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            </div>

            {imagePreview.length > 0 && (
              <div className="mt-4">
                <p className="text-gray-700 font-medium mb-2">Image Preview</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {imagePreview.map((src, index) => (
                    <div key={index} className="relative group">
                      <div className="overflow-hidden rounded-lg shadow-md h-24">
                        <img
                          src={src}
                          alt={`Preview ${index + 1}`}
                          className="h-full w-full object-cover rounded-md group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-0 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-br-md rounded-tl-md font-medium">
                          Main
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
              <h2 className="text-xl font-semibold flex items-center">
                <Tag className="mr-2 text-blue-500" /> Product Variants
              </h2>
              <button
                type="button"
                onClick={addVariant}
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center shadow-sm transition-colors duration-150"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Variant
              </button>
            </div>

            {variants.map((variant, index) => (
              <div key={index} className="p-5 border border-gray-200 rounded-lg mb-4 hover:border-blue-200 transition-colors duration-200 bg-white shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium flex items-center">
                    Variant #{index + 1}
                  </h3>
                  {variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="text-gray-400 hover:text-red-500 focus:outline-none transition-colors duration-200"
                      aria-label="Remove variant"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Size/Variant <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={variant.size}
                      onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                      placeholder="e.g., Small, 1kg, 500ml"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Price <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                      </div>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={variant.price}
                        onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                        placeholder="Regular price"
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Stock <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <ShoppingCart className="h-4 w-4 text-gray-500" />
                      </div>
                      <input
                        type="number"
                        min="0"
                        value={variant.stock}
                        onChange={(e) => handleVariantChange(index, 'stock', e.target.value)}
                        placeholder="Available quantity"
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      SKU <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <BarChart className="h-4 w-4 text-gray-500" />
                      </div>
                      <input
                        type="text"
                        value={variant.sku}
                        onChange={(e) => handleVariantChange(index, 'sku', e.target.value)}
                        placeholder="Unique SKU code"
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-3 mt-4">
                  <label className="flex items-center text-gray-700 font-medium rounded-lg border border-gray-200 p-3 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors duration-200">
                    <input
                      type="checkbox"
                      checked={variant.is_discount_active}
                      onChange={() => handleVariantChange(index, 'is_discount_active')}
                      className="mr-2 h-5 w-5 text-blue-500 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="flex items-center">
                      <Tag className="h-4 w-4 mr-2 text-blue-500" />
                      Apply Discount
                    </span>
                  </label>
                </div>

                {variant.is_discount_active && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-blue-100 rounded-lg bg-blue-50 mt-2">
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-1">
                        Discount Percentage <span className="text-red-600">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-sm font-bold text-green-500">%</span>
                        </div>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          step="0.01"
                          value={variant.discount_percentage}
                          onChange={(e) => handleVariantChange(index, 'discount_percentage', e.target.value)}
                          placeholder="Enter discount %"
                          className="w-full pl-9 pr-3 py-2 border border-green-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                          required={variant.is_discount_active}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-1">
                        Discounted Price
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <DollarSign className="h-4 w-4 text-green-500" />
                        </div>
                        <input
                          type="text"
                          value={variant.discount_price}
                          placeholder="Auto-calculated"
                          className="w-full pl-9 pr-3 py-2 border border-green-300 rounded-lg text-sm bg-gray-50 cursor-not-allowed transition-all duration-200"
                          disabled
                          readOnly
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-1">Automatically calculated from percentage</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end mt-8">
            <button
              type="submit"
              disabled={loading}
              className={`flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-8 rounded-lg shadow-md hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300 min-w-[180px] ${loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
            >
              {loading ? (
                <>
                  <Loader className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Save className="mr-2 h-5 w-5" />
                  <span>Create Product</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AddProduct;