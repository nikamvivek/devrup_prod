// // src/pages/profile/EditAddress.jsx
// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { AlertCircle } from 'lucide-react';
// import AddressForm from './AddressForm';
// import { authService } from '../../services/authService';

// const EditAddress = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [address, setAddress] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
  
//   useEffect(() => {
//     const fetchAddress = async () => {
//       try {
//         setLoading(true);
//         const addresses = await authService.getAddresses();
//         const foundAddress = addresses.find(addr => addr.id.toString() === id);
        
//         if (!foundAddress) {
//           setError('Address not found');
//         } else {
//           setAddress(foundAddress);
//         }
//       } catch (err) {
//         console.error('Error fetching address:', err);
//         setError('Failed to load address details');
//       } finally {
//         setLoading(false);
//       }
//     };
    
//     if (id) {
//       fetchAddress();
//     }
//   }, [id]);
  
//   if (loading) {
//     return (
//       <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex justify-center">
//         <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
//       </div>
//     );
//   }
  
//   if (error) {
//     return (
//       <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start">
//           <AlertCircle size={18} className="mr-2 mt-0.5" />
//           <span>{error}</span>
//         </div>
//         <div className="mt-4 text-center">
//           <button
//             onClick={() => navigate('/profile/addresses')}
//             className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
//           >
//             Back to Addresses
//           </button>
//         </div>
//       </div>
//     );
//   }
  
//   return <AddressForm existingAddress={address} />;
// };

// export default EditAddress;


import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import AddressForm from './AddressForm';
import { authService } from '../../services/authService';
import siteConfig from '../../config/siteConfig';

const EditAddress = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const t = siteConfig.theme;
  const tc = siteConfig.tailwindClasses;

  useEffect(() => {
    const fetchAddress = async () => {
      try {
        setLoading(true);
        const addresses = await authService.getAddresses();
        const foundAddress = addresses.find(addr => addr.id.toString() === id);

        if (!foundAddress) {
          setError('Address not found');
        } else {
          setAddress(foundAddress);
        }
      } catch (err) {
        console.error('Error fetching address:', err);
        setError('Failed to load address details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAddress();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex justify-center">
        <div className={`animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 ${tc.primary.main}`}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start">
          <AlertCircle size={18} className="mr-2 mt-0.5" />
          <span>{error}</span>
        </div>
        <div className="mt-4 text-center">
          <button
            onClick={() => navigate('/profile/addresses')}
            className={`${tc.button.primary} inline-flex items-center px-4 py-2 rounded-md shadow-sm text-sm font-medium`}
          >
            Back to Addresses
          </button>
        </div>
      </div>
    );
  }

  return <AddressForm existingAddress={address} />;
};

export default EditAddress;
