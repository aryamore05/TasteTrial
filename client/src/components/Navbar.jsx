import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  UtensilsCrossed,
  Sparkles,
  Heart,
  Compass,
  User,
  LogOut,
  Menu,
  X,
  History,
  Lightbulb,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { favorites } = useFavorites();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const navLinks = [
    { name: 'Discover', path: '/', icon: Compass },
    {
      name: 'Smart Match',
      path: '/smart-match',
      icon: Sparkles,
      highlight: true,
    },
    { name: 'Recommendations', path: '/recommendations', icon: Lightbulb },
    {
      name: 'Favorites',
      path: '/favorites',
      icon: Heart,
      badge: isAuthenticated ? favorites.length : 0,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 text-[#111827] group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF6B35] to-[#FF8A54] flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-[#111827]">
                Taste<span className="text-[#FF6B35]">Trail</span>
              </span>
              <span className="text-[10px] -mt-1 font-semibold uppercase tracking-wider text-gray-600">
                Smart Food Discovery
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
                    active
                      ? link.highlight
                        ? 'bg-[#FF6B35] text-white shadow-sm shadow-[#FF6B35]/30'
                        : 'bg-gray-100 text-[#111827]'
                      : link.highlight
                      ? 'text-[#FF6B35] hover:bg-orange-50'
                      : 'text-gray-600 hover:text-[#111827] hover:bg-gray-50'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      active && link.highlight ? 'text-white' : ''
                    }`}
                  />
                  <span>{link.name}</span>
                  {link.badge > 0 && (
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                        active
                          ? 'bg-white/30 text-white'
                          : 'bg-orange-100 text-[#FF6B35]'
                      }`}
                    >
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Auth Area */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200 hover:border-gray-300 bg-white transition-all text-sm font-medium text-[#111827] shadow-sm"
                >
                  <div className="w-7 h-7 rounded-full bg-orange-100 text-[#FF6B35] flex items-center justify-center font-bold text-xs">
                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <span className="max-w-[120px] truncate">{user?.name}</span>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs font-semibold text-gray-600">
                        Signed in as
                      </p>
                      <p className="text-sm font-bold text-[#111827] truncate">
                        {user?.email}
                      </p>
                    </div>
                    <Link
                      to="/favorites"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-medium"
                    >
                      <Heart className="w-4 h-4 text-red-500" />
                      Favorites ({favorites.length})
                    </Link>
                    <Link
                      to="/recommendations"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-medium"
                    >
                      <Lightbulb className="w-4 h-4 text-[#FF6B35]" />
                      Recommendations
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-medium transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/auth"
                  className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-[#111827] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth?mode=signup"
                  className="px-4 py-2 text-sm font-semibold text-white bg-[#1F2937] hover:bg-[#111827] rounded-xl transition-all shadow-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-gray-700 hover:bg-gray-100 focus:outline-none"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-base font-semibold ${
                  active
                    ? 'bg-[#FF6B35] text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span>{link.name}</span>
                </div>
                {link.badge > 0 && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      active ? 'bg-white/30 text-white' : 'bg-orange-100 text-[#FF6B35]'
                    }`}
                  >
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="border-t border-gray-100 pt-3 mt-2">
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="px-3 py-1">
                  <p className="text-xs text-gray-600">Signed in as</p>
                  <p className="text-sm font-bold text-[#111827]">{user?.name}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 font-semibold"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-4 py-2.5 text-sm font-bold text-gray-700 bg-gray-100 rounded-xl"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth?mode=signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-4 py-2.5 text-sm font-bold text-white bg-[#FF6B35] rounded-xl"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
