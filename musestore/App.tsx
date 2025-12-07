
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ShoppingBagIcon, 
  XMarkIcon, 
  MinusIcon, 
  PlusIcon, 
  ArrowLeftIcon, 
  MagnifyingGlassIcon,
  Bars3Icon,
  HomeIcon,
  RectangleStackIcon,
  UserIcon,
  Cog6ToothIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  PhotoIcon,
  ArrowUpTrayIcon,
  PencilSquareIcon,
  CheckBadgeIcon,
  TrashIcon,
  CloudArrowUpIcon,
  CreditCardIcon,
  MapPinIcon,
  ClockIcon,
  ShieldCheckIcon,
  BanknotesIcon,
  TruckIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarIconOutline } from '@heroicons/react/24/outline';
import { editImage, chatWithGemini } from './services/gemini';

// --- Type Definitions ---
interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  badge?: string;
  collectionId?: number;
}

interface Collection {
  id: number;
  title: string;
  image: string;
  productCount: number;
}

interface CartItem extends Product {
  quantity: number;
}

interface Review {
  id: string;
  productId: number;
  author: string;
  rating: number;
  text: string;
  date: string;
}

interface Order {
  id: string;
  date: string;
  items: string[];
  total: number;
  status: 'Processing' | 'Shipped' | 'Delivered';
}

interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
}

// --- Mock Data ---
const INITIAL_COLLECTIONS: Collection[] = [
  {
    id: 1,
    title: "Summer Edit '25",
    image: "https://images.unsplash.com/photo-1523779105320-d1cd5a1e9306?auto=format&fit=crop&q=80&w=800",
    productCount: 12
  },
  {
    id: 2,
    title: "Office Essentials",
    image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&q=80&w=800",
    productCount: 8
  },
  {
    id: 3,
    title: "Evening Icons",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800",
    productCount: 5
  },
  {
    id: 4,
    title: "Travel Series",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800",
    productCount: 4
  }
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "The Muse Tote",
    price: 320,
    description: "Italian leather structured tote with gold-finish hardware. Perfect for the modern professional. Features a spacious interior with a padded laptop compartment.",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800",
    badge: "Best Seller",
    collectionId: 2
  },
  {
    id: 2,
    name: "Velvet Evening Clutch",
    price: 185,
    description: "Deep midnight blue velvet clutch with detachable chain strap. The perfect companion for your evening soirees.",
    image: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&q=80&w=800",
    collectionId: 3
  },
  {
    id: 3,
    name: "Canvas Weekender",
    price: 245,
    description: "Durable canvas travel bag with leather accents. Spacious and stylish, designed for the spontaneous traveler.",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800",
    badge: "New Arrival",
    collectionId: 4
  },
  {
    id: 4,
    name: "Mini Crossbody",
    price: 150,
    description: "Compact essential carrier. Fits phone, wallet and keys effortlessly. Adjustable strap for versatile styling.",
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=800",
    collectionId: 1
  },
  {
    id: 5,
    name: "Structure Backpack",
    price: 290,
    description: "Minimalist design meeting maximum utility. Water-resistant finish with ergonomic straps for all-day comfort.",
    image: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&q=80&w=800&sat=-100",
    collectionId: 4
  }
];

const INITIAL_REVIEWS: Review[] = [
  { id: '1', productId: 1, author: 'Elena R.', rating: 5, text: 'Absolutely stunning quality. The leather smells amazing.', date: '2 days ago' },
  { id: '2', productId: 1, author: 'Marco B.', rating: 4, text: 'Great bag, but the strap is a bit stiff initially.', date: '1 week ago' },
  { id: '3', productId: 3, author: 'Sarah J.', rating: 5, text: 'Perfect size for a weekend getaway!', date: '3 days ago' }
];

const INITIAL_HERO_IMAGES = [
  "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&q=80&w=1200", // Luxury bag focus
  "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=1200", // Editorial model replacement
  "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&q=80&w=1200", // Dark aesthetic
  "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&q=80&w=1200", // Fashion detail
];

const INITIAL_ORDERS: Order[] = [
  { id: '#MUS-8821', date: 'Oct 12, 2024', items: ['Canvas Weekender'], total: 245, status: 'Delivered' },
  { id: '#MUS-9102', date: 'Nov 01, 2024', items: ['Mini Crossbody', 'Leather Care Kit'], total: 185, status: 'Processing' }
];

// --- Global Telegram Types ---
declare global {
  interface Window {
    Telegram: {
      WebApp: {
        initDataUnsafe: {
            user?: {
                first_name: string;
                last_name?: string;
                username?: string;
                photo_url?: string;
            }
        };
        ready: () => void;
        expand: () => void;
        openInvoice: (url: string, callback?: (status: string) => void) => void;
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          show: () => void;
          hide: () => void;
          enable: () => void;
          disable: () => void;
          showProgress: (leaveActive: boolean) => void;
          hideProgress: () => void;
          onClick: (cb: () => void) => void;
          offClick: (cb: () => void) => void;
          setText: (text: string) => void;
          setParams: (params: { text?: string; color?: string; text_color?: string; is_active?: boolean; is_visible?: boolean }) => void;
        };
        BackButton: {
          isVisible: boolean;
          show: () => void;
          hide: () => void;
          onClick: (cb: () => void) => void;
          offClick: (cb: () => void) => void;
        };
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
        close: () => void;
        themeParams: {
          bg_color?: string;
          text_color?: string;
          button_color?: string;
          button_text_color?: string;
        };
      };
    };
  }
}

// --- Components ---

const Logo = () => (
  <div className="flex flex-col items-center justify-center leading-none">
    <span className="font-sans text-2xl font-bold tracking-wide text-black lowercase mb-0.5">muse.</span>
    <span className="text-[9px] uppercase tracking-[0.25em] text-zinc-500 font-medium">Lusso che ispira</span>
  </div>
);

