// // src/config/siteConfig.js

// // Default Theme (Your current theme)
// const defaultTheme = {
//   shopName: "Devrup Organics",
//   logo: {
//     path: "/src/assets/Devrup_Organics_PNG.png",
//     alt: "Devrup Organics Logo",
//     height: {
//       mobile: "h-10",
//       desktop: "h-12"
//     }
//   },
//   description: "Your one-stop destination for fashion and style. Discover the latest trends and express yourself.",

//   socialLinks: {
//     facebook: "https://facebook.com/devruporganics",
//     twitter: "https://twitter.com/devruporganics",
//     instagram: "https://instagram.com/devruporganics",
//   },

//   contact: {
//     address: "office-301, Akshay Business Squre, Dhayari Pune-411041, Maharashtra, India",
//     phone: "+91 8390103104",
//     email: "devruporganics@gmail.com",
//     workingHours: "Monday to Sunday, 9am to 5pm",
//   },

//   legalLinks: {
//     terms: "/terms",
//     privacy: "/privacy",
//     shipping: "/shipping",
//   },

//   currency: {
//     symbol: "₹",
//     code: "INR",
//   },

//   ShippingAndReturns: {
//     freeShippingThreshold: 'Free shipping on orders over ₹500',
//     standardwarrenty: "1 month warranty on all products",
//     returnPolicyDuration: "5-day money-back guarantee",
//   },

//   // IMPORTANT: Add tailwindClasses for Navbar
//   tailwindClasses: {
//     primary: {
//       text: 'text-indigo-600',
//       bg: 'bg-indigo-600',
//       hover: 'hover:text-indigo-600',
//       bgHover: 'hover:bg-indigo-600',
//       gradient: 'bg-gradient-to-r from-indigo-600 to-purple-600',
//       gradientHover: 'hover:from-indigo-700 hover:to-purple-700',
//       ring: 'ring-indigo-500',
//     },
//     button: {
//       primary: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white',
//     },
//     badge: {
//       notification: 'bg-red-500 text-white',
//       cart: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white',
//     }
//   },

//   theme: {
//     // Primary Colors
//     primary: {
//       main: '#6366f1',
//       light: '#818cf8',
//       dark: '#4f46e5',
//       darker: '#4338ca',
//       50: '#eef2ff',
//       100: '#e0e7ff',
//       gradient: 'from-indigo-600 to-purple-600',
//       gradientHover: 'from-indigo-700 to-purple-700',
//       mainRgb: '99, 102, 241',
//       darkRgb: '79, 70, 229'
//     },
//     secondary: { main: '#8b5cf6', light: '#a78bfa', dark: '#7c3aed', darker: '#6d28d9', gradient: 'from-purple-600 to-indigo-600' },
//     accent: { main: '#ec4899', light: '#f472b6', dark: '#db2777', gradient: 'from-red-500 to-pink-500' },
//     success: { main: '#10b981', light: '#34d399', dark: '#059669', 50: '#ecfdf5', 100: '#d1fae5', gradient: 'from-green-500 to-emerald-600' },
//     error: { main: '#ef4444', light: '#f87171', dark: '#dc2626', 50: '#fef2f2', 100: '#fee2e2' },
//     warning: { main: '#f59e0b', light: '#fbbf24', dark: '#d97706' },
//     info: { main: '#3b82f6', light: '#60a5fa', dark: '#2563eb' },
//     neutral: { white: '#ffffff', black: '#000000', gray: { 50: '#f9fafb', 100: '#f3f4f6', 200: '#e5e7eb', 300: '#d1d5db', 400: '#9ca3af', 500: '#6b7280', 600: '#4b5563', 700: '#374151', 800: '#1f2937', 900: '#111827' } },
//     background: { primary: '#ffffff', secondary: '#f9fafb', tertiary: '#f3f4f6', gradient: 'from-gray-50 to-white', hero: 'from-indigo-600 to-purple-700', heroSecondary: 'from-indigo-500 to-purple-600' },
//     text: { primary: '#111827', secondary: '#6b7280', tertiary: '#9ca3af', white: '#ffffff', muted: '#6b7280', light: '#9ca3af' },
//     border: { light: '#e5e7eb', main: '#d1d5db', dark: '#9ca3af', focus: '#818cf8' },
//     hover: { background: '#f3f4f6', backgroundDark: '#e5e7eb', primary: '#4f46e5', secondary: '#7c3aed' },
//     shadow: { sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)', md: '0 4px 6px -1px rgb(0 0 0 / 0.1)', lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)', xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)', '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)', colored: '0 10px 25px -5px rgba(99, 102, 241, 0.4)' },
//     categoryBadge: { gradient: 'from-indigo-500 to-blue-500', background: '#e0e7ff', text: '#4338ca' },
//     discountBadge: { gradient: 'from-red-500 to-pink-500', text: '#ffffff', background: '#fee2e2', textDark: '#dc2626' },
//     wishlist: { active: '#ef4444', inactive: '#9ca3af', hover: '#ef4444' },
//     sections: { hero: { badge: { background: 'rgba(255, 255, 255, 0.2)', text: '#ffffff' }, title: '#ffffff', subtitle: '#e0e7ff', button: { background: '#ffffff', text: '#4f46e5', hover: '#eef2ff' } }, featured: { badge: { background: '#e0e7ff', text: '#4338ca' }, gradient: 'from-gray-50 to-indigo-50/30' }, newArrivals: { badge: { background: '#d1fae5', text: '#047857' }, gradient: 'from-gray-50 to-green-50/30' }, specialOffers: { badge: { background: '#fee2e2', text: '#991b1b' }, gradient: 'from-gray-50 to-red-50/30', accent: '#ef4444' }, benefits: { iconBackground: '#e0e7ff', iconColor: '#4f46e5', cardBorder: '#f3f4f6' } }
//   },
  
