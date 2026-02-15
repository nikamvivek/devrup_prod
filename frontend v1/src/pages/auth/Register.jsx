import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import {
  User,
  Mail,
  Lock,
  EyeOff,
  Eye,
  UserPlus,
  AlertCircle,
  ShieldCheck,
  CheckCircle,
  Loader
} from 'lucide-react';
import siteConfig from '../../config/siteConfig';

const Register = () => {
  const [formData, setFormData] = useState({
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  password_confirm: '',
  is_customer: true,
  phone_number: '',
  address_line1: '',
  zip_code: ''
});


  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState('');

  const { register, login } = useContext(AuthContext);
  const navigate = useNavigate();

  const t = siteConfig.theme;
  const tc = siteConfig.tailwindClasses;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.first_name.trim()) {
      errors.first_name = 'First name is required';
    }
    if (!formData.last_name.trim()) {
      errors.last_name = 'Last name is required';
    }
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email address is invalid';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    if (!formData.password_confirm) {
      errors.password_confirm = 'Please confirm your password';
    } else if (formData.password !== formData.password_confirm) {
      errors.password_confirm = 'Passwords do not match';
    }
    if (!formData.phone_number) {
      errors.phone_number = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.phone_number)) {
      errors.phone_number = 'Mobile number must be exactly 10 digits';
    }

    if (!formData.address_line1.trim()) {
      errors.address_line1 = 'Address is required';
    } else if (formData.address_line1.length > 120) {
      errors.address_line1 = 'Address cannot exceed 120 characters';
    }

    if (!formData.zip_code) {
      errors.zip_code = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.zip_code)) {
      errors.zip_code = 'Pincode must be exactly 6 digits';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    try {
      setSubmitting(true);
      setGeneralError('');
      setFormErrors({});
      await register(formData);

      // Immediately log user in
      await login(formData.email, formData.password);

      // Redirect to home
      navigate('/', { replace: true });

    } catch (error) {
      if (error.response?.data) {
        if (typeof error.response.data === 'object' && !Array.isArray(error.response.data)) {
          setFormErrors(error.response.data);
        } else {
          setGeneralError(
            typeof error.response.data === 'string'
              ? error.response.data
              : error.response.data?.message || 'Registration failed. Please try again.'
          );
        }
      } else {
        setGeneralError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className={`min-h-screen bg-gradient-to-r ${t.background.gradient} flex flex-col justify-center py-12 sm:px-6 lg:px-8`}>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className={`mx-auto h-16 w-16 flex items-center justify-center rounded-full ${tc.primary.gradient} shadow-lg animate-fadeIn`}>
            <UserPlus className="h-8 w-8 text-white" />
          </div>
          <h2 className={`mt-6 text-center text-3xl font-extrabold text-transparent bg-clip-text ${tc.primary.gradient} animate-fadeIn`}>
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 animate-fadeIn">
            Or{' '}
            <Link to="/login" className={`font-medium ${tc.primary.text} ${tc.primary.hover} transition-colors duration-200`}>
              sign in to your existing account
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-lg sm:rounded-xl border border-gray-100 animate-fadeIn">
          {generalError && (
            <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 flex items-start animate-fadeIn">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>{generalError}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                  First name
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={16} className="text-gray-400" />
                  </div>
                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    autoComplete="given-name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className={`focus:ring-${t.primary.main.replace('#', '')} focus:border-${t.primary.main.replace('#', '')} block w-full pl-10 sm:text-sm border border-gray-300 rounded-lg transition-colors duration-200
                      ${formErrors.first_name ? 'border-red-300 bg-red-50' : ''}`}
                  
                    style={{
                      '--tw-ring-color': t.primary.main,
                      '--tw-border-color': t.primary.main,
                    }}
                  />
                </div>
                {formErrors.first_name && (
                  <p className="mt-2 text-sm text-red-600">{formErrors.first_name}</p>
                )}
              </div>
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                  Last name
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={16} className="text-gray-400" />
                  </div>
                  <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    autoComplete="family-name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className={`focus:ring-${t.primary.main.replace('#', '')} focus:border-${t.primary.main.replace('#', '')} block w-full pl-10 sm:text-sm border border-gray-300 rounded-lg transition-colors duration-200
                      ${formErrors.last_name ? 'border-red-300 bg-red-50' : ''}`}
                    
                    style={{
                      '--tw-ring-color': t.primary.main,
                      '--tw-border-color': t.primary.main,
                    }}
                  />
                </div>
                {formErrors.last_name && (
                  <p className="mt-2 text-sm text-red-600">{formErrors.last_name}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={16} className="text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`focus:ring-${t.primary.main.replace('#', '')} focus:border-${t.primary.main.replace('#', '')} block w-full pl-10 sm:text-sm border border-gray-300 rounded-lg transition-colors duration-200
                    ${formErrors.email ? 'border-red-300 bg-red-50' : ''}`}
                  placeholder="you@example.com"
                  style={{
                    '--tw-ring-color': t.primary.main,
                    '--tw-border-color': t.primary.main,
                  }}
                />
              </div>
              {formErrors.email && (
                <p className="mt-2 text-sm text-red-600">{formErrors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={16} className="text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`focus:ring-${t.primary.main.replace('#', '')} focus:border-${t.primary.main.replace('#', '')} block w-full pl-10 pr-10 sm:text-sm border border-gray-300 rounded-lg transition-colors duration-200
                    ${formErrors.password ? 'border-red-300 bg-red-50' : ''}`}
                  
                  style={{
                    '--tw-ring-color': t.primary.main,
                    '--tw-border-color': t.primary.main,
                  }}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              {formErrors.password && (
                <p className="mt-2 text-sm text-red-600">{formErrors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="password_confirm" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={16} className="text-gray-400" />
                </div>
                <input
                  id="password_confirm"
                  name="password_confirm"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={formData.password_confirm}
                  onChange={handleChange}
                  className={`focus:ring-${t.primary.main.replace('#', '')} focus:border-${t.primary.main.replace('#', '')} block w-full pl-10 sm:text-sm border border-gray-300 rounded-lg transition-colors duration-200
                    ${formErrors.password_confirm ? 'border-red-300 bg-red-50' : ''}`}
                  style={{
                    '--tw-ring-color': t.primary.main,
                    '--tw-border-color': t.primary.main,
                  }}
                />
              </div>
              {formErrors.password_confirm && (
                <p className="mt-2 text-sm text-red-600">{formErrors.password_confirm}</p>
              )}
            </div>

            <div className="flex p-4 bg-blue-50 rounded-lg border border-blue-100">
              <ShieldCheck className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
              <div className="text-sm text-blue-700">
                <p className="font-medium">Password must be:</p>
                <ul className="mt-1 list-disc list-inside text-xs space-y-1">
                  <li>At least 8 characters long</li>
                  <li>Include a mix of letters, numbers, and symbols for best security</li>
                </ul>
              </div>
            </div>
            <div>
            <label className="block text-sm font-medium text-gray-700">
              Mobile Number
            </label>
            <input
              name="phone_number"
              type="text"
              maxLength={10}
              value={formData.phone_number}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
            />
            {formErrors.phone_number && (
              <p className="mt-2 text-sm text-red-600">{formErrors.phone_number}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Address (Max 120 Characters are allowed)
            </label>
            <textarea
              name="address_line1"
              maxLength={120}
              value={formData.address_line1}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
            />
            {formErrors.address_line1 && (
              <p className="mt-2 text-sm text-red-600">{formErrors.address_line1}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Pincode
            </label>
            <input
              name="zip_code"
              type="text"
              maxLength={6}
              value={formData.zip_code}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
            />
            {formErrors.zip_code && (
              <p className="mt-2 text-sm text-red-600">{formErrors.zip_code}</p>
            )}
          </div>

            <div>
              <button
                type="submit"
                disabled={submitting}
                className={`w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white ${tc.button.primary} focus:outline-none focus:ring-2 focus:ring-offset-2 ${tc.primary.ring} transition-all duration-200
                  ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {submitting ? (
                  <>
                    <Loader size={16} className="animate-spin mr-2" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <UserPlus size={16} className="mr-2" />
                    Create account
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  By creating an account, you agree to our
                </span>
              </div>
            </div>
            <div className="mt-6 text-center text-xs text-gray-600">
              <Link to="/terms" className={`font-medium ${tc.primary.text} ${tc.primary.hover} transition-colors duration-200 inline-flex items-center`}>
                <CheckCircle size={12} className="mr-1" />
                Terms of Service
              </Link>
              {' '}and{' '}
              <Link to="/privacy" className={`font-medium ${tc.primary.text} ${tc.primary.hover} transition-colors duration-200 inline-flex items-center`}>
                <ShieldCheck size={12} className="mr-1" />
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Register;
