// // src/pages/auth/ActivateAccount.jsx - NEW PAGE

// import React, { useState, useEffect, useContext } from 'react';
// import { useParams, useNavigate, Link } from 'react-router-dom';
// import { AuthContext } from '../../contexts/AuthContext';
// import { CheckCircle, AlertCircle, Loader, Mail, KeyRound, ArrowLeft } from 'lucide-react';

// const ActivateAccount = () => {
//   const { token } = useParams();
//   const navigate = useNavigate();
//   const { activateAccount, resendActivationEmail } = useContext(AuthContext);
  
//   const [loading, setLoading] = useState(true);
//   const [success, setSuccess] = useState(false);
//   const [error, setError] = useState('');
//   const [showResend, setShowResend] = useState(false);
//   const [resendEmail, setResendEmail] = useState('');
//   const [resending, setResending] = useState(false);

//   useEffect(() => {
//     const activate = async () => {
//       if (!token) {
//         setError('No activation token provided');
//         setLoading(false);
//         return;
//       }

//       try {
//         setLoading(true);
//         await activateAccount(token);
//         setSuccess(true);
        
//         // Redirect to login after 3 seconds
//         setTimeout(() => {
//           navigate('/login');
//         }, 3000);
//       } catch (err) {
//         setError(err.response?.data?.message || 'Failed to activate account. The token may be invalid or expired.');
//         setShowResend(true);
//       } finally {
//         setLoading(false);
//       }
//     };

//     activate();
//   }, [token, activateAccount, navigate]);

//   const handleResendEmail = async (e) => {
//     e.preventDefault();
    
//     if (!resendEmail.trim()) {
//       setError('Please enter your email address');
//       return;
//     }

//     try {
//       setResending(true);
//       await resendActivationEmail(resendEmail);
//       setError('');
//       setShowResend(false);
//       alert('Activation email sent! Check your inbox for the new activation link.');
//     } catch (err) {
//       setError('Failed to resend activation email');
//     } finally {
//       setResending(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-r from-gray-50 to-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
//       <div className="sm:mx-auto sm:w-full sm:max-w-md">
//         <div className="text-center">
//           <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg">
//             {success ? (
//               <CheckCircle className="h-8 w-8 text-white" />
//             ) : error ? (
//               <AlertCircle className="h-8 w-8 text-white" />
//             ) : (
//               <Loader className="h-8 w-8 text-white animate-spin" />
//             )}
//           </div>
          
//           <h2 className="mt-6 text-center text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
//             {loading ? 'Activating Account' : success ? 'Account Activated!' : 'Activation Failed'}
//           </h2>
//         </div>
//       </div>

//       <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
//         <div className="bg-white py-8 px-6 shadow-lg sm:rounded-xl border border-gray-100">
//           {loading ? (
//             <div className="text-center py-8">
//               <Loader className="h-12 w-12 text-indigo-600 animate-spin mx-auto mb-4" />
//               <p className="text-gray-600">Please wait while we activate your account...</p>
//             </div>
//           ) : success ? (
//             <div className="text-center py-8">
//               <div className="rounded-lg bg-green-50 p-4 border border-green-200 mb-6">
//                 <h3 className="text-sm font-medium text-green-800 mb-2">
//                   ✓ Your account has been successfully activated!
//                 </h3>
//                 <p className="text-sm text-green-700">
//                   You can now log in with your email and password. Redirecting to login page...
//                 </p>
//               </div>

