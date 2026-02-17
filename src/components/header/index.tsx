// components/header/Header.tsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, 
  X, 
  Search, 
  Bell, 
  User, 
  Settings, 
  LogOut, 
  Home, 
  PenTool, 
  Bookmark, 
  ChevronDown, 
  Sparkles,
  Award,
  Check,
  Clock,
  ArrowRight,
  Tag,
  TrendingUp,
  Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/slices/hooks';
import { logout } from '../../redux/slices/authSlice';
import { setFilters } from '../../redux/slices/postsListSlice';

// Mobile Search Component
const MobileSearch: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [recentSearches] = useState(['Attack on Titan', 'Studio Ghibli', 'One Piece']);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      dispatch(setFilters({ search: searchQuery }));
      navigate('/');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="bg-black/90 backdrop-blur-xl border-b border-white/10">
        <div className="p-4">
          <div className="flex items-center space-x-4 mb-4">
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(query)}
                placeholder="Search anime, users, or topics..."
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-pink-400"
              />
            </div>
          </div>

          {/* Recent Searches */}
          {!query && recentSearches.length > 0 && (
            <div className="mb-6">
              <h3 className="text-white font-medium mb-3 flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Recent Searches</span>
              </h3>
              <div className="space-y-2">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(search)}
                    className="w-full text-left p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all flex items-center justify-between"
                  >
                    <span className="text-gray-300">{search}</span>
                    <ArrowRight className="w-4 h-4 text-gray-500" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Trending Topics */}
          {!query && (
            <div className="mt-6">
              <h3 className="text-white font-medium mb-3 flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>Trending Now</span>
              </h3>
              <div className="space-y-2">
                {['Attack on Titan finale', 'Studio MAPPA news', 'One Piece 1000'].map((trend, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(trend)}
                    className="w-full text-left p-3 bg-gradient-to-r from-pink-500/10 to-violet-500/10 hover:from-pink-500/20 hover:to-violet-500/20 border border-pink-500/20 rounded-xl transition-all flex items-center justify-between"
                  >
                    <span className="text-pink-300">{trend}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Mobile Menu Component
const MobileMenu: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  // const { notifications } = useAppSelector((state) => state.notifications);

  // const unreadCount = notifications?.unreadCount || 0;

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/auth');
    onClose();
  };

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'admin': return <Award className="w-4 h-4 text-yellow-400" />;
      case 'moderator': return <Award className="w-4 h-4 text-blue-400" />;
      case 'verified': return <Check className="w-4 h-4 text-green-400" />;
      default: return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="absolute left-0 top-0 bottom-0 w-80 bg-black/95 backdrop-blur-xl border-r border-white/10 overflow-y-auto">
        <div className="sticky top-0 bg-black/90 backdrop-blur-xl border-b border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">
                Solo<span className="text-gradient-rose">Blogger</span>
              </span>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* User Profile Section */}
          {user && (
            <div className="text-center pb-6 border-b border-white/10">
              <div className="relative inline-block mb-4">
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face'}
                  alt={user.name}
                  className="w-20 h-20 rounded-full border-4 border-white/20"
                />
              </div>
              <h3 className="text-white font-bold text-lg">{user.name}</h3>
              <p className="text-gray-400">@{user.username}</p>
            </div>
          )}

          {/* Main Navigation */}
          <div className="space-y-2">
            <button
              onClick={() => handleNavigate('/')}
              className="w-full flex items-center space-x-3 p-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
            >
              <Home className="w-5 h-5" />
              <span className="font-medium">Home</span>
            </button>

            <button
              onClick={() => handleNavigate('/createPost')}
              className="w-full flex items-center space-x-3 p-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
            >
              <PenTool className="w-5 h-5" />
              <span className="font-medium">Create Post</span>
            </button>

            <button
              onClick={() => handleNavigate('/bookmarks')}
              className="w-full flex items-center space-x-3 p-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
            >
              <Bookmark className="w-5 h-5" />
              <span className="font-medium">Bookmarks</span>
            </button>

            <button
              onClick={() => handleNavigate('/profile')}
              className="w-full flex items-center space-x-3 p-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
            >
              <User className="w-5 h-5" />
              <span className="font-medium">Profile</span>
            </button>

          </div>

          {/* Logout */}
          <div className="pt-4 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 p-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Header Component
const Header: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const filters = useAppSelector((state) => state.postsList.filters);
  
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState(filters.search || '');

  // Keep local search query in sync with Redux filter (e.g. if cleared from HomePage)
  useEffect(() => {
    setSearchQuery(filters.search || '');
  }, [filters.search]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      dispatch(setFilters({ search: searchQuery }));
      navigate('/');
    }
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setShowProfileMenu(false);
    setShowNotifications(false);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/auth');
    setShowProfileMenu(false);
  };

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'admin': return <Award className="w-4 h-4 text-yellow-400" />;
      case 'moderator': return <Award className="w-4 h-4 text-blue-400" />;
      case 'verified': return <Check className="w-4 h-4 text-green-400" />;
      default: return null;
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 glass-panel border-b border-white/10">
        <div className="px-4 sm:px-6">
          {/* Mobile Header */}
          <div className="flex items-center justify-between h-16 lg:hidden">
            <button 
              onClick={() => setShowMobileMenu(true)} 
              className="hidden md:block p-2 text-gray-400 hover:text-white transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex items-center space-x-2" onClick={() => navigate('/')}>
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold">
                Solo<span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-violet-400">Blogger</span>
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button onClick={() => setShowMobileSearch(true)} className="p-2 text-gray-400 hover:text-white transition-colors">
                <Search className="w-5 h-5" />
              </button>

              <button 
                onClick={() => handleNavigate('/notifications')} 
                className="relative p-2 text-gray-400 hover:text-white transition-colors"
              >
                <Bell className="w-5 h-5" />
              </button>
              
              <button 
                onClick={handleLogout}
                className="md:hidden p-2 text-red-400 hover:text-red-300 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">
                  Solo<span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-violet-400">Blogger</span>
                </span>
              </div>


            </div>

            <div className="flex-1 max-w-2xl mx-8">
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-pink-400 focus:bg-white/15 transition-all duration-300"
                />
              </form>
            </div>

            <div className="flex items-center space-x-4">
              <button onClick={() => navigate('/createPost')} className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-rose-700 transition-all shadow-lg hover:shadow-rose-500/20">
                <PenTool className="w-4 h-4" />
                <span>Create</span>
              </button>

              <button onClick={() => handleNavigate('/notifications')} className="relative p-2 text-gray-400 hover:text-white transition-colors">
                <Bell className="w-6 h-6" />
                {/* {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )} */}
              </button>

              {isAuthenticated && user && (
                <div className="relative">
                  <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="flex items-center space-x-2 p-1 text-gray-400 hover:text-white transition-colors">
                    <img
                      src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face'}
                      alt={user.name}
                      className="w-8 h-8 rounded-full border-2 border-white/20"
                    />
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {showProfileMenu && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-black/95 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl">
                      <div className="p-4 border-b border-white/10">
                        <div className="flex items-center space-x-3">
                          <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full border-2 border-white/20" />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-white truncate">{user.name}</p>
                            <p className="text-gray-400 text-sm">@{user.username}</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-2">
                        <button onClick={() => handleNavigate('/profile')} className="w-full flex items-center space-x-3 p-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                          <User className="w-5 h-5" />
                          <span>Profile</span>
                        </button>
                        <button onClick={() => handleNavigate('/bookmarks')} className="w-full flex items-center space-x-3 p-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                          <Bookmark className="w-5 h-5" />
                          <span>Bookmarks</span>
                        </button>
                        
                        <hr className="my-2 border-white/10" />
                        <button onClick={handleLogout} className="w-full flex items-center space-x-3 p-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all">
                          <LogOut className="w-5 h-5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <MobileMenu isOpen={showMobileMenu} onClose={() => setShowMobileMenu(false)} />
      <MobileSearch isOpen={showMobileSearch} onClose={() => setShowMobileSearch(false)} />

      {/* Bottom Tab Bar (Mobile Only) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
        <div className="bg-black/95 backdrop-blur-xl border-t border-white/20 px-4 py-2">
          <div className="flex items-center justify-around">
            {[
              { icon: Home, label: 'Home', path: '/', active: true },
              { icon: Search, label: 'Search', action: () => setShowMobileSearch(true) },
              { icon: PenTool, label: 'Create', path: '/createPost', special: true },
              { icon: Bookmark, label: 'Bookmarks', path: '/bookmarks' },
              { icon: User, label: 'Profile', path: '/profile' }
            ].map((item, idx) => (
              <button
                key={idx}
                onClick={() => item.action ? item.action() : navigate(item.path!)}
                className={`relative flex flex-col items-center space-y-1 p-2 transition-all ${
                  item.special
                    ? 'p-3 bg-gradient-to-r from-rose-500 to-orange-400 rounded-full -mt-4 shadow-lg'
                    : item.active
                    ? 'text-pink-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <item.icon className={`${item.special ? 'w-6 h-6 text-white' : 'w-5 h-5'}`} />
                {!item.special && <span className="text-xs font-medium">{item.label}</span>}
                {/* {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )} */}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;