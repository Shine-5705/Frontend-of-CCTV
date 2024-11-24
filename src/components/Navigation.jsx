import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { FiMonitor, FiShield, FiLogOut, FiMenu, FiX, FiUser } from 'react-icons/fi';
import useAuthStore from '../store/authStore';

const Navigation = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = user ? [
    {
      to: '/monitor',
      icon: <FiMonitor />,
      label: 'Monitor',
      show: !user?.isAdmin
    },
    {
      to: '/admin',
      icon: <FiShield />,
      label: 'Admin',
      show: user?.isAdmin
    }
  ] : [];

  return (
    <nav className="bg-gray-900/50 backdrop-blur-md fixed w-full z-50 border-b border-gray-800/50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center"
            >
              <FiShield className="w-6 h-6 text-white" />
            </motion.div>
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400"
            >
              Hawkeye Surveillance
            </motion.span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <AnimatePresence mode="wait">
              {menuItems
                .filter(item => item.show !== false)
                .map(item => (
                  <NavLink key={item.to} to={item.to} icon={item.icon}>
                    {item.label}
                  </NavLink>
                ))}

              {user ? (
                <>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center space-x-2 bg-gray-800/50 px-3 py-1 rounded-full"
                  >
                    <img
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`}
                      alt="Avatar"
                      className="h-6 w-6 rounded-full"
                    />
                    <span className="text-sm font-medium">{user.username}</span>
                  </motion.div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                  >
                    <FiLogOut />
                    <span>Logout</span>
                  </motion.button>
                </>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/login')}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all"
                >
                  <FiUser />
                  <span>Login</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2"
          >
            {isOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-gray-900/50 backdrop-blur-md border-t border-gray-800/50"
          >
            <div className="px-4 py-2 space-y-2">
              {menuItems
                .filter(item => item.show !== false)
                .map(item => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-800/50 transition-colors"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ))}

              {user ? (
                <>
                  <div className="flex items-center space-x-2 px-4 py-2">
                    <img
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`}
                      alt="Avatar"
                      className="h-6 w-6 rounded-full"
                    />
                    <span className="text-sm font-medium">{user.username}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-800/50 transition-colors"
                  >
                    <FiLogOut />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    navigate('/login');
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all"
                >
                  <FiUser />
                  <span>Login</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const NavLink = ({ to, children, icon }) => (
  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
    <Link
      to={to}
      className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors"
    >
      {icon}
      <span>{children}</span>
    </Link>
  </motion.div>
);

export default Navigation;