//   animations: { duration: { fast: '200ms', normal: '300ms', slow: '700ms', slower: '1000ms' }, easing: 'ease-in-out', delay: { start: '0.1s', increment: '0.15s' } },

//   components: { productCard: { imageHeight: 'h-48', borderRadius: 'rounded-lg', shadow: 'shadow-sm', shadowHover: 'shadow-xl' }, button: { borderRadius: 'rounded-lg', paddingSmall: 'px-2 py-1.5', paddingMedium: 'px-4 py-2', paddingLarge: 'px-6 py-3' }, badge: { borderRadius: 'rounded-full', padding: 'px-3 py-1', fontSize: 'text-xs', fontWeight: 'font-semibold' }, card: { borderRadius: 'rounded-xl', padding: 'p-6', shadow: 'shadow-md', shadowHover: 'shadow-xl' } },

//   layout: { maxWidth: 'max-w-7xl', padding: { mobile: 'px-4', tablet: 'sm:px-6', desktop: 'lg:px-8' }, section: { paddingY: 'py-10', paddingYLarge: 'py-16' } }
// };

// // Organic Theme (Green, earthy tones)
// const organicTheme = {
//   ...defaultTheme,
//   logo: {
//     path: "/src/assets/Devrup_Organics_PNG.png",
//     alt: "Devrup Organics Logo",
//     height: {
//       mobile: "h-10",
//       desktop: "h-12"
//     }
//   },
  
//   // IMPORTANT: Override tailwindClasses for organic theme
//   tailwindClasses: {
//     primary: {
//       text: 'text-green-600',
//       bg: 'bg-green-600',
//       hover: 'hover:text-green-600',
//       bgHover: 'hover:bg-green-600',
//       gradient: 'bg-gradient-to-r from-green-600 to-green-400',
//       gradientHover: 'hover:from-green-700 hover:to-green-500',
//       ring: 'ring-green-500',
//     },
//     button: {
//       primary: 'bg-gradient-to-r from-green-600 to-green-400 hover:from-green-700 hover:to-green-500 text-white',
//     },
//     badge: {
//       notification: 'bg-red-500 text-white',
//       cart: 'bg-gradient-to-r from-green-600 to-green-400 text-white',
//     }
//   },
  
