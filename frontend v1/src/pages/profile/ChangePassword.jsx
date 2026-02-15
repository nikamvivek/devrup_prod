// 
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lock,
  EyeOff,
  Eye,
  ChevronLeft,
  KeyRound,
  CheckCircle,
  AlertCircle,
  Loader,
  ShieldCheck
} from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';
import siteConfig from '../../config/siteConfig';

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { changePassword, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const t = siteConfig.theme;
  const tc = siteConfig.tailwindClasses;

  const togglePasswordVisibility = (field) => {
    setShowPasswords({
      ...showPasswords,
      [field]: !showPasswords[field]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      setFormError('Please fill in all fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      setFormError('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setFormError('New password must be at least 8 characters long');
      return;
    }

    try {
      setSubmitting(true);
      setFormError('');

      await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_new_password: confirmPassword
      });

      setFormSuccess('Password changed successfully. You will be redirected to login.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        const refreshToken = localStorage.getItem('refreshToken');
        logout(refreshToken)
          .then(() => {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            navigate('/login');
          })
          .catch(() => {
            navigate('/login');
          });
      }, 2000);
    } catch (error) {
      if (error.response) {
        const errorData = error.response.data;

        if (typeof errorData === 'string') {
          setFormError(errorData);
        } else if (typeof errorData === 'object') {
          const errorMessage =
            errorData.current_password ||
            errorData.detail ||
            errorData.non_field_errors ||
            errorData.error;

          if (errorMessage) {
            setFormError(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
          } else {
            setFormError('Failed to change password. Please check your current password and try again.');
          }
        } else {
          setFormError('An unexpected error occurred. Please try again.');
        }
      } else {
        setFormError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-r ${t.background.gradient} py-10`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="mb-8">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className={`${tc.primary.text} inline-flex items-center text-sm font-medium hover:${tc.primary.hover} transition-colors duration-200 group`}
            >
              <span className="inline-flex items-center transform group-hover:-translate-x-1 transition-transform duration-200">
                <ChevronLeft size={16} className="mr-1" />
                Back to profile
              </span>
            </button>
          </div>

          <div className="bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden animate-fadeIn">
            <div className="px-6 py-6 border-b border-gray-100">
              <div className="flex items-center">
                <div className={`h-10 w-10 rounded-full bg-${tc.primary.main} flex items-center justify-center mr-4`}>
                  <KeyRound className={`h-6 w-6 text-white`} />
                </div>
                <div>
                  <h2 className={`text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${tc.primary.gradient}`}>
                    Change Password
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">Update your password to keep your account secure</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-6">
              {formSuccess && (
                <div className="mb-6 rounded-lg bg-green-50 p-4 border border-green-200 animate-fadeIn">
                  <div className="flex">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">{formSuccess}</h3>
                    </div>
                  </div>
                </div>
              )}

              {formError && (
                <div className="mb-6 rounded-lg bg-red-50 p-4 border border-red-200 animate-fadeIn">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">{formError}</h3>
                    </div>
                  </div>
                </div>
              )}

              <form className="space-y-6" onSubmit={handleSubmit}>
                {['current', 'new', 'confirm'].map((field) => {
                  const label =
                    field === 'current'
                      ? 'Current Password'
                      : field === 'new'
                      ? 'New Password'
                      : 'Confirm New Password';
                  const value =
                    field === 'current'
                      ? currentPassword
                      : field === 'new'
                      ? newPassword
                      : confirmPassword;
                  const show = showPasswords[field];
                  const setter =
                    field === 'current'
                      ? setCurrentPassword
                      : field === 'new'
                      ? setNewPassword
                      : setConfirmPassword;
                  const id = field === 'current' ? 'current-password' : field === 'new' ? 'new-password' : 'confirm-password';

                  return (
                    <div key={field}>
                      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
                        {label}
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock size={16} className="text-gray-400" />
                        </div>
                        <input
                          id={id}
                          name={id}
                          type={show ? 'text' : 'password'}
                          autoComplete={field === 'current' ? 'current-password' : 'new-password'}
                          required
                          value={value}
                          onChange={(e) => setter(e.target.value)}
                          className={`focus:ring-${t.primary.main.replace('#', '')} focus:border-${t.primary.main.replace('#', '')} block w-full pl-10 pr-10 sm:text-sm border-gray-300 rounded-lg transition-colors duration-200`}
                          style={{
                            '--tw-ring-color': t.primary.main,
                            '--tw-border-color': t.primary.main,
                          }}
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(field)}
                            className="text-gray-400 hover:text-gray-500 focus:outline-none transition-colors duration-200"
                          >
                            {show ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div className="flex items-start p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <ShieldCheck className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium">Password requirements:</p>
                    <ul className="mt-1 list-disc list-inside text-xs space-y-1">
                      <li>At least 8 characters long</li>
                      <li>Include a mix of letters, numbers, and symbols for best security</li>
                      <li>Avoid using easily guessable information</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`${tc.button.primary} w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${tc.primary.ring} transition-all duration-200 ${
                      submitting ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {submitting ? (
                      <span className="flex items-center">
                        <Loader className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                        Updating Password...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <KeyRound className="mr-2 h-4 w-4" />
                        Update Password
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }

        .animate-fadeInDown {
          animation: fadeInDown 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ChangePassword;