//               <Link
//                 to="/login"
//                 className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
//               >
//                 <ArrowLeft size={16} className="mr-2" />
//                 Go to login
//               </Link>
//             </div>
//           ) : (
//             <div className="py-8">
//               <div className="rounded-lg bg-red-50 p-4 border border-red-200 mb-6">
//                 <div className="flex">
//                   <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
//                   <div className="text-left">
//                     <h3 className="text-sm font-medium text-red-800">
//                       Activation Failed
//                     </h3>
//                     <p className="text-sm text-red-700 mt-2">
//                       {error}
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               {showResend && (
//                 <form onSubmit={handleResendEmail} className="space-y-4 mb-6">
//                   <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
//                     <p className="text-sm text-blue-700 font-medium mb-4">
//                       Request a new activation email:
//                     </p>
//                     <div className="space-y-3">
//                       <div>
//                         <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
//                           Email address
//                         </label>
//                         <div className="relative">
//                           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                             <Mail size={16} className="text-gray-400" />
//                           </div>
//                           <input
//                             id="email"
//                             type="email"
//                             required
//                             value={resendEmail}
//                             onChange={(e) => setResendEmail(e.target.value)}
//                             className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg"
//                             placeholder="you@example.com"
//                           />
//                         </div>
//                       </div>
//                       <button
//                         type="submit"
//                         disabled={resending}
//                         className={`w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-200
//                           ${resending ? 'opacity-70 cursor-not-allowed' : ''}`}
//                       >
//                         {resending ? (
//                           <>
//                             <Loader size={16} className="animate-spin mr-2" />
//                             Sending...
//                           </>
//                         ) : (
//                           <>
//                             <KeyRound size={16} className="mr-2" />
//                             Send activation email
//                           </>
//                         )}
//                       </button>
//                     </div>
//                   </div>
//                 </form>
//               )}

//               <div className="text-center space-y-2">
//                 <Link
//                   to="/login"
//                   className="inline-flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
//                 >
//                   <ArrowLeft size={14} className="mr-1" />
//                   Back to login
//                 </Link>
//                 {!showResend && (
//                   <>
//                     <p className="text-xs text-gray-500">or</p>
//                     <button
//                       onClick={() => setShowResend(true)}
//                       className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
//                     >
//                       Request new activation email
//                     </button>
//                   </>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ActivateAccount;

import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { CheckCircle, AlertCircle, Loader, Mail, KeyRound, ArrowLeft } from 'lucide-react';
import siteConfig from '../../config/siteConfig';

const ActivateAccount = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { activateAccount, resendActivationEmail } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showResend, setShowResend] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [resending, setResending] = useState(false);

  const t = siteConfig.theme;
  const tc = siteConfig.tailwindClasses;

  useEffect(() => {
    const activate = async () => {
      if (!token) {
        setError('No activation token provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        await activateAccount(token);
        setSuccess(true);

        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to activate account. The token may be invalid or expired.');
        setShowResend(true);
      } finally {
        setLoading(false);
      }
    };

    activate();
  }, [token, activateAccount, navigate]);

  const handleResendEmail = async (e) => {
    e.preventDefault();

    if (!resendEmail.trim()) {
      setError('Please enter your email address');
      return;
    }

    try {
      setResending(true);
      await resendActivationEmail(resendEmail);
      setError('');
      setShowResend(false);
      alert('Activation email sent! Check your inbox for the new activation link.');
    } catch (err) {
      setError('Failed to resend activation email');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-r ${t.background.gradient} flex flex-col justify-center py-12 sm:px-6 lg:px-8`}>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className={`mx-auto h-16 w-16 flex items-center justify-center rounded-full ${tc.primary.gradient} shadow-lg`}>
            {success ? (
              <CheckCircle className="h-8 w-8 text-white" />
            ) : error ? (
              <AlertCircle className="h-8 w-8 text-white" />
            ) : (
              <Loader className="h-8 w-8 text-white animate-spin" />
            )}
          </div>
          <h2 className={`mt-6 text-center text-3xl font-extrabold text-transparent bg-clip-text ${tc.primary.gradient}`}>
            {loading ? 'Activating Account' : success ? 'Account Activated!' : 'Activation Failed'}
          </h2>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-lg sm:rounded-xl border border-gray-100">
          {loading ? (
            <div className="text-center py-8">
              <Loader className="h-12 w-12 text-green-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Please wait while we activate your account...</p>
            </div>
          ) : success ? (
            <div className="text-center py-8">
              <div className="rounded-lg bg-green-50 p-4 border border-green-200 mb-6">
                <h3 className="text-sm font-medium text-green-800 mb-2">
                  ✓ Your account has been successfully activated!
                </h3>
                <p className="text-sm text-green-700">
                  You can now log in with your email and password. Redirecting to login page...
                </p>
              </div>
              <Link
                to="/login"
                className={`w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white ${tc.button.primary} transition-all duration-200`}
              >
                <ArrowLeft size={16} className="mr-2" />
                Go to login
              </Link>
            </div>
          ) : (
            <div className="py-8">
              <div className="rounded-lg bg-red-50 p-4 border border-red-200 mb-6">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div className="text-left">
                    <h3 className="text-sm font-medium text-red-800">
                      Activation Failed
                    </h3>
                    <p className="text-sm text-red-700 mt-2">
                      {error}
                    </p>
                  </div>
                </div>
              </div>

              {showResend && (
                <form onSubmit={handleResendEmail} className="space-y-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-700 font-medium mb-4">
                      Request a new activation email:
                    </p>
                    <div className="space-y-3">
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email address
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail size={16} className="text-gray-400" />
                          </div>
                          <input
                            id="email"
                            type="email"
                            required
                            value={resendEmail}
                            onChange={(e) => setResendEmail(e.target.value)}
                            className={`focus:ring-${t.primary.main.replace('#', '')} focus:border-${t.primary.main.replace('#', '')} block w-full pl-10 sm:text-sm border-gray-300 rounded-lg`}
                            placeholder="you@example.com"
                            style={{
                              '--tw-ring-color': t.primary.main,
                              '--tw-border-color': t.primary.main,
                            }}
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={resending}
                        className={`w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white ${tc.button.primary} transition-all duration-200
                          ${resending ? 'opacity-70 cursor-not-allowed' : ''}`}
                      >
                        {resending ? (
                          <>
                            <Loader size={16} className="animate-spin mr-2" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <KeyRound size={16} className="mr-2" />
                            Send activation email
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              )}

              <div className="text-center space-y-2">
                <Link
                  to="/login"
                  className={`inline-flex items-center justify-center text-sm font-medium ${tc.primary.text} ${tc.primary.hover} transition-colors duration-200`}
                >
                  <ArrowLeft size={14} className="mr-1" />
                  Back to login
                </Link>
                {!showResend && (
                  <>
                    <p className="text-xs text-gray-500">or</p>
                    <button
                      onClick={() => setShowResend(true)}
                      className={`text-sm font-medium ${tc.primary.text} ${tc.primary.hover} transition-colors duration-200`}
                    >
                      Request new activation email
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivateAccount;