//   theme: {
//     ...defaultTheme.theme,
//     primary: { main: '#4CAF50', light: '#81C784', dark: '#388E3C', darker: '#2E7D32', gradient: 'from-green-600 to-green-400', gradientHover: 'from-green-700 to-green-500', mainRgb: '76, 175, 80', darkRgb: '56, 142, 60' },
//     secondary: { main: '#8BC34A', light: '#C5E1A5', dark: '#7CB342', darker: '#689F38', gradient: 'from-light-green-500 to-green-600' },
//     accent: { main: '#FFB74D', light: '#FFD54F', dark: '#F57C00', gradient: 'from-orange-400 to-orange-500' },
//     success: { main: '#81C784', light: '#A5D6A7', dark: '#388E3C', 50: '#E8F5E9', 100: '#C8E6C9', gradient: 'from-green-400 to-green-600' },
//     background: { ...defaultTheme.theme.background, primary: '#F0FFF0', secondary: '#E8F5E9', tertiary: '#D0F0C0', hero: 'from-green-600 to-green-400', heroSecondary: 'from-green-500 to-green-300' },
//     text: { ...defaultTheme.theme.text, primary: '#1B5E20', secondary: '#33691E', tertiary: '#558B2F' },
//     sections: {
//       ...defaultTheme.theme.sections,
//       hero: { badge: { background: 'rgba(255, 255, 255, 0.2)', text: '#1B5E20' }, title: '#1B5E20', subtitle: '#33691E', button: { background: '#4CAF50', text: '#ffffff', hover: '#81C784' } }
//     }
//   }
// };

// // Theme Selector
// // Set "default" or "organic" to switch themes
// const activeThemeType = "organic"; // Change to "organic" to apply organic theme

// const siteConfig = activeThemeType === "organic" ? organicTheme : defaultTheme;

// export default siteConfig;

// Default Theme (Your current theme)
// const defaultTheme = {
//   shopName: "Devrup Organics",
//   logo: {
//     path: "/src/assets/Devrup_Organics_PNG.png",
//     alt: "Devrup Organics Logo",
//     height: {
//       mobile: "h-10",
//       desktop: "h-12"
//     }
//   },
//   description: "Your one-stop destination for fashion and style. Discover the latest trends and express yourself.",

//   socialLinks: {
//     facebook: "https://facebook.com/devruporganics",
//     twitter: "https://twitter.com/devruporganics",
//     instagram: "https://instagram.com/devruporganics",
//   },

//   contact: {
//     address: "office-301, Akshay Business Squre, Dhayari Pune-411041, Maharashtra, India",
//     phone: "+91 8390103104",
//     email: "devruporganics@gmail.com",
//     workingHours: "Monday to Sunday, 9am to 5pm",
//   },

//   legalLinks: {
//     terms: "/terms",
//     privacy: "/privacy",
//     shipping: "/shipping",
//   },

//   currency: {
//     symbol: "₹",
//     code: "INR",
//   },

//   ShippingAndReturns: {
//     freeShippingThreshold: 'Free shipping on orders over ₹500',
//     standardwarrenty: "1 month warranty on all products",
//     returnPolicyDuration: "5-day money-back guarantee",
//   },

//   tailwindClasses: {
//     primary: {
//       text: 'text-indigo-600',
//       bg: 'bg-indigo-600',
//       hover: 'hover:text-indigo-600',
//       bgHover: 'hover:bg-indigo-600',
//       gradient: 'from-indigo-600 to-purple-600',
//       gradientHover: 'hover:from-indigo-700 hover:to-purple-700',
//       ring: 'ring-indigo-500',
//       button: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white',
//       rose: 'from-rose-500 to-pink-600',
//       roseRing: 'focus:ring-rose-500',
//     },
//     button: {
//       primary: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white',
//     },
//     badge: {
//       notification: 'bg-red-500 text-white',
//       cart: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white',
//     }
//   },