const StarRating = ({ rating, size = "md", interactive = false, onRate }: { rating: number, size?: "sm" | "md" | "lg", interactive?: boolean, onRate?: (r: number) => void }) => {
  const stars = [1, 2, 3, 4, 5];
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-6 h-6"
  };

  return (
    <div className="flex gap-0.5">
      {stars.map((star) => (
        <button 
          key={star} 
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onRate && onRate(star)}
          className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
        >
          {star <= rating ? (
            <StarIcon className={`${sizeClasses[size]} text-black`} />
          ) : (
            <StarIconOutline className={`${sizeClasses[size]} text-zinc-300`} />
          )}
        </button>
      ))}
    </div>
  );
};

const Header = ({ 
  cartCount, 
  onOpenCart, 
  onOpenMenu 
}: { 
  cartCount: number, 
  onOpenCart: () => void, 
  onOpenMenu: () => void 
}) => (
  <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-100 px-4 h-16 flex items-center justify-between shadow-sm">
    <button 
      onClick={onOpenMenu}
      className="w-10 h-10 flex items-center justify-center -ml-2 text-zinc-800 hover:bg-zinc-100 rounded-full transition-colors"
    >
      <Bars3Icon className="w-6 h-6" />
    </button>
    <div className="flex-1 flex justify-center">
      <Logo />
    </div>
    <button 
      onClick={onOpenCart}
      className="relative p-2 text-zinc-800 hover:bg-zinc-100 rounded-full transition-colors w-10 h-10 flex items-center justify-center"
    >
      <ShoppingBagIcon className="w-6 h-6" />
      {cartCount > 0 && (
        <span className="absolute top-1 right-0 w-4 h-4 bg-black text-white text-[10px] font-bold flex items-center justify-center rounded-full animate-bounce">
          {cartCount}
        </span>
      )}
    </button>
  </header>
);

