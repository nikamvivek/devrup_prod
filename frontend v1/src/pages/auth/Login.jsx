import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import {
  Mail,
  Lock,
  EyeOff,
  Eye,
  LogIn,
  AlertCircle,
  Loader,
  User,
  KeyRound,
} from 'lucide-react';
import siteConfig from '../../config/siteConfig';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);


  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  // Extract colors and classes from theme config
  const t = siteConfig.theme;
  const tc = siteConfig.tailwindClasses;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setFormError('Please fill in all fields');
      return;
    }
    try {
      setSubmitting(true);
      setFormError('');
      await login(email, password);
      navigate(from, { replace: true });
    } catch (error) {
      setFormError(
        error.response?.data?.message ||
        'Invalid email or password.'
      );
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className={`min-h-screen bg-gradient-to-r ${t.background.gradient} flex flex-col justify-center py-12 sm:px-6 lg:px-8`}>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className={`mx-auto h-16 w-16 flex items-center justify-center rounded-full ${tc.primary.gradient} shadow-lg animate-fadeIn`}>
            <User className="h-8 w-8 text-white" />
          </div>
          <h2
            className={`mt-6 text-center text-3xl font-extrabold text-transparent bg-clip-text ${tc.primary.gradient} animate-fadeIn`}
          >
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 animate-fadeIn">
            Or{' '}
            <Link
              to="/register"
              className={`font-medium ${tc.primary.text} ${tc.primary.hover} transition-colors duration-200`}
            >
              create a new account
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-lg sm:rounded-xl border border-gray-100 animate-fadeIn">
          {formError && (
            <div
              className="mb-6 p-4 rounded-lg border flex items-start animate-fadeIn bg-red-50 text-red-700 border-red-200"
            >
             <AlertCircle
                className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0 text-red-500"
              />

              <span>{formError}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
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
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`focus:ring-${t.primary.main.replace('#', '')} focus:border-${t.primary.main.replace('#', '')} block w-full pl-10 sm:text-sm border border-gray-300 rounded-lg transition-colors duration-200`}
                  placeholder="you@example.com"
                  style={{
                    '--tw-ring-color': t.primary.main,
                    '--tw-border-color': t.primary.main,
                  }}
                />
              </div>
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
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`focus:ring-${t.primary.main.replace('#', '')} focus:border-${t.primary.main.replace('#', '')} block w-full pl-10 pr-10 sm:text-sm border border-gray-300 rounded-lg transition-colors duration-200`}
                  placeholder="••••••••"
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
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className={`h-4 w-4 ${tc.primary.text} focus:ring-${t.primary.main.replace('#', '')} border-gray-300 rounded`}
                  style={{ '--tw-ring-color': t.primary.main }}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className={`font-medium ${tc.primary.text} ${tc.primary.hover} transition-colors duration-200 flex items-center`}
                >
                  <KeyRound size={14} className="mr-1" />
                  Forgot your password?
                </Link>
              </div>
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
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn size={16} className="mr-2" />
                    Sign in
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Need help?
                </span>
              </div>
            </div>
            <div className="mt-6 text-center text-sm">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className={`font-medium ${tc.primary.text} ${tc.primary.hover} transition-colors duration-200`}
                >
                  Create one now
                </Link>
              </p>
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

export default Login;