//   theme: {
//     primary: {
//       main: '#6366f1',
//       light: '#818cf8',
//       dark: '#4f46e5',
//       darker: '#4338ca',
//       50: '#eef2ff',
//       100: '#e0e7ff',
//       gradient: 'from-indigo-600 to-purple-600',
//       gradientHover: 'from-indigo-700 to-purple-700',
//       mainRgb: '99, 102, 241',
//       darkRgb: '79, 70, 229'
//     },
//     secondary: { main: '#8b5cf6', light: '#a78bfa', dark: '#7c3aed', darker: '#6d28d9', gradient: 'from-purple-600 to-indigo-600' },
//     accent: { main: '#ec4899', light: '#f472b6', dark: '#db2777', gradient: 'from-red-500 to-pink-500' },
//     success: { main: '#10b981', light: '#34d399', dark: '#059669', 50: '#ecfdf5', 100: '#d1fae5', gradient: 'from-green-500 to-emerald-600' },
//     error: { main: '#ef4444', light: '#f87171', dark: '#dc2626', 50: '#fef2f2', 100: '#fee2e2' },
//     warning: { main: '#f59e0b', light: '#fbbf24', dark: '#d97706' },
//     info: { main: '#3b82f6', light: '#60a5fa', dark: '#2563eb' },
//     neutral: { white: '#ffffff', black: '#000000', gray: { 50: '#f9fafb', 100: '#f3f4f6', 200: '#e5e7eb', 300: '#d1d5db', 400: '#9ca3af', 500: '#6b7280', 600: '#4b5563', 700: '#374151', 800: '#1f2937', 900: '#111827' } },
//     background: { primary: '#ffffff', secondary: '#f9fafb', tertiary: '#f3f4f6', gradient: 'from-gray-50 to-white', hero: 'from-indigo-600 to-purple-700', heroSecondary: 'from-indigo-500 to-purple-600' },
//     text: { primary: '#111827', secondary: '#6b7280', tertiary: '#9ca3af', white: '#ffffff', muted: '#6b7280', light: '#9ca3af' },
//     border: { light: '#e5e7eb', main: '#d1d5db', dark: '#9ca3af', focus: '#818cf8' },
//     hover: { background: '#f3f4f6', backgroundDark: '#e5e7eb', primary: '#4f46e5', secondary: '#7c3aed' },
//     shadow: { sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)', md: '0 4px 6px -1px rgb(0 0 0 / 0.1)', lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)', xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)', '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)', colored: '0 10px 25px -5px rgba(99, 102, 241, 0.4)' },
//     categoryBadge: { gradient: 'from-indigo-500 to-blue-500', background: '#e0e7ff', text: '#4338ca' },
//     discountBadge: { gradient: 'from-red-500 to-pink-500', text: '#ffffff', background: '#fee2e2', textDark: '#dc2626' },
//     wishlist: { active: '#ef4444', inactive: '#9ca3af', hover: '#ef4444' },
//     sections: { hero: { badge: { background: 'rgba(255, 255, 255, 0.2)', text: '#ffffff' }, title: '#ffffff', subtitle: '#e0e7ff', button: { background: '#ffffff', text: '#4f46e5', hover: '#eef2ff' } }, featured: { badge: { background: '#e0e7ff', text: '#4338ca' }, gradient: 'from-gray-50 to-indigo-50/30' }, newArrivals: { badge: { background: '#d1fae5', text: '#047857' }, gradient: 'from-gray-50 to-green-50/30' }, specialOffers: { badge: { background: '#fee2e2', text: '#991b1b' }, gradient: 'from-gray-50 to-red-50/30', accent: '#ef4444' }, benefits: { iconBackground: '#e0e7ff', iconColor: '#4f46e5', cardBorder: '#f3f4f6' } }
//   },

//   animations: { duration: { fast: '200ms', normal: '300ms', slow: '700ms', slower: '1000ms' }, easing: 'ease-in-out', delay: { start: '0.1s', increment: '0.15s' } },

//   components: { productCard: { imageHeight: 'h-48', borderRadius: 'rounded-lg', shadow: 'shadow-sm', shadowHover: 'shadow-xl' }, button: { borderRadius: 'rounded-lg', paddingSmall: 'px-2 py-1.5', paddingMedium: 'px-4 py-2', paddingLarge: 'px-6 py-3' }, badge: { borderRadius: 'rounded-full', padding: 'px-3 py-1', fontSize: 'text-xs', fontWeight: 'font-semibold' }, card: { borderRadius: 'rounded-xl', padding: 'p-6', shadow: 'shadow-md', shadowHover: 'shadow-xl' } },

//   layout: { maxWidth: 'max-w-7xl', padding: { mobile: 'px-4', tablet: 'sm:px-6', desktop: 'lg:px-8' }, section: { paddingY: 'py-10', paddingYLarge: 'py-16' } }
// };

// // Organic Theme (Green, earthy tones)
// const organicTheme = {
//   ...defaultTheme,
//   logo: {
//     path: "/src/assets/Devrup_Organics_PNG.png",
//     alt: "Devrup Organics Logo",
//     height: {
//       mobile: "h-10",
//       desktop: "h-12"
//     }
//   },