const NavigationMenu = ({ 
  isOpen, 
  onClose, 
  onNavigate,
  isAdmin,
  onToggleAdmin
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onNavigate: (view: any) => void;
  isAdmin: boolean;
  onToggleAdmin: () => void;
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const handleNav = (view: string) => {
    onNavigate(view);
    onClose();
  };

  return (
    <>
      <div 
        className={`fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      <div 
        className={`fixed inset-y-0 left-0 z-[70] w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                <span className="font-sans text-xl font-bold tracking-wide">muse.</span>
                <button onClick={onClose} className="p-1 rounded-full hover:bg-zinc-100 transition-colors">
                    <XMarkIcon className="w-6 h-6 text-zinc-500" />
                </button>
            </div>

            <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
                <button 
                    onClick={() => handleNav('home')}
                    className="flex items-center space-x-4 w-full p-3 rounded-xl hover:bg-zinc-50 text-zinc-600 hover:text-black transition-all group active:scale-95"
                >
                    <HomeIcon className="w-6 h-6 text-zinc-400 group-hover:text-black transition-colors" />
                    <span className="font-medium text-base">Home</span>
                </button>
                <button 
                    onClick={() => handleNav('collections')}
                    className="flex items-center space-x-4 w-full p-3 rounded-xl hover:bg-zinc-50 text-zinc-600 hover:text-black transition-all group active:scale-95"
                >
                    <RectangleStackIcon className="w-6 h-6 text-zinc-400 group-hover:text-black transition-colors" />
                    <span className="font-medium text-base">Collections</span>
                </button>
                <button 
                    onClick={() => handleNav('ai-studio')}
                    className="flex items-center space-x-4 w-full p-3 rounded-xl hover:bg-zinc-50 text-zinc-600 hover:text-black transition-all group active:scale-95 bg-gradient-to-r from-zinc-50 to-white border border-zinc-100"
                >
                    <SparklesIcon className="w-6 h-6 text-black" />
                    <span className="font-bold text-base bg-gradient-to-r from-black to-zinc-600 bg-clip-text text-transparent">MUSE Lab</span>
                </button>
                <button 
                    onClick={() => handleNav('user-settings')}
                    className="flex items-center space-x-4 w-full p-3 rounded-xl hover:bg-zinc-50 text-zinc-600 hover:text-black transition-all group active:scale-95"
                >
                    <UserIcon className="w-6 h-6 text-zinc-400 group-hover:text-black transition-colors" />
                    <span className="font-medium text-base">User Settings</span>
                </button>

                {/* Admin Toggle */}
                <div className="pt-4 border-t border-zinc-100 mt-4">
                  <button 
                      onClick={onToggleAdmin}
                      className={`flex items-center space-x-4 w-full p-3 rounded-xl transition-all group active:scale-95 ${isAdmin ? 'bg-black text-white' : 'hover:bg-zinc-50 text-zinc-600'}`}
                  >
                      <Cog6ToothIcon className={`w-6 h-6 ${isAdmin ? 'text-white' : 'text-zinc-400'}`} />
                      <div className="flex flex-col items-start">
                        <span className="font-medium text-base">Admin Mode</span>
                        <span className={`text-[10px] uppercase tracking-wide ${isAdmin ? 'text-zinc-400' : 'text-zinc-400'}`}>
                          {isAdmin ? 'Active' : 'Disabled'}
                        </span>
                      </div>
                  </button>
                </div>
            </nav>

            <div className="p-6 border-t border-zinc-100 bg-zinc-50/50">
                <div className="bg-zinc-900 rounded-xl p-4 text-white text-center mb-4">
                    <p className="text-xs font-bold uppercase tracking-widest mb-1">New Season</p>
                    <p className="text-sm font-serif italic">Fall / Winter 2024</p>
                </div>
                <p className="text-xs text-zinc-400 text-center">Version 2.1.0 &copy; MUSE</p>
            </div>
        </div>
      </div>
    </>
  );
};

const CollectionsView: React.FC<{
  collections: Collection[];
  isAdmin: boolean;
  onEditImage: (id: number) => void;
  onSelect: (id: number) => void;
  onClose: () => void;
}> = ({ collections, isAdmin, onEditImage, onSelect, onClose }) => {
  return (
    <div className="pt-16 px-4 pb-20 animate-in fade-in slide-in-from-right duration-300">
      <div className="flex items-center space-x-4 mb-6 mt-4">
         <button onClick={onClose} className="p-2 -ml-2 hover:bg-zinc-100 rounded-full">
            <ArrowLeftIcon className="w-6 h-6" />
         </button>
         <h1 className="text-2xl font-serif font-bold">Collections</h1>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {collections.map((collection) => (
          <div 
            key={collection.id}
            onClick={() => !isAdmin && onSelect(collection.id)}
            className="group relative h-48 sm:h-64 rounded-2xl overflow-hidden shadow-sm cursor-pointer"
          >
            <img 
              src={collection.image} 
              alt={collection.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
            
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <h3 className="text-2xl font-serif font-bold mb-1">{collection.title}</h3>
              <p className="text-xs uppercase tracking-widest opacity-80">{collection.productCount} Products</p>
            </div>

            {isAdmin && (
               <div className="absolute top-3 right-3 z-20">
                 <button 
                   onClick={(e) => {
                     e.stopPropagation();
                     onEditImage(collection.id);
                   }}
                   className="bg-white/90 backdrop-blur text-black p-2 rounded-full shadow-lg hover:scale-110 transition-transform"
                 >
                   <PencilSquareIcon className="w-5 h-5" />
                 </button>
               </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const UserSettingsView: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('profile');
  // Mock fetching user data from Telegram
  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
  const user = {
    name: tgUser ? `${tgUser.first_name} ${tgUser.last_name || ''}` : 'Guest User',
    username: tgUser?.username ? `@${tgUser.username}` : '@muse_guest',
    avatar: tgUser?.photo_url || null
  };

  return (
    <div className="pt-16 px-4 pb-20 animate-in fade-in slide-in-from-right duration-300 min-h-screen bg-zinc-50">
       <div className="flex items-center justify-between mb-6 mt-4">
         <div className="flex items-center space-x-3">
            <button onClick={onClose} className="p-2 -ml-2 hover:bg-zinc-200 rounded-full">
                <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold">My Account</h1>
         </div>
       </div>

       {/* Profile Card */}
       <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-zinc-200 flex items-center justify-center overflow-hidden border-2 border-white shadow-md">
            {user.avatar ? (
              <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-8 h-8 text-zinc-400" />
            )}
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-900">{user.name}</h2>
            <p className="text-sm text-zinc-500">{user.username}</p>
          </div>
       </div>

       {/* Tabs */}
       <div className="flex space-x-1 bg-zinc-200/50 p-1 rounded-xl mb-6">
         <button 
           onClick={() => setActiveTab('profile')}
           className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'profile' ? 'bg-white shadow-sm text-black' : 'text-zinc-500 hover:text-zinc-700'}`}
         >
           Settings
         </button>
         <button 
           onClick={() => setActiveTab('orders')}
           className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'orders' ? 'bg-white shadow-sm text-black' : 'text-zinc-500 hover:text-zinc-700'}`}
         >
           Orders
         </button>
       </div>

       {activeTab === 'profile' && (
         <div className="space-y-4">
            <div className="bg-white rounded-xl overflow-hidden border border-zinc-100 shadow-sm">
               <button className="w-full p-4 flex items-center justify-between hover:bg-zinc-50 transition-colors border-b border-zinc-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                      <CreditCardIcon className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-sm">Payment Methods</span>
                  </div>
                  <span className="text-xs text-zinc-400">Visa ending in 4242</span>
               </button>
               <button className="w-full p-4 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                      <MapPinIcon className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-sm">Saved Addresses</span>
                  </div>
                  <span className="text-xs text-zinc-400">2 addresses</span>
               </button>
            </div>

            <div className="bg-white rounded-xl overflow-hidden border border-zinc-100 shadow-sm">
               <button className="w-full p-4 flex items-center justify-between hover:bg-zinc-50 transition-colors border-b border-zinc-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                      <ShieldCheckIcon className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-sm">Privacy & Security</span>
                  </div>
               </button>
               <button className="w-full p-4 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600">
                      <BanknotesIcon className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-sm">Currency</span>
                  </div>
                  <span className="text-xs text-zinc-400">USD ($)</span>
               </button>
            </div>
         </div>
       )}

       {activeTab === 'orders' && (
         <div className="space-y-4">
           {INITIAL_ORDERS.map(order => (
             <div key={order.id} className="bg-white p-4 rounded-xl border border-zinc-100 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                   <div>
                     <p className="font-bold text-sm">{order.id}</p>
                     <p className="text-xs text-zinc-400">{order.date}</p>
                   </div>
                   <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                     {order.status}
                   </span>
                </div>
                <div className="space-y-1 mb-3">
                   {order.items.map((item, idx) => (
                     <p key={idx} className="text-sm text-zinc-600 flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 mr-2"></span>
                        {item}
                     </p>
                   ))}
                </div>
                <div className="pt-3 border-t border-zinc-50 flex justify-between items-center">
                   <div className="flex items-center space-x-2 text-xs text-zinc-500">
                      <TruckIcon className="w-4 h-4" />
                      <span>Standard Shipping</span>
                   </div>
                   <p className="font-bold text-sm">${order.total}.00</p>
                </div>
             </div>
           ))}
         </div>
       )}
    </div>
  );
};

const CartView: React.FC<{ 
  cart: CartItem[], 
  onUpdate: (id: number, delta: number) => void,
  onClose: () => void,
  onCheckout: () => void 
}> = ({ cart, onUpdate, onClose, onCheckout }) => {
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 25;
  const total = subtotal + shipping;

  return (
    <div className="fixed inset-0 z-50 bg-zinc-50 flex flex-col animate-in fade-in duration-200">
      <div className="bg-white px-4 py-4 flex items-center justify-between border-b border-zinc-100 shadow-sm">
        <button onClick={onClose} className="p-2 -ml-2 text-zinc-800 hover:bg-zinc-100 rounded-full">
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <span className="font-serif font-bold text-lg">Your Bag ({cart.reduce((a, c) => a + c.quantity, 0)})</span>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {cart.map(item => (
          <div key={item.id} className="flex gap-4 bg-white p-3 rounded-xl border border-zinc-100 shadow-sm">
            <div className="w-20 h-24 bg-zinc-100 rounded-lg overflow-hidden shrink-0">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 flex flex-col justify-between py-1">
              <div>
                <h4 className="font-medium text-sm text-zinc-900">{item.name}</h4>
                <p className="text-sm text-zinc-500 mt-0.5">${item.price}</p>
              </div>
              <div className="flex items-center gap-3 bg-zinc-50 w-fit rounded-lg px-2 py-1 border border-zinc-200">
                <button onClick={() => onUpdate(item.id, -1)} className="p-1 text-zinc-500 active:text-black">
                  <MinusIcon className="w-3 h-3" />
                </button>
                <span className="text-xs font-medium w-4 text-center">{item.quantity}</span>
                <button onClick={() => onUpdate(item.id, 1)} className="p-1 text-zinc-500 active:text-black">
                  <PlusIcon className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border-t border-zinc-100 p-6 space-y-3 shadow-[0_-4px_16px_rgba(0,0,0,0.05)]">
        <div className="flex justify-between text-sm text-zinc-600">
          <span>Subtotal</span>
          <span>${subtotal}</span>
        </div>
        <div className="flex justify-between text-sm text-zinc-600">
          <span>Express Shipping</span>
          <span>${shipping}</span>
        </div>
        <div className="flex justify-between font-bold text-lg text-black pt-2 border-t border-dashed border-zinc-200">
          <span>Total</span>
          <span>${total}</span>
        </div>
        <button 
          onClick={onCheckout}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl mt-4 flex items-center justify-center gap-2 transition-colors"
        >
           <BanknotesIcon className="w-5 h-5" />
           Pay with Telegram
        </button>
      </div>
    </div>
  );
};

const ChatWidget: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: '1', role: 'model', text: "Hello, I am Muse. I can assist you with product details, styling advice, or any questions about our brand. How may I help you today?" }
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim() || isTyping) return;

        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        try {
            // Prepare history for Gemini (excluding the just added user message for 'history' param usually, 
            // but for simple chat, we can pass previous context)
            const historyForApi = messages.map(m => ({
                role: m.role,
                parts: [{ text: m.text }]
            }));
            
            const responseText = await chatWithGemini(historyForApi, userMsg.text);
            
            const modelMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: responseText };
            setMessages(prev => [...prev, modelMsg]);
        } catch (error) {
            console.error(error);
        } finally {
            setIsTyping(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 sm:inset-auto sm:bottom-24 sm:right-6 sm:w-96 sm:h-[500px] flex flex-col bg-white sm:rounded-2xl sm:shadow-2xl sm:border border-zinc-200 animate-in slide-in-from-bottom-10 fade-in duration-300">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-100 bg-white/95 backdrop-blur rounded-t-2xl">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
                        <SparklesIcon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h3 className="font-serif font-bold text-sm">MUSE Concierge</h3>
                        <p className="text-[10px] text-zinc-400 uppercase tracking-widest">Always Available</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                    <XMarkIcon className="w-5 h-5 text-zinc-500" />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50">
                {messages.map((msg) => (
                    <div 
                        key={msg.id} 
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div 
                            className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
                                msg.role === 'user' 
                                    ? 'bg-black text-white rounded-tr-sm' 
                                    : 'bg-white text-zinc-800 border border-zinc-200 rounded-tl-sm shadow-sm'
                            }`}
                        >
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm border border-zinc-200 shadow-sm flex space-x-1">
                            <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"></div>
                            <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce delay-75"></div>
                            <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce delay-150"></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white border-t border-zinc-100 sm:rounded-b-2xl">
                <form 
                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                    className="flex items-center space-x-2 bg-zinc-100 rounded-full px-4 py-2"
                >
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask anything..." 
                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm placeholder-zinc-400 outline-none"
                    />
                    <button 
                        type="submit"
                        disabled={!input.trim() || isTyping}
                        className={`p-2 rounded-full transition-all ${input.trim() ? 'bg-black text-white' : 'bg-zinc-200 text-zinc-400'}`}
                    >
                        <PaperAirplaneIcon className="w-4 h-4" />
                    </button>
                </form>
            </div>
        </div>
    );
};

const SearchBar = ({ value, onSearch }: { value: string, onSearch: (val: string) => void }) => (
  <div className="sticky top-16 z-30 bg-white px-0 py-4 mb-2">
    <div className="relative">
      <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
      <input 
        type="text" 
        placeholder="Search collection..." 
        value={value}
        onChange={(e) => onSearch(e.target.value)}
        className="w-full pl-12 pr-4 py-3 bg-zinc-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-black/5 transition-all outline-none"
      />
    </div>
  </div>
);

const ProductCard = ({ 
  product, 
  onClick, 
  onAdd, 
  isAdmin, 
  onEditImage 
}: { 
  product: Product, 
  onClick: (p: Product) => void, 
  onAdd: (p: Product) => void, 
  isAdmin: boolean, 
  onEditImage: (p: Product) => void 
}) => (
  <div 
    onClick={() => onClick(product)}
    className="group flex flex-col gap-2 cursor-pointer relative"
  >
    <div className="relative aspect-[3/4] bg-zinc-100 rounded-xl overflow-hidden">
      <img 
        src={product.image} 
        alt={product.name} 
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
      />
      {product.badge && (
        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm">
          {product.badge}
        </div>
      )}
      
      {isAdmin && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onEditImage(product);
          }}
          className="absolute top-2 right-2 p-2 bg-white/90 rounded-full shadow-sm hover:scale-110 transition-transform z-10"
        >
          <PencilSquareIcon className="w-4 h-4" />
        </button>
      )}

      {!isAdmin && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onAdd(product);
          }}
          className="absolute bottom-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black hover:text-white"
        >
          <PlusIcon className="w-5 h-5" />
        </button>
      )}
    </div>
    
    <div>
      <div className="flex justify-between items-start">
        <h3 className="text-sm font-medium text-zinc-900 leading-tight">{product.name}</h3>
        <span className="text-sm font-bold">${product.price}</span>
      </div>
      <p className="text-xs text-zinc-500 mt-1 line-clamp-1">{product.description}</p>
    </div>
  </div>
);

const HeroSection = ({ 
  images, 
  isAdmin, 
  onEditImage,
  onAddImage
}: { 
  images: string[], 
  isAdmin: boolean,
  onEditImage: (index: number) => void,
  onAddImage: () => void
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollPosition = e.currentTarget.scrollLeft;
    const width = e.currentTarget.clientWidth;
    const index = Math.round(scrollPosition / width);
    setActiveIndex(index);
  };

  return (
    <div className={`relative h-[65vh] min-h-[450px] -mx-4 mb-0 group overflow-hidden bg-zinc-200 transition-all duration-300 ${isAdmin ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-white my-4 mx-0 rounded-lg shadow-xl' : ''}`}>
      
      {isAdmin && (
        <div className="absolute top-4 left-4 z-30 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md uppercase tracking-wide">
          Hero Section
        </div>
      )}

      <div 
        ref={scrollContainerRef}
        className="absolute inset-0 flex overflow-x-auto snap-x snap-mandatory scrollbar-none"
        onScroll={handleScroll}
        style={{ scrollBehavior: 'smooth' }}
      >
        {images.map((img, idx) => (
          <div key={idx} className="flex-shrink-0 w-full h-full snap-center relative">
            <img 
              src={img} 
              alt={`Campaign ${idx + 1}`} 
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90" />
            
            {/* Admin Edit Overlay - Shopify Style */}
            {isAdmin && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 backdrop-blur-[1px] opacity-100 transition-all">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditImage(idx);
                    }}
                    className="flex flex-col items-center gap-2 bg-white text-black px-6 py-4 rounded-xl shadow-2xl hover:scale-105 transition-transform"
                  >
                    <PencilSquareIcon className="w-6 h-6" />
                    <span className="text-xs font-bold uppercase tracking-widest">Edit Slide</span>
                  </button>
              </div>
            )}
          </div>
        ))}
        
        {/* Add New Slide Card for Admin */}
        {isAdmin && (
            <div className="flex-shrink-0 w-full h-full snap-center relative bg-zinc-100 flex items-center justify-center border-l border-zinc-200">
                <button 
                    onClick={onAddImage}
                    className="flex flex-col items-center gap-3 p-8 rounded-2xl border-2 border-dashed border-zinc-300 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                >
                    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                        <PlusIcon className="w-8 h-8 text-zinc-400 group-hover:text-blue-500" />
                    </div>
                    <span className="font-medium text-zinc-500 group-hover:text-blue-600">Add New Slide</span>
                </button>
            </div>
        )}
      </div>
      
      {!isAdmin && (
          <div className="absolute bottom-0 left-0 right-0 p-8 pb-12 flex flex-col items-center text-center text-white z-20 pointer-events-none">
            <div className="w-px h-12 bg-white/50 mb-4 animate-pulse"></div>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] mb-3 text-white/90 drop-shadow-md">New Collection</span>
            
            <p className="text-sm text-zinc-300 font-light max-w-xs leading-relaxed drop-shadow-md">
              Discover the new era of luxury. Handcrafted icons designed to elevate every moment.
            </p>
            
            <div className="flex space-x-2 mt-6 pointer-events-auto">
              {images.map((_, idx) => (
                <button
                    key={idx}
                    onClick={() => {
                      if (scrollContainerRef.current) {
                          scrollContainerRef.current.scrollTo({
                              left: idx * scrollContainerRef.current.clientWidth,
                              behavior: 'smooth'
                          });
                      }
                    }}
                    className={`h-1.5 rounded-full transition-all duration-300 shadow-sm ${idx === activeIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'}`}
                    aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
      )}
      
      <style>{`
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

// --- Main App Component ---
export default function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [view, setView] = useState<'home' | 'cart' | 'product' | 'ai-studio' | 'collections' | 'user-settings'>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // App Content State (Editable via Admin)
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [collections, setCollections] = useState<Collection[]>(INITIAL_COLLECTIONS);
  const [heroImages, setHeroImages] = useState<string[]>(INITIAL_HERO_IMAGES);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Admin Media Action Sheet State
  const [mediaSheetOpen, setMediaSheetOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState<{type: 'hero' | 'product' | 'collection', id: number | string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize Telegram WebApp
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      
      const theme = window.Telegram.WebApp.themeParams;
      if (theme.bg_color) {
        document.documentElement.style.setProperty('--tg-theme-bg-color', theme.bg_color);
      }
    }
  }, []);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
    }
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setView('product');
    window.Telegram?.WebApp?.BackButton.show();
  };

  // --- Payment Handler ---
  const handleTelegramPayment = () => {
    const tg = window.Telegram?.WebApp;
    if (!tg) {
        alert("This feature works inside Telegram.");
        return;
    }

    // SIMULATION: In a real app, you would call your backend to create an invoice link
    // const invoiceUrl = await createInvoiceOnBackend(cart);
    
    // Simulate loading
    tg.MainButton.showProgress(false);
    
    setTimeout(() => {
        // Since we can't generate a real invoice without a bot token and backend,
        // We simulate the flow success.
        tg.MainButton.hideProgress();
        
        tg.HapticFeedback.notificationOccurred('success');
        alert("Payment Successful! (Simulated for Demo)");
        setCart([]);
        setView('home');
    }, 1500);
  };

  // --- Admin Logic & Handlers ---
  
  const handleAdminEditHero = (index: number) => {
    setEditingTarget({ type: 'hero', id: index });
    setMediaSheetOpen(true);
  };

  const handleAdminAddHero = () => {
    setHeroImages(prev => [...prev, "https://images.unsplash.com/photo-1559563458-52c69f8f1f62?auto=format&fit=crop&q=80&w=1200"]);
    setEditingTarget({ type: 'hero', id: heroImages.length });
    setMediaSheetOpen(true);
  };

  const handleAdminEditProduct = (product: Product) => {
    setEditingTarget({ type: 'product', id: product.id });
    setMediaSheetOpen(true);
  };

  const handleAdminEditCollection = (id: number) => {
    setEditingTarget({ type: 'collection', id: id });
    setMediaSheetOpen(true);
  };

  const handleTriggerUpload = () => {
    setMediaSheetOpen(false);
    setTimeout(() => {
        fileInputRef.current?.click();
    }, 100);
  };

  const handleTriggerAI = () => {
    setMediaSheetOpen(false);
    setView('ai-studio');
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && editingTarget) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (ev) => {
            const result = ev.target?.result as string;
            if (editingTarget.type === 'hero') {
                const index = editingTarget.id as number;
                setHeroImages(prev => {
                    const next = [...prev];
                    next[index] = result;
                    return next;
                });
            } else if (editingTarget.type === 'product') {
                setProducts(prev => prev.map(p => 
                    p.id === editingTarget.id ? { ...p, image: result } : p
                ));
            } else if (editingTarget.type === 'collection') {
                setCollections(prev => prev.map(c => 
                    c.id === editingTarget.id ? { ...c, image: result } : c
                ));
            }
            setEditingTarget(null);
            if (window.Telegram?.WebApp?.HapticFeedback) {
                window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
            }
        };
        reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSaveAIImage = (newImageUrl: string) => {
    if (!editingTarget) return;

    if (editingTarget.type === 'hero') {
        const index = editingTarget.id as number;
        setHeroImages(prev => {
            const next = [...prev];
            next[index] = newImageUrl;
            return next;
        });
    } else if (editingTarget.type === 'product') {
        setProducts(prev => prev.map(p => 
            p.id === editingTarget.id ? { ...p, image: newImageUrl } : p
        ));
    } else if (editingTarget.type === 'collection') {
        setCollections(prev => prev.map(c => 
            c.id === editingTarget.id ? { ...c, image: newImageUrl } : c
        ));
    }

    setEditingTarget(null);
    setView(editingTarget.type === 'collection' ? 'collections' : 'home');
    if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
    }
  };

  // Sync with Native Main Button & Back Button
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    tg.MainButton.offClick(() => {}); 
    tg.BackButton.offClick(() => {});

    if (view === 'cart' && cart.length > 0) {
      const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 25;
      tg.MainButton.setText(`PAY $${total}`);
      tg.MainButton.show();
      tg.MainButton.onClick(handleTelegramPayment);
      
      tg.BackButton.show();
      tg.BackButton.onClick(() => setView('home'));

    } else if (view === 'product' && selectedProduct) {
      tg.MainButton.setText(`ADD TO BAG - $${selectedProduct.price}`);
      tg.MainButton.show();
      tg.MainButton.onClick(() => {
          addToCart(selectedProduct);
          tg.HapticFeedback.notificationOccurred('success');
          setView('home'); 
      });
      tg.BackButton.show();
      tg.BackButton.onClick(() => {
          setView('home');
          setSelectedProduct(null);
      });

    } else if (['ai-studio', 'collections', 'user-settings'].includes(view)) {
        tg.MainButton.hide();
        tg.BackButton.show();
        tg.BackButton.onClick(() => {
            setView('home');
            setEditingTarget(null);
        });
    } else if (view === 'home') {
      if (cart.length > 0) {
        tg.MainButton.setText(`VIEW BAG (${cart.reduce((a,c) => a + c.quantity, 0)})`);
        tg.MainButton.show();
        tg.MainButton.onClick(() => setView('cart'));
      } else {
        tg.MainButton.hide();
      }
      tg.BackButton.hide();
    }

    return () => {
      tg.MainButton.offClick(() => {});
      tg.BackButton.offClick(() => {});
    };
  }, [cart, view, selectedProduct]);

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));

    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.selectionChanged();
    }
  };

  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return products.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.description.toLowerCase().includes(q)
    );
  }, [searchQuery, products]);

  const currentProductReviews = useMemo(() => {
    if (!selectedProduct) return [];
    return reviews.filter(r => r.productId === selectedProduct.id);
  }, [reviews, selectedProduct]);

  const editingInitialImage = useMemo(() => {
      if (!editingTarget) return null;
      if (editingTarget.type === 'hero') return heroImages[editingTarget.id as number];
      if (editingTarget.type === 'product') return products.find(p => p.id === editingTarget.id)?.image || null;
      if (editingTarget.type === 'collection') return collections.find(c => c.id === editingTarget.id)?.image || null;
      return null;
  }, [editingTarget, heroImages, products, collections]);

  return (
    <div className="min-h-screen pb-20 bg-white text-black font-sans selection:bg-zinc-200">
      
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*"
        onChange={handleFileSelected}
      />

      <NavigationMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        onNavigate={setView}
        isAdmin={isAdmin}
        onToggleAdmin={() => setIsAdmin(!isAdmin)}
      />

      <MediaActionSheet 
        isOpen={mediaSheetOpen}
        onClose={() => {
            setMediaSheetOpen(false);
            setEditingTarget(null);
        }}
        onUpload={handleTriggerUpload}
        onAIEdit={handleTriggerAI}
        title={editingTarget?.type === 'hero' ? 'Edit Slide' : editingTarget?.type === 'collection' ? 'Edit Collection Cover' : 'Edit Product Image'}
      />

      {view === 'home' && (
        <>
          <Header 
            cartCount={cart.reduce((a, c) => a + c.quantity, 0)} 
            onOpenCart={() => setView('cart')}
            onOpenMenu={() => setIsMenuOpen(true)}
          />
          
          <main className="pt-16 px-4">
            <HeroSection 
                images={heroImages} 
                isAdmin={isAdmin} 
                onEditImage={handleAdminEditHero}
                onAddImage={handleAdminAddHero}
            />
            
            <SearchBar value={searchQuery} onSearch={setSearchQuery} />

            <div className="grid grid-cols-2 gap-3 pb-8">
              {filteredProducts.length > 0 ? (
                filteredProducts.map(product => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    onClick={handleProductClick}
                    onAdd={addToCart} 
                    isAdmin={isAdmin}
                    onEditImage={handleAdminEditProduct}
                  />
                ))
              ) : (
                <div className="col-span-2 py-12 text-center text-zinc-400 flex flex-col items-center">
                  <MagnifyingGlassIcon className="w-8 h-8 mb-2 opacity-50" />
                  <p>No collections found.</p>
                </div>
              )}
            </div>

            {/* Chatbot Toggle Button */}
            {!isChatOpen && (
                <button 
                  onClick={() => setIsChatOpen(true)}
                  className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-black text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-105 transition-transform"
                >
                  <ChatBubbleLeftRightIcon className="w-7 h-7" />
                </button>
            )}
          </main>
        </>
      )}

      {view === 'collections' && (
        <CollectionsView 
          collections={collections}
          isAdmin={isAdmin}
          onEditImage={handleAdminEditCollection}
          onSelect={(id) => {
              // Simple filter logic: in a real app this would filter the product view
              setSearchQuery(collections.find(c => c.id === id)?.title || '');
              setView('home');
          }}
          onClose={() => setView('home')}
        />
      )}

      {view === 'user-settings' && (
        <UserSettingsView onClose={() => setView('home')} />
      )}

      {view === 'cart' && (
        <CartView 
          cart={cart} 
          onUpdate={updateQuantity} 
          onClose={() => setView('home')} 
          onCheckout={handleTelegramPayment}
        />
      )}

      {view === 'product' && selectedProduct && (
        <ProductDetailView 
          product={selectedProduct} 
          reviews={currentProductReviews}
          onAddReview={(r) => setReviews(prev => [{ id: Date.now().toString(), productId: selectedProduct.id, date: 'Just now', ...r }, ...prev])}
          onClose={() => {
              setView('home');
              setSelectedProduct(null);
          }}
        />
      )}

      {view === 'ai-studio' && (
          <AIStudioView 
            onClose={() => {
                setView('home');
                setEditingTarget(null);
            }} 
            initialImage={editingInitialImage}
            onSave={editingTarget ? handleSaveAIImage : undefined}
          />
      )}

      <ChatWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}

// ... (MediaActionSheet, ProductDetailView, AIStudioView components kept from previous code) ...
const MediaActionSheet: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onUpload: () => void;
    onAIEdit: () => void;
    title: string;
}> = ({ isOpen, onClose, onUpload, onAIEdit, title }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center sm:justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="relative w-full sm:max-w-sm bg-white rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
                <div className="p-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                    <span className="font-bold text-sm text-zinc-900">{title}</span>
                    <button onClick={onClose}><XMarkIcon className="w-5 h-5 text-zinc-500" /></button>
                </div>
                <div className="p-4 space-y-3">
                    <button 
                        onClick={() => { onUpload(); }}
                        className="w-full flex items-center gap-3 p-4 bg-zinc-50 hover:bg-zinc-100 rounded-xl transition-colors text-left group"
                    >
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform text-blue-600">
                            <CloudArrowUpIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="block font-bold text-sm text-zinc-900">Upload from Library</span>
                            <span className="block text-xs text-zinc-500">Choose a photo from your device</span>
                        </div>
                    </button>
                    
                    <button 
                        onClick={() => { onAIEdit(); }}
                        className="w-full flex items-center gap-3 p-4 bg-zinc-50 hover:bg-zinc-100 rounded-xl transition-colors text-left group"
                    >
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform text-white">
                            <SparklesIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="block font-bold text-sm text-zinc-900">MUSE Lab (AI Studio)</span>
                            <span className="block text-xs text-zinc-500">Generate or edit with Gemini</span>
                        </div>
                    </button>
                </div>
                <div className="p-4 pt-0">
                    <button onClick={onClose} className="w-full py-3 text-sm font-medium text-zinc-500 hover:bg-zinc-50 rounded-xl transition-colors">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

const ProductDetailView: React.FC<{ 
  product: Product, 
  reviews: Review[], 
  onAddReview: (review: Omit<Review, 'id' | 'productId' | 'date'>) => void,
  onClose: () => void 
}> = ({ product, reviews, onAddReview, onClose }) => {
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState("");
  const [isWritingReview, setIsWritingReview] = useState(false);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    return reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
  }, [reviews]);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewText.trim()) return;
    onAddReview({
      author: 'You',
      rating: newReviewRating,
      text: newReviewText
    });
    setNewReviewText("");
    setIsWritingReview(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col animate-in slide-in-from-right duration-300">
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10">
        <button 
          onClick={onClose} 
          className="w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm text-zinc-900 hover:bg-white transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        <div className="w-full h-[55vh] relative">
           <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
           <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
        </div>

        <div className="px-6 py-6 -mt-8 relative bg-white rounded-t-3xl min-h-[50vh]">
          <div className="w-12 h-1 bg-zinc-200 rounded-full mx-auto mb-6"></div>
          
          <div className="flex justify-between items-start mb-2">
             <h1 className="text-2xl font-serif font-bold text-zinc-900">{product.name}</h1>
             <span className="text-xl font-bold text-black">${product.price}</span>
          </div>

          <div className="flex items-center space-x-2 mb-6">
            <StarRating rating={Math.round(averageRating)} size="sm" />
            <span className="text-xs text-zinc-500 font-medium">
              {averageRating.toFixed(1)} ({reviews.length} reviews)
            </span>
          </div>

          <p className="text-zinc-600 leading-relaxed text-sm mb-8">
            {product.description}
          </p>

          <hr className="border-zinc-100 mb-8" />

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">Reviews ({reviews.length})</h3>
              <button 
                onClick={() => setIsWritingReview(!isWritingReview)}
                className="text-xs font-bold uppercase tracking-wider text-black underline underline-offset-4"
              >
                {isWritingReview ? 'Cancel' : 'Write Review'}
              </button>
            </div>

            {isWritingReview && (
              <form onSubmit={handleSubmitReview} className="bg-zinc-50 p-4 rounded-xl space-y-4 animate-in fade-in slide-in-from-top-2">
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-500 mb-2">Your Rating</label>
                  <StarRating rating={newReviewRating} interactive onRate={setNewReviewRating} size="lg" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-500 mb-2">Your Review</label>
                  <textarea 
                    value={newReviewText}
                    onChange={(e) => setNewReviewText(e.target.value)}
                    className="w-full p-3 text-sm border border-zinc-200 rounded-lg focus:ring-1 focus:ring-black focus:border-black outline-none resize-none bg-white"
                    placeholder="Tell us what you think..."
                    rows={3}
                  />
                </div>
                <button 
                  type="submit"
                  disabled={!newReviewText.trim()}
                  className="w-full bg-black text-white py-3 rounded-lg text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <PaperAirplaneIcon className="w-4 h-4" />
                  Submit Review
                </button>
              </form>
            )}

            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-zinc-50 pb-6 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-zinc-100 rounded-full flex items-center justify-center text-xs font-bold text-zinc-600">
                        {review.author.charAt(0)}
                      </div>
                      <span className="text-sm font-medium">{review.author}</span>
                    </div>
                    <span className="text-[10px] text-zinc-400">{review.date}</span>
                  </div>
                  <div className="mb-2">
                    <StarRating rating={review.rating} size="sm" />
                  </div>
                  <p className="text-sm text-zinc-600 leading-relaxed">{review.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AIStudioView: React.FC<{ 
  onClose: () => void;
  initialImage?: string | null;
  onSave?: (image: string) => void;
}> = ({ onClose, initialImage, onSave }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(initialImage || null);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);

  useEffect(() => {
    if (initialImage) setSelectedImage(initialImage);
  }, [initialImage]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setSelectedImage(ev.target?.result as string);
        setResultImage(null);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleGenerate = async () => {
    if (!selectedImage || !prompt.trim()) return;
    
    setIsGenerating(true);
    try {
      let imagePayload = selectedImage;
      if (selectedImage.startsWith('http')) {
        try {
            const response = await fetch(selectedImage, { mode: 'cors' });
            if (!response.ok) throw new Error('Network response was not ok');
            const blob = await response.blob();
            imagePayload = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (err) {
            console.error("CORS/Fetch error:", err);
            throw new Error("Could not access the remote image directly. Please try uploading a file instead.");
        }
      }

      const generated = await editImage(imagePayload, prompt);
      setResultImage(generated);
    } catch (error: any) {
      alert(error.message || "Failed to generate image.");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col animate-in fade-in slide-in-from-bottom-4">
      <div className="px-4 py-3 border-b border-zinc-100 flex items-center justify-between bg-white/95 backdrop-blur z-10">
        <button onClick={onClose} className="p-2 -ml-2 hover:bg-zinc-100 rounded-full">
            <XMarkIcon className="w-6 h-6" />
        </button>
        <div className="text-center">
            <h2 className="font-serif font-bold text-lg">MUSE Lab</h2>
            <p className="text-[10px] text-zinc-400 uppercase tracking-widest">Powered by Gemini</p>
        </div>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="bg-zinc-50 rounded-2xl border border-dashed border-zinc-300 min-h-[40vh] flex flex-col items-center justify-center relative overflow-hidden">
            {isGenerating && (
                <div className="absolute inset-0 z-20 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                    <SparklesIcon className="w-10 h-10 animate-spin-slow mb-3 text-white" />
                    <p className="font-serif italic animate-pulse">Reimagining...</p>
                </div>
            )}
            
            {resultImage ? (
                <img src={resultImage} alt="Generated" className="w-full h-full object-contain" />
            ) : selectedImage ? (
                <img src={selectedImage} alt="Original" className="w-full h-full object-contain" />
            ) : (
                <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full p-8">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                        <ArrowUpTrayIcon className="w-8 h-8 text-zinc-400" />
                    </div>
                    <p className="text-sm font-medium text-zinc-600 text-center">Tap to upload a photo</p>
                    <p className="text-xs text-zinc-400 mt-2 text-center">JPG, PNG supported</p>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
            )}
        </div>

        <div className="mt-6 space-y-4">
             {resultImage ? (
                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={() => { setResultImage(null); }}
                        className="py-3 px-4 rounded-xl border border-zinc-200 font-medium text-sm"
                    >
                        Try Again
                    </button>
                    {onSave ? (
                         <button 
                            onClick={() => onSave(resultImage)}
                            className="py-3 px-4 rounded-xl bg-black text-white font-medium text-sm flex items-center justify-center gap-2"
                        >
                            <CheckBadgeIcon className="w-4 h-4" />
                            Save to App
                        </button>
                    ) : (
                        <a 
                            href={resultImage} 
                            download="muse-lab-edit.png"
                            className="py-3 px-4 rounded-xl bg-black text-white font-medium text-sm flex items-center justify-center"
                        >
                            Download
                        </a>
                    )}
                </div>
             ) : (
                <>
                    <div>
                        <label className="block text-xs font-bold uppercase text-zinc-500 mb-2 ml-1">The Vision</label>
                        <div className="relative">
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="E.g., Add a vintage film filter, remove the background, make it sunset..."
                                className="w-full p-4 pr-12 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-1 focus:ring-black focus:border-black outline-none resize-none min-h-[100px]"
                            />
                            <SparklesIcon className="absolute top-4 right-4 w-5 h-5 text-zinc-400" />
                        </div>
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={!selectedImage || !prompt.trim() || isGenerating}
                        className="w-full py-4 bg-black text-white rounded-xl font-bold text-sm tracking-wide disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                    >
                        {isGenerating ? 'Processing...' : 'Generate Magic'}
                    </button>
                </>
             )}
        </div>
      </div>
    </div>
  );
};
