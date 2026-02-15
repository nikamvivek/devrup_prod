// src/pages/auth/ResetPassword.jsx - COMPLETE UPDATED VERSION

import React, { useState, useContext } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Lock, EyeOff, Eye, AlertCircle, CheckCircle, Loader, ShieldCheck, ArrowLeft } from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [validToken, setValidToken] = useState(true);
  
  const { resetPassword } = useContext(AuthContext);
  const navigate = useNavigate();
  const { token } = useParams();
  
  // Validate token on component mount
  React.useEffect(() => {
    if (!token) {
      setFormError('Invalid or missing reset token. Please request a new password reset link.');
      setValidToken(false);
    }
  }, [token]);

  const validateForm = () => {
    const errors = {};

    if (!password.trim()) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    }

    if (!passwordConfirm.trim()) {
      errors.passwordConfirm = 'Please confirm your password';
    } else if (password !== passwordConfirm) {
      errors.passwordConfirm = 'Passwords do not match';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setFormError('');
      return;
    }

    if (!token) {
      setFormError('Invalid or missing reset token. Please try requesting a new password reset link.');
      return;
    }
    
    try {
      setSubmitting(true);
      setFormError('');
      setFormErrors({});
      
      // Call reset password API with correct field names
      await resetPassword({
        token,
        password: password,
        password_confirm: passwordConfirm
      });
      
      // Show success message
      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (error) {
      
      
      // Handle specific errors
      if (error.response?.data?.error) {
        setFormError(error.response.data.error);
      } else if (error.response?.data?.message) {
        setFormError(error.response.data.message);
      } else {
        setFormError('Failed to reset password. The token may be expired or invalid. Please request a new password reset link.');
      }
      
      setValidToken(false);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-gray-50 to-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg animate-fadeIn">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            
            <h2 className="mt-6 text-center text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600 animate-fadeIn">
              Password reset successful
            </h2>
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-6 shadow-lg sm:rounded-xl border border-gray-100 animate-fadeIn">
            <div className="rounded-lg bg-green-50 p-4 border border-green-200 mb-6">
              <div className="flex">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <h3 className="text-sm font-medium text-green-800">
                    Your password has been reset
                  </h3>
                  <p className="mt-2 text-sm text-green-700">
                    You can now log in with your new password. You'll be redirected to the login page in a few seconds.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <Link
                to="/login"
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
              >
                <ArrowLeft size={16} className="mr-2" />
                Go to login
              </Link>

              <p className="text-center text-xs text-gray-500">
                Redirecting in 3 seconds...
              </p>
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
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-50 to-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg animate-fadeIn">
            <Lock className="h-8 w-8 text-white" />
          </div>
          
          <h2 className="mt-6 text-center text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 animate-fadeIn">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 animate-fadeIn">
            Enter your new password below
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-lg sm:rounded-xl border border-gray-100 animate-fadeIn">
          {formError && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 border border-red-200 flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
              <div className="ml-1">
                <h3 className="text-sm font-medium text-red-800">
                  {formError}
                </h3>
              </div>
            </div>
          )}
          
          {!validToken ? (
            <div className="text-center py-8 space-y-4">
              <div className="rounded-lg bg-yellow-50 p-4 border border-yellow-200">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div className="text-left">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Invalid or Expired Link
                    </h3>
                    <p className="mt-2 text-sm text-yellow-700">
                      The password reset link is invalid or has expired. Please request a new one.
                    </p>
                  </div>
                </div>
              </div>

              <Link
                to="/forgot-password"
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
              >
                Request New Reset Link
              </Link>

              <Link to="/login" className="block text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200">
                Back to login
              </Link>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  New Password
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
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (formErrors.password) {
                        setFormErrors({ ...formErrors, password: '' });
                      }
                    }}
                    className={`focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-10 sm:text-sm border border-gray-300 rounded-lg transition-colors duration-200
                      ${formErrors.password ? 'border-red-300 bg-red-50' : ''}`}
                    placeholder="••••••••"
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
                <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={16} className="text-gray-400" />
                  </div>
                  <input
                    id="passwordConfirm"
                    name="passwordConfirm"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={passwordConfirm}
                    onChange={(e) => {
                      setPasswordConfirm(e.target.value);
                      if (formErrors.passwordConfirm) {
                        setFormErrors({ ...formErrors, passwordConfirm: '' });
                      }
                    }}
                    className={`focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border border-gray-300 rounded-lg transition-colors duration-200
                      ${formErrors.passwordConfirm ? 'border-red-300 bg-red-50' : ''}`}
                    placeholder="••••••••"
                  />
                </div>
                {formErrors.passwordConfirm && (
                  <p className="mt-2 text-sm text-red-600">{formErrors.passwordConfirm}</p>
                )}
              </div>

              {/* Password Requirements */}
              <div className="flex p-4 bg-blue-50 rounded-lg border border-blue-100">
                <ShieldCheck className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium">Password must be:</p>
                  <ul className="mt-1 list-disc list-inside text-xs space-y-1">
                    <li>At least 8 characters long</li>
                    <li>Different from your previous password</li>
                    <li>A mix of letters, numbers, and symbols for best security</li>
                  </ul>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200
                    ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {submitting ? (
                    <>
                      <Loader size={16} className="animate-spin mr-2" />
                      Resetting password...
                    </>
                  ) : (
                    <>
                      <Lock size={16} className="mr-2" />
                      Reset Password
                    </>
                  )}
                </button>
              </div>
              
              <div className="text-sm text-center">
                <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200 inline-flex items-center justify-center">
                  <ArrowLeft size={14} className="mr-1" />
                  Back to login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>

      <style>{`
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

export default ResetPassword;