//   tailwindClasses: {
//     primary: {
//       text: 'text-green-600',
//       bg: 'bg-green-600',
//       hover: 'hover:text-green-600',
//       bgHover: 'hover:bg-green-600',
//       gradient: 'from-green-600 to-green-400',
//       gradientHover: 'hover:from-green-700 hover:to-green-500',
//       ring: 'ring-green-500',
//       button: 'bg-gradient-to-r from-green-600 to-green-400 hover:from-green-700 hover:to-green-500 text-white',
//       rose: 'from-rose-500 to-pink-600',
//       roseRing: 'focus:ring-rose-500',
//     },
//     button: {
//       primary: 'bg-gradient-to-r from-green-600 to-green-400 hover:from-green-700 hover:to-green-500 text-white',
//     },
//     badge: {
//       notification: 'bg-red-500 text-white',
//       cart: 'bg-gradient-to-r from-green-600 to-green-400 text-white',
//     }
//   },

//   theme: {
//     ...defaultTheme.theme,
//     primary: { main: '#4CAF50', light: '#81C784', dark: '#388E3C', darker: '#2E7D32', gradient: 'from-green-600 to-green-400', gradientHover: 'from-green-700 to-green-500', mainRgb: '76, 175, 80', darkRgb: '56, 142, 60' },
//     secondary: { main: '#8BC34A', light: '#C5E1A5', dark: '#7CB342', darker: '#689F38', gradient: 'from-light-green-500 to-green-600' },
//     accent: { main: '#FFB74D', light: '#FFD54F', dark: '#F57C00', gradient: 'from-orange-400 to-orange-500' },
//     success: { main: '#81C784', light: '#A5D6A7', dark: '#388E3C', 50: '#E8F5E9', 100: '#C8E6C9', gradient: 'from-green-400 to-green-600' },
//     background: { ...defaultTheme.theme.background, primary: '#F0FFF0', secondary: '#E8F5E9', tertiary: '#D0F0C0', hero: 'from-green-600 to-green-400', heroSecondary: 'from-green-500 to-green-300' },
//     text: { ...defaultTheme.theme.text, primary: '#1B5E20', secondary: '#33691E', tertiary: '#558B2F' },
//     sections: {
//       ...defaultTheme.theme.sections,
//       hero: { badge: { background: 'rgba(255, 255, 255, 0.2)', text: '#1B5E20' }, title: '#1B5E20', subtitle: '#33691E', button: { background: '#4CAF50', text: '#ffffff', hover: '#81C784' } }
//     }
//   }
// };

// // Theme Selector
// const activeThemeType = "organic"; // Change to "organic" or "default"

// const siteConfig = activeThemeType === "organic" ? organicTheme : defaultTheme;

// export default siteConfig;

