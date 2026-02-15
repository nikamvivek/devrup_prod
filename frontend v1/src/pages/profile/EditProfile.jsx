// // src/pages/profile/EditProfile.jsx
// import React, { useState, useContext } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { ChevronLeft, Save, CheckCircle, AlertCircle, Loader, User } from 'lucide-react';
// import { AuthContext } from '../../contexts/AuthContext';

// const EditProfile = () => {
//   const { user, updateProfile } = useContext(AuthContext);
//   const navigate = useNavigate();
  
//   const [formData, setFormData] = useState({
//     first_name: user?.first_name || '',
//     last_name: user?.last_name || '',
//     email: user?.email || ''
//   });
  
//   const [submitting, setSubmitting] = useState(false);
//   const [formErrors, setFormErrors] = useState({});
//   const [generalError, setGeneralError] = useState('');
//   const [success, setSuccess] = useState(false);
//   const [notification, setNotification] = useState(null);
  
//   // Show notification helper
//   const showNotification = (type, message) => {
//     setNotification({ type, message });
//     setTimeout(() => setNotification(null), 3000);
//   };
  
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({
//       ...formData,
//       [name]: value
//     });
    
//     // Clear error for this field when user starts typing
//     if (formErrors[name]) {
//       setFormErrors({
//         ...formErrors,
//         [name]: ''
//       });
//     }
//   };
  
//   const validateForm = () => {
//     const errors = {};
    
//     if (!formData.first_name.trim()) {
//       errors.first_name = 'First name is required';
//     }
    
//     if (!formData.last_name.trim()) {
//       errors.last_name = 'Last name is required';
//     }
    
//     if (!formData.email.trim()) {
//       errors.email = 'Email is required';
//     } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
//       errors.email = 'Email address is invalid';
//     }
    
//     return errors;
//   };
  
//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     // Validate form
//     const errors = validateForm();
//     if (Object.keys(errors).length > 0) {
//       setFormErrors(errors);
//       return;
//     }
    
//     try {
//       setSubmitting(true);
//       setFormErrors({});
//       setGeneralError('');
      
//       await updateProfile(formData);
      
//       setSuccess(true);
//       showNotification('success', 'Profile updated successfully!');
      
//       // Reset success message after 3 seconds
//       setTimeout(() => {
//         setSuccess(false);
//       }, 3000);
      
//     } catch (error) {
//       console.error('Profile update error:', error);
      
//       // Handle API validation errors
//       if (error.response?.data) {
//         if (typeof error.response.data === 'object' && !Array.isArray(error.response.data)) {
//           setFormErrors(error.response.data);
//         } else {
//           setGeneralError(
//             typeof error.response.data === 'string' 
//               ? error.response.data 
//               : 'Failed to update profile. Please try again.'
//           );
//         }
//       } else {
//         setGeneralError('An unexpected error occurred. Please try again.');
//       }
      
//       showNotification('error', 'Failed to update profile');
//     } finally {
//       setSubmitting(false);
//     }
//   };
  
//   return (
//     <div className="min-h-screen bg-gradient-to-r from-gray-50 to-gray-100 py-10">
//       {/* Notification */}
//       {notification && (
//         <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border flex items-center animate-fadeInDown ${
//           notification.type === 'success' 
//             ? 'bg-green-50 border-green-200 text-green-800' 
//             : 'bg-red-50 border-red-200 text-red-800'
//         }`}>
//           {notification.type === 'success' ? (
//             <CheckCircle size={16} className="text-green-500 mr-2" />
//           ) : (
//             <AlertCircle size={16} className="text-red-500 mr-2" />
//           )}
//           <p className="text-sm font-medium">{notification.message}</p>
//         </div>
//       )}
      
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="max-w-3xl mx-auto">
//           {/* Back button */}
//           <div className="mb-8">
//             <button
//               type="button"
//               onClick={() => navigate('/profile')}
//               className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200 group"
//             >
//               <span className="inline-flex items-center transform group-hover:-translate-x-1 transition-transform duration-200">
//                 <ChevronLeft size={16} className="mr-1" />
//                 Back to profile
//               </span>
//             </button>
//           </div>
          
//           <div className="md:flex md:items-center md:justify-between mb-8">
//             <div className="flex-1 min-w-0 flex items-center">
//               <User className="h-10 w-10 text-indigo-600 mr-4" />
//               <div>
//                 <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 sm:text-4xl">
//                   Edit Profile
//                 </h1>
//                 <p className="mt-2 text-sm text-gray-500">
//                   Update your personal information
//                 </p>
//               </div>
//             </div>
//           </div>
          
//           {/* Success message */}
//           {success && (
//             <div className="mb-6 rounded-lg bg-green-50 p-4 border border-green-200 shadow-sm animate-fadeIn">
//               <div className="flex">
//                 <div className="flex-shrink-0">
//                   <CheckCircle className="h-5 w-5 text-green-400" />
//                 </div>
//                 <div className="ml-3">
//                   <h3 className="text-sm font-medium text-green-800">
//                     Profile updated successfully!
//                   </h3>
//                 </div>
//               </div>
//             </div>
//           )}
          
//           {/* General error message */}
//           {generalError && (
//             <div className="mb-6 rounded-lg bg-red-50 p-4 border border-red-200 shadow-sm animate-fadeIn">
//               <div className="flex">
//                 <div className="flex-shrink-0">
//                   <AlertCircle className="h-5 w-5 text-red-400" />
//                 </div>
//                 <div className="ml-3">
//                   <h3 className="text-sm font-medium text-red-800">
//                     {generalError}
//                   </h3>
//                 </div>
//               </div>
//             </div>
//           )}
          
//           {/* Profile form */}
//           <div className="bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden animate-fadeIn">
//             <div className="px-4 py-5 sm:px-6 border-b border-gray-100">
//               <h2 className="text-lg font-medium text-gray-900">Personal Information</h2>
//               <p className="mt-1 text-sm text-gray-500">Update your account details here.</p>
//             </div>
            
//             <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
//               <div className="grid grid-cols-6 gap-6">
//                 {/* First name */}
//                 <div className="col-span-6 sm:col-span-3">
//                   <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
//                     First name
//                   </label>
//                   <input
//                     type="text"
//                     name="first_name"
//                     id="first_name"
//                     autoComplete="given-name"
//                     value={formData.first_name}
//                     onChange={handleChange}
//                     className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-lg transition-colors duration-200
//                       ${formErrors.first_name ? 'border-red-300 bg-red-50' : ''}`}
//                   />
//                   {formErrors.first_name && (
//                     <p className="mt-2 text-sm text-red-600">{formErrors.first_name}</p>
//                   )}
//                 </div>

//                 {/* Last name */}
//                 <div className="col-span-6 sm:col-span-3">
//                   <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
//                     Last name
//                   </label>
//                   <input
//                     type="text"
//                     name="last_name"
//                     id="last_name"
//                     autoComplete="family-name"
//                     value={formData.last_name}
//                     onChange={handleChange}
//                     className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-lg transition-colors duration-200
//                       ${formErrors.last_name ? 'border-red-300 bg-red-50' : ''}`}
//                   />
//                   {formErrors.last_name && (
//                     <p className="mt-2 text-sm text-red-600">{formErrors.last_name}</p>
//                   )}
//                 </div>

//                 {/* Email */}
//                 <div className="col-span-6 sm:col-span-4">
//                   <label htmlFor="email" className="block text-sm font-medium text-gray-700">
//                     Email address
//                   </label>
//                   <input
//                     type="email"
//                     name="email"
//                     id="email"
//                     autoComplete="email"
//                     value={formData.email}
//                     onChange={handleChange}
//                     className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-lg transition-colors duration-200
//                       ${formErrors.email ? 'border-red-300 bg-red-50' : ''}`}
//                   />
//                   {formErrors.email && (
//                     <p className="mt-2 text-sm text-red-600">{formErrors.email}</p>
//                   )}
//                 </div>
                
//                 <div className="col-span-6 mt-2">
//                   <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
//                     <p className="text-sm text-indigo-700 flex items-center">
//                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                       </svg>
//                       To change your password, please use the{' '}
//                       <Link to="/profile/change-password" className="font-medium text-indigo-700 hover:text-indigo-800 underline ml-1">
//                         change password
//                       </Link>{' '}
//                       page.
//                     </p>
//                   </div>
//                 </div>
//               </div>
              
//               <div className="mt-8 flex justify-end">
//                 <Link
//                   to="/profile"
//                   className="bg-white py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
//                 >
//                   Cancel
//                 </Link>
//                 <button
//                   type="submit"
//                   disabled={submitting}
//                   className={`ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-200
//                     ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
//                 >
//                   {submitting ? (
//                     <span className="inline-flex items-center">
//                       <Loader size={16} className="mr-2 animate-spin" />
//                       Saving...
//                     </span>
//                   ) : (
//                     <span className="inline-flex items-center">
//                       <Save size={16} className="mr-2" />
//                       Save
//                     </span>
//                   )}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       </div>
      
//       {/* CSS for animations */}
//       <style jsx>{`
//         @keyframes fadeIn {
//           from { opacity: 0; }
//           to { opacity: 1; }
//         }
        
//         @keyframes fadeInDown {
//           from {
//             opacity: 0;
//             transform: translateY(-20px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }
        
//         .animate-fadeIn {
//           animation: fadeIn 0.3s ease-out forwards;
//         }
        
//         .animate-fadeInDown {
//           animation: fadeInDown 0.3s ease-out forwards;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default EditProfile;

import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, CheckCircle, AlertCircle, Loader, User } from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';
import siteConfig from '../../config/siteConfig';

const EditProfile = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [success, setSuccess] = useState(false);
  const [notification, setNotification] = useState(null);

  const t = siteConfig.theme;
  const tc = siteConfig.tailwindClasses;

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.first_name.trim()) errors.first_name = 'First name is required';
    if (!formData.last_name.trim()) errors.last_name = 'Last name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email address is invalid';
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
      setFormErrors({});
      setGeneralError('');

      await updateProfile(formData);

      setSuccess(true);
      showNotification('success', 'Profile updated successfully!');
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      if (error.response?.data) {
        if (typeof error.response.data === 'object' && !Array.isArray(error.response.data)) {
          setFormErrors(error.response.data);
        } else {
          setGeneralError(typeof error.response.data === 'string' ? error.response.data : 'Failed to update profile. Please try again.');
        }
      } else {
        setGeneralError('An unexpected error occurred. Please try again.');
      }
      showNotification('error', 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-r ${t.background.gradient} py-10`}>
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border flex items-center animate-fadeInDown ${
            notification.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle size={16} className="text-green-500 mr-2" />
          ) : (
            <AlertCircle size={16} className="text-red-500 mr-2" />
          )}
          <p className="text-sm font-medium">{notification.message}</p>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
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

          <div className="md:flex md:items-center md:justify-between mb-8">
            <div className="flex-1 min-w-0 flex items-center">
              <User className={`${tc.primary.main} h-10 w-10 mr-4`} />
              <div>
                <h1
                  className={`text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r ${tc.primary.gradient} sm:text-4xl`}
                >
                  Edit Profile
                </h1>
                <p className="mt-2 text-sm text-gray-500">Update your personal information</p>
              </div>
            </div>
          </div>

          {success && (
            <div className="mb-6 rounded-lg bg-green-50 p-4 border border-green-200 shadow-sm animate-fadeIn">
              <div className="flex">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Profile updated successfully!</h3>
                </div>
              </div>
            </div>
          )}

          {generalError && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 border border-red-200 shadow-sm animate-fadeIn">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{generalError}</h3>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden animate-fadeIn">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-100">
              <h2 className="text-lg font-medium text-gray-900">Personal Information</h2>
              <p className="mt-1 text-sm text-gray-500">Update your account details here.</p>
            </div>

            <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                    First name
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    id="first_name"
                    autoComplete="given-name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className={`mt-1 focus:ring-${t.primary.main.replace('#', '')} focus:border-${t.primary.main.replace('#', '')} block w-full shadow-sm sm:text-sm border-gray-300 rounded-lg transition-colors duration-200
                      ${formErrors.first_name ? 'border-red-300 bg-red-50' : ''}`}
                    style={{
                      '--tw-ring-color': t.primary.main,
                      '--tw-border-color': t.primary.main,
                    }}
                  />
                  {formErrors.first_name && <p className="mt-2 text-sm text-red-600">{formErrors.first_name}</p>}
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                    Last name
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    id="last_name"
                    autoComplete="family-name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className={`mt-1 focus:ring-${t.primary.main.replace('#', '')} focus:border-${t.primary.main.replace('#', '')} block w-full shadow-sm sm:text-sm border-gray-300 rounded-lg transition-colors duration-200
                      ${formErrors.last_name ? 'border-red-300 bg-red-50' : ''}`}
                    style={{
                      '--tw-ring-color': t.primary.main,
                      '--tw-border-color': t.primary.main,
                    }}
                  />
                  {formErrors.last_name && <p className="mt-2 text-sm text-red-600">{formErrors.last_name}</p>}
                </div>

                <div className="col-span-6 sm:col-span-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`mt-1 focus:ring-${t.primary.main.replace('#', '')} focus:border-${t.primary.main.replace('#', '')} block w-full shadow-sm sm:text-sm border-gray-300 rounded-lg transition-colors duration-200
                      ${formErrors.email ? 'border-red-300 bg-red-50' : ''}`}
                    style={{
                      '--tw-ring-color': t.primary.main,
                      '--tw-border-color': t.primary.main,
                    }}
                  />
                  {formErrors.email && <p className="mt-2 text-sm text-red-600">{formErrors.email}</p>}
                </div>

                <div className="col-span-6 mt-2">
                  <div className={`p-4 rounded-lg border border-${t.primary.main.replace('#', '')}-100 bg-${t.primary.light}`}>
                    <p className={`text-sm text-${t.primary.main.replace('#', '')} flex items-center`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 text-${t.primary.main.replace('#', '')}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      To change your password, please use the{' '}
                      <Link to="/profile/change-password" className={`font-medium hover:text-${t.primary.dark} underline ml-1`}>
                        change password
                      </Link>{' '}
                      page.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <Link
                  to="/profile"
                  className="bg-white py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`${tc.button.primary} ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white transition-all duration-200 ${
                    submitting ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {submitting ? (
                    <span className="inline-flex items-center">
                      <Loader size={16} className="mr-2 animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    <span className="inline-flex items-center">
                      <Save size={16} className="mr-2" />
                      Save
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
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

export default EditProfile;
