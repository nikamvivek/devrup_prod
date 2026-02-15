import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Mail, KeyRound, AlertCircle, CheckCircle, ArrowLeft, Loader, Send } from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';
import siteConfig from '../../config/siteConfig';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { requestPasswordReset } = useContext(AuthContext);

  const t = siteConfig.theme;
  const tc = siteConfig.tailwindClasses;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate email
    if (!email.trim()) {
      setFormError('Please enter your email address');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setFormError('Please enter a valid email address');
      return;
    }

    try {
      setSubmitting(true);
      setFormError('');
      await requestPasswordReset(email);
      setSubmitted(true);
    } catch (error) {
      setFormError('If an account exists with this email, you will receive a password reset link.');
      setTimeout(() => {
        setSubmitted(true);
      }, 1500);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setEmail('');
    setSubmitted(false);
    setFormError('');
  };

  return (
    <div className={`min-h-screen bg-gradient-to-r ${t.background.gradient} flex flex-col justify-center py-12 sm:px-6 lg:px-8`}>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className={`mx-auto h-16 w-16 flex items-center justify-center rounded-full ${tc.primary.gradient} shadow-lg animate-fadeIn`}>
            <KeyRound className="h-8 w-8 text-white" />
          </div>
          <h2 className={`mt-6 text-center text-3xl font-extrabold text-transparent bg-clip-text ${tc.primary.gradient} animate-fadeIn`}>
            Forgot your password?
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 animate-fadeIn">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-lg sm:rounded-xl border border-gray-100 animate-fadeIn">
          {submitted ? (
            <div className="text-center animate-fadeIn">
              <div className="rounded-lg bg-green-50 p-4 border border-green-200 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="ml-3 text-left">
                    <h3 className="text-sm font-medium text-green-800">
                      Password reset link sent
                    </h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>
                        If an account exists with <span className="font-semibold">{email}</span>, you will receive an email with instructions to reset your password.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700">
                    <strong>Check your email:</strong> Look for a message from us with the subject "Password Reset Request". If you don't see it, check your spam or junk folder.
                  </p>
                </div>
                <p className="text-sm text-gray-600">
                  Click the link in the email to set a new password. The link will remain valid until you reset your password.
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                <Link
                  to="/login"
                  className={`w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white ${tc.button.primary} transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${tc.primary.ring}`}
                >
                  <ArrowLeft size={16} className="mr-2" />
                  Back to login
                </Link>
                <button 
                  onClick={handleReset}
                  className={`w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${tc.primary.ring}`}
                >
                  <Send size={16} className="mr-2" />
                  Try another email
                </button>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {formError && (
                <div className="rounded-lg bg-red-50 p-4 border border-red-200 flex items-start animate-fadeIn">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="ml-1">
                    <h3 className="text-sm font-medium text-red-800">
                      {formError}
                    </h3>
                  </div>
                </div>
              )}

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
                <p className="mt-1 text-xs text-gray-500">
                  Enter the email address associated with your account.
                </p>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white ${tc.button.primary} transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${tc.primary.ring}
                    ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {submitting ? (
                    <>
                      <Loader size={16} className="animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send size={16} className="mr-2" />
                      Send reset link
                    </>
                  )}
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Remember your password?
                  </span>
                </div>
              </div>

              <div className="text-sm text-center">
                <Link to="/login" className={`font-medium ${tc.primary.text} ${tc.primary.hover} transition-colors duration-200 inline-flex items-center justify-center`}>
                  <ArrowLeft size={14} className="mr-1" />
                  Back to login
                </Link>
              </div>
            </form>
          )}
        </div>

        {/* Additional Help Section */}
        <div className="mt-6 bg-white py-6 px-6 shadow-sm sm:rounded-xl border border-gray-100">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Need more help?</h3>
          <p className="text-sm text-gray-600">
            If you continue to have issues, contact our support team at{' '}
            <a href={`mailto:${siteConfig.contact.email}`} className={`font-medium ${tc.primary.text} ${tc.primary.hover} transition-colors duration-200`}>
              {siteConfig.contact.email}
            </a>
          </p>
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

export default ForgotPassword;