// Default Theme (Your current theme)
const defaultTheme = {
  shopName: "Devrup",
  logo: {
    path: "/src/assets/Devrup_Organics_PNG.png",
    alt: "Devrup Logo",
    height: {
      mobile: "h-10",
      desktop: "h-12"
    }
  },
  description: "Your one-stop destination for fresh groceries.",

  socialLinks: {
    facebook: "https://facebook.com/devruporganics",
    twitter: "https://twitter.com/devruporganics",
    instagram: "https://www.instagram.com/devrup_oraganic_products/",
  },

  contact: {
    address: "403, CHANDRABHAGA NIWAS, LAGAD COLONY NR LAGAD TRANSPORT NANDED PHATA, PUNE 411041, MAHARASTRA",
    phone: "+91 9765815854",
    email: "devruporganics@gmail.com",
    workingHours: "Monday to Sunday, 9am to 5pm",
  },

  legalLinks: {
    terms: "/terms",
    privacy: "/privacy",
    shipping: "/shipping",
    return: "/return",
  },

  currency: {
    symbol: "₹",
    code: "INR",
  },

  ShippingAndReturns: {
    freeShippingThreshold: 'Free shipping on orders over ₹1599',
    standardwarrenty: "1 month warranty on all products",
    returnPolicyDuration: "5-day money-back guarantee",
  },

  tailwindClasses: {
    primary: {
      text: 'text-indigo-600',
      bg: 'bg-indigo-600',
      hover: 'hover:text-indigo-600',
      bgHover: 'hover:bg-indigo-600',
      gradient: 'bg-gradient-to-r from-indigo-600 to-purple-600',
      gradientHover: 'hover:from-indigo-700 hover:to-purple-700',
      ring: 'ring-indigo-500',
      button: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white',
      rose: 'from-rose-500 to-pink-600',
      roseRing: 'focus:ring-rose-500',
    },
    button: {
      primary: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white',
    },
    badge: {
      notification: 'bg-red-500 text-white',
      cart: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white',
    }
  },

  theme: {
    primary: {
      main: '#6366f1',
      light: '#818cf8',
      dark: '#4f46e5',
      darker: '#4338ca',
      50: '#eef2ff',
      100: '#e0e7ff',
      gradient: 'from-indigo-600 to-purple-600',
      gradientHover: 'from-indigo-700 to-purple-700',
      mainRgb: '99, 102, 241',
      darkRgb: '79, 70, 229'
    },
    secondary: { main: '#8b5cf6', light: '#a78bfa', dark: '#7c3aed', darker: '#6d28d9', gradient: 'from-purple-600 to-indigo-600' },
    accent: { main: '#ec4899', light: '#f472b6', dark: '#db2777', gradient: 'from-red-500 to-pink-500' },
    success: { main: '#10b981', light: '#34d399', dark: '#059669', 50: '#ecfdf5', 100: '#d1fae5', gradient: 'from-green-500 to-emerald-600' },
    error: { main: '#ef4444', light: '#f87171', dark: '#dc2626', 50: '#fef2f2', 100: '#fee2e2' },
    warning: { main: '#f59e0b', light: '#fbbf24', dark: '#d97706' },
    info: { main: '#3b82f6', light: '#60a5fa', dark: '#2563eb' },
    neutral: { white: '#ffffff', black: '#000000', gray: { 50: '#f9fafb', 100: '#f3f4f6', 200: '#e5e7eb', 300: '#d1d5db', 400: '#9ca3af', 500: '#6b7280', 600: '#4b5563', 700: '#374151', 800: '#1f2937', 900: '#111827' } },
    background: { primary: '#ffffff', secondary: '#f9fafb', tertiary: '#f3f4f6', gradient: 'from-gray-50 to-white', hero: 'from-indigo-600 to-purple-700', heroSecondary: 'from-indigo-500 to-purple-600' },
    text: { primary: '#111827', secondary: '#6b7280', tertiary: '#9ca3af', white: '#ffffff', muted: '#6b7280', light: '#9ca3af' },
    border: { light: '#e5e7eb', main: '#d1d5db', dark: '#9ca3af', focus: '#818cf8' },
    hover: { background: '#f3f4f6', backgroundDark: '#e5e7eb', primary: '#4f46e5', secondary: '#7c3aed' },
    shadow: { sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)', md: '0 4px 6px -1px rgb(0 0 0 / 0.1)', lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)', xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)', '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)', colored: '0 10px 25px -5px rgba(99, 102, 241, 0.4)' },
    categoryBadge: { gradient: 'from-indigo-500 to-blue-500', background: '#e0e7ff', text: '#4338ca' },
    discountBadge: { gradient: 'from-red-500 to-pink-500', text: '#ffffff', background: '#fee2e2', textDark: '#dc2626' },
    wishlist: { active: '#ef4444', inactive: '#9ca3af', hover: '#ef4444' },
    sections: { hero: { badge: { background: 'rgba(255, 255, 255, 0.2)', text: '#ffffff' }, title: '#ffffff', subtitle: '#e0e7ff', button: { background: '#ffffff', text: '#4f46e5', hover: '#eef2ff' } }, featured: { badge: { background: '#e0e7ff', text: '#4338ca' }, gradient: 'from-gray-50 to-indigo-50/30' }, newArrivals: { badge: { background: '#d1fae5', text: '#047857' }, gradient: 'from-gray-50 to-green-50/30' }, specialOffers: { badge: { background: '#fee2e2', text: '#991b1b' }, gradient: 'from-gray-50 to-red-50/30', accent: '#ef4444' }, benefits: { iconBackground: '#e0e7ff', iconColor: '#4f46e5', cardBorder: '#f3f4f6' } }
  },

  animations: { duration: { fast: '200ms', normal: '300ms', slow: '700ms', slower: '1000ms' }, easing: 'ease-in-out', delay: { start: '0.1s', increment: '0.15s' } },

  components: { productCard: { imageHeight: 'h-48', borderRadius: 'rounded-lg', shadow: 'shadow-sm', shadowHover: 'shadow-xl' }, button: { borderRadius: 'rounded-lg', paddingSmall: 'px-2 py-1.5', paddingMedium: 'px-4 py-2', paddingLarge: 'px-6 py-3' }, badge: { borderRadius: 'rounded-full', padding: 'px-3 py-1', fontSize: 'text-xs', fontWeight: 'font-semibold' }, card: { borderRadius: 'rounded-xl', padding: 'p-6', shadow: 'shadow-md', shadowHover: 'shadow-xl' } },

  layout: { maxWidth: 'max-w-7xl', padding: { mobile: 'px-4', tablet: 'sm:px-6', desktop: 'lg:px-8' }, section: { paddingY: 'py-10', paddingYLarge: 'py-16' } }
};

