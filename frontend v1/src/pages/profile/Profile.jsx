import { useContext } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  MapPin,
  ShoppingBag,
  CreditCard,
  Heart,
  LogOut,
  Edit,
  Key,
  Shield,
  Bell,
  ChevronRight
} from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import siteConfig from '../../config/siteConfig';

const Profile = () => {
  const { user, logout } = useContext(AuthContext);

  const t = siteConfig.theme;
  const tc = siteConfig.tailwindClasses;

  const handleLogout = () => {
    logout();
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const profileMenu = [
    {
      id: 'personal',
      name: 'Personal Information',
      description: 'Update your personal details',
      icon: User,
      href: '/profile/edit',
      color: tc.primary.gradient
    },
    {
      id: 'addresses',
      name: 'Addresses',
      description: 'Manage your shipping addresses',
      icon: MapPin,
      href: '/profile/addresses',
      color: 'from-red-500 to-pink-600'
    },
    {
      id: 'orders',
      name: 'Orders',
      description: 'View and track your orders',
      icon: ShoppingBag,
      href: '/orders',
      color: 'from-green-500 to-emerald-600'
    },
    {
      id: 'password',
      name: 'Password',
      description: 'Change your password',
      icon: Key,
      href: '/profile/change-password',
      color: 'from-purple-500 to-violet-600'
    },
    {
      id: 'wishlist',
      name: 'Wishlist',
      description: 'View your saved items',
      icon: Heart,
      href: '/wishlist',
      color: 'from-rose-500 to-red-600'
    },
    {
      id: 'payment',
      name: 'Payment Methods',
      description: 'Manage your payment options',
      icon: CreditCard,
      href: '/profile/payment-methods',
      color: 'from-amber-500 to-orange-600'
    },
    {
      id: 'notifications',
      name: 'Notifications',
      description: 'Manage your notifications',
      icon: Bell,
      href: '/notifications',
      color: 'from-blue-400 to-cyan-600'
    },
    {
      id: 'privacy',
      name: 'Privacy & Security',
      description: 'Manage privacy settings',
      icon: Shield,
      href: '/profile/privacy',
      color: 'from-teal-500 to-green-600'
    }
  ];

  return (
    <div className={`bg-gradient-to-b ${t.background.gradient} min-h-screen`}>
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="md:flex md:items-center md:justify-between mb-12"
        >
          <div className="flex-1 min-w-0">
            <h1
              className={`text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r ${tc.primary.gradient} sm:text-4xl`}
            >
              My Account
            </h1>
            <p className="mt-2 text-sm text-gray-600">Manage your personal information and preferences</p>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 flex md:mt-0 md:ml-4"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={handleLogout}
              className={`${tc.button.rose} inline-flex items-center px-5 py-2 rounded-full shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${tc.primary.roseRing} transition-all duration-300`}
            >
              <LogOut size={16} className="mr-2" />
              Sign Out
            </motion.button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white shadow-md overflow-hidden sm:rounded-lg mb-12 border border-gray-100"
        >
          <div className={`px-4 py-5 sm:px-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100`}>
            <h3 className={`text-lg leading-6 font-bold flex items-center ${tc.primary.text}`}>
              <User size={20} className="mr-2" />
              User Information
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Your personal details and account information
            </p>
          </div>
          <div>
            <dl>
              {[
                ['Full name', `${user?.first_name} ${user?.last_name}`, 'bg-gray-50'],
                ['Email address', user?.email, 'bg-white'],
                [
                  'Member since',
                  new Date(user?.date_joined).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }),
                  'bg-gray-50'
                ]
              ].map(([label, value, bg], idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 + idx * 0.1 }}
                  className={`${bg} px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6`}
                >
                  <dt className="text-sm font-medium text-gray-500">{label}</dt>
                  <dd className="mt-1 text-sm font-medium text-gray-900 sm:mt-0 sm:col-span-2">{value}</dd>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.7 }}
                className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"
              >
                <dt className="text-sm font-medium text-gray-500">Account type</dt>
                <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2 flex items-center space-x-2">
                  {user?.is_admin && (
                    <span className="font-medium px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
                      Administrator
                    </span>
                  )}
                  {user?.is_vendor && !user?.is_admin && (
                    <span className="font-medium px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      Vendor
                    </span>
                  )}
                  {user?.is_customer && !user?.is_admin && !user?.is_vendor && (
                    <span className="font-medium px-2.5 py-0.5 rounded-full bg-green-100 text-green-800">
                      Customer
                    </span>
                  )}
                  {user?.is_customer && user?.is_vendor && !user?.is_admin && (
                    <>
                      <span className="font-medium px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        Vendor
                      </span>
                      <span className="font-medium px-2.5 py-0.5 rounded-full bg-green-100 text-green-800">
                        Customer
                      </span>
                    </>
                  )}
                </dd>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.8 }}
                className="bg-gray-50 px-4 py-5 sm:px-6 flex justify-end"
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/profile/edit"
                    className={`${tc.button.primary} inline-flex items-center px-4 py-2 rounded-full shadow-sm text-sm font-medium transition-all duration-300`}
                  >
                    <Edit size={16} className="mr-2" />
                    Edit Profile
                  </Link>
                </motion.div>
              </motion.div>
            </dl>
          </div>
        </motion.div>

        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {profileMenu.map((item) => (
            <motion.div
              key={item.id}
              variants={item}
              whileHover={{
                y: -5,
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
              }}
              className="relative rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm flex items-center space-x-4 hover:border-gray-300 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500 overflow-hidden transition-all duration-300"
            >
              <div className="flex-shrink-0">
                <div className={`h-12 w-12 rounded-full bg-gradient-to-r ${item.color} flex items-center justify-center text-white shadow-md`}>
                  <item.icon size={22} />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <Link to={item.href} className="focus:outline-none">
                  <span className="absolute inset-0" aria-hidden="true" />
                  <p className="text-base font-semibold text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-500 truncate">{item.description}</p>
                </Link>
              </div>
              <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <ChevronRight size={16} className="text-gray-400" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;