// Organic Theme (Green, earthy tones)
const organicTheme = {
  ...defaultTheme,
  logo: {
    path: "/src/assets/Devrup_Organics_PNG.png",
    alt: "Devrup Logo",
    height: {
      mobile: "h-10",
      desktop: "h-12"
    }
  },

  tailwindClasses: {
    primary: {
      text: 'text-green-600',
      bg: 'bg-green-600',
      hover: 'hover:text-green-600',
      bgHover: 'hover:bg-green-600',
      gradient: 'bg-gradient-to-r from-green-600 to-green-400',
      gradientHover: 'hover:from-green-700 hover:to-green-500',
      ring: 'ring-green-500',
      button: 'bg-gradient-to-r from-green-600 to-green-400 hover:from-green-700 hover:to-green-500 text-white',
      rose: 'from-rose-500 to-pink-600',
      roseRing: 'focus:ring-rose-500',
    },
    button: {
      primary: 'bg-gradient-to-r from-green-600 to-green-400 hover:from-green-700 hover:to-green-500 text-white',
    },
    badge: {
      notification: 'bg-red-500 text-white',
      cart: 'bg-gradient-to-r from-green-600 to-green-400 text-white',
    }
  },

  theme: {
    ...defaultTheme.theme,
    primary: {
      main: '#4CAF50',
      light: '#81C784',
      dark: '#388E3C',
      darker: '#2E7D32',
      gradient: 'from-green-600 to-green-400',
      gradientHover: 'from-green-700 to-green-500',
      mainRgb: '76, 175, 80',
      darkRgb: '56, 142, 60'
    },
    secondary: {
      main: '#8BC34A',
      light: '#C5E1A5',
      dark: '#7CB342',
      darker: '#689F38',
      gradient: 'from-light-green-500 to-green-600'
    },
    accent: {
      main: '#FFB74D',
      light: '#FFD54F',
      dark: '#F57C00',
      gradient: 'from-orange-400 to-orange-500'
    },
    success: {
      main: '#81C784',
      light: '#A5D6A7',
      dark: '#388E3C',
      50: '#E8F5E9',
      100: '#C8E6C9',
      gradient: 'from-green-400 to-green-600'
    },
    background: {
      ...defaultTheme.theme.background,
      primary: '#F0FFF0',
      secondary: '#E8F5E9',
      tertiary: '#D0F0C0',
      hero: 'from-green-600 to-green-400',
      heroSecondary: 'from-green-500 to-green-300'
    },
    text: {
      ...defaultTheme.theme.text,
      primary: '#1B5E20',
      secondary: '#33691E',
      tertiary: '#558B2F'
    },
    sections: {
      ...defaultTheme.theme.sections,
      hero: {
        badge: { background: 'rgba(255, 255, 255, 0.2)', text: '#1B5E20' },
        title: '#1B5E20',
        subtitle: '#33691E',
        button: { background: '#4CAF50', text: '#ffffff', hover: '#81C784' }
      }
    }
  }
};

// Theme Selector

const activeThemeType = "default"; // set either "default" or "organic"

const siteConfig = activeThemeType === "organic" ? organicTheme : defaultTheme;

export default siteConfig;
