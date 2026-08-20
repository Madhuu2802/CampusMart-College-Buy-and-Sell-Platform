import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Badge,
  Tooltip,
  Divider
} from '@mui/material';
import {
  Restaurant,
  ShoppingCart,
  AccountCircle,
  Logout,
  Dashboard,
  Store,
  ShoppingBag,
  AdminPanelSettings,
  Receipt,
  Person,
  DarkMode,
  LightMode,
  SettingsBrightness
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useCart } from '../contexts/CartContext';

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, logout } = useAuth();
  const { isDarkMode, themeMode, toggleTheme } = useTheme();
  const { getCartItemsCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/login');
  };

  const handleNavigation = (path) => {
    navigate(path);
    handleMenuClose();
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const getNavItems = () => {
    const items = [
      {
        label: 'Dashboard',
        path: '/dashboard',
        icon: <Dashboard />,
        roles: ['student', 'vendor', 'admin']
      }
    ];

    // Show My Business only when vendor is approved
    if (user?.role === 'vendor' && user?.vendorDetails?.isApproved) {
      items.push({
        label: 'My Business',
        path: '/vendor-dashboard',
        icon: <Store />,
        roles: ['vendor']
      });
    }

    if (user?.role === 'student' || user?.role === 'admin') {
      items.push({
        label: 'Marketplace',
        path: '/marketplace',
        icon: <ShoppingBag />,
        roles: ['student', 'admin']
      });
    }

    // Add Vendors directory for students/admin to browse approved vendors
    if (user?.role === 'student' || user?.role === 'admin') {
      items.push({
        label: 'Vendors',
        path: '/vendors',
        icon: <Store />,
        roles: ['student', 'admin']
      });
    }

    if (user?.role === 'admin') {
      items.push({
        label: 'Admin Panel',
        path: '/admin',
        icon: <AdminPanelSettings />,
        roles: ['admin']
      });
    }

    return items.filter(item => item.roles.includes(user?.role));
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        background: isDarkMode 
          ? 'linear-gradient(135deg, #9B1313 0%, #38000A 50%, #CD1C18 100%)'
          : 'linear-gradient(135deg, #B71C1C 0%, #D32F2F 50%, #8B0000 100%)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: isDarkMode 
          ? '0 8px 32px rgba(155, 19, 19, 0.4), 0 2px 16px rgba(56, 0, 10, 0.3)'
          : '0 8px 32px rgba(205, 28, 24, 0.4), 0 2px 16px rgba(255, 168, 150, 0.3)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
          animation: 'shimmer 3s ease-in-out infinite',
          pointerEvents: 'none'
        },
        '@keyframes shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        },
        '@keyframes pulse': {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.8, transform: 'scale(1.05)' }
        }
      }}
    >
      <Toolbar>
        {/* Logo */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            mr: 4,
            position: 'relative',
            padding: '8px 16px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.2)',
              transform: 'translateY(-2px) scale(1.05)',
              boxShadow: '0 8px 25px rgba(255, 255, 255, 0.2)'
            }
          }}
          onClick={() => navigate('/dashboard')}
        >
          <Restaurant 
            sx={{ 
              mr: 1, 
              fontSize: 32,
              background: 'linear-gradient(45deg, #FFA896, #ffffff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
              animation: 'pulse 2s ease-in-out infinite'
            }} 
          />
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 800,
              fontSize: '1.4rem',
              background: 'linear-gradient(45deg, #ffffff, #FFA896)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              letterSpacing: '0.5px'
            }}
          >
            Campus Mart
          </Typography>
        </Box>

        {/* Navigation Items */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, flexGrow: 1, ml: 2 }}>
          {getNavItems().map((item) => (
            <Button
              key={item.path}
              color="inherit"
              startIcon={item.icon}
              onClick={() => handleNavigation(item.path)}
              sx={{
                mx: 1,
                px: 3,
                py: 1,
                borderRadius: '20px',
                fontWeight: 600,
                fontSize: '0.95rem',
                textTransform: 'none',
                position: 'relative',
                overflow: 'hidden',
                background: isActive(item.path) 
                  ? 'linear-gradient(45deg, rgba(255,255,255,0.25), rgba(211,47,47,0.3))'
                  : 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: isActive(item.path) 
                  ? '2px solid rgba(255,255,255,0.4)'
                  : '1px solid rgba(255,255,255,0.2)',
                boxShadow: isActive(item.path) 
                  ? '0 4px 15px rgba(255,255,255,0.2)'
                  : 'none',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                  transition: 'left 0.5s ease'
                },
                '&:hover': {
                  background: 'linear-gradient(45deg, rgba(255,255,255,0.3), rgba(211,47,47,0.4))',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(255,255,255,0.25)',
                  border: '2px solid rgba(255,255,255,0.5)',
                  '&::before': {
                    left: '100%'
                  }
                },
                '& .MuiButton-startIcon': {
                  transition: 'transform 0.3s ease',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                },
                '&:hover .MuiButton-startIcon': {
                  transform: 'scale(1.2) rotate(5deg)'
                }
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        {/* Right side items */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Theme Toggle */}
          <Tooltip title={themeMode === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}>
            <IconButton
              color="inherit"
              onClick={toggleTheme}
              sx={{
                p: 1.5,
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.2)',
                  transform: 'translateY(-2px) scale(1.1)',
                  boxShadow: '0 6px 20px rgba(255, 255, 255, 0.2)'
                },
                '& svg': {
                  fontSize: '1.4rem',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                  transition: 'all 0.3s ease'
                }
              }}
            >
              {themeMode === 'light' ? <LightMode /> : <DarkMode />}
            </IconButton>
          </Tooltip>
          {/* Cart Icon (for students) */}
          {user?.role === 'student' && (
            <Tooltip title={`Cart (${getCartItemsCount()} items)`}>
              <IconButton
                color="inherit"
                onClick={() => navigate('/cart')}
                sx={{
                  p: 1.5,
                  borderRadius: '12px',
                  background: isActive('/cart') 
                    ? 'linear-gradient(45deg, rgba(255,255,255,0.3), rgba(211,47,47,0.4))'
                    : 'linear-gradient(45deg, rgba(255,255,255,0.15), rgba(211,47,47,0.2))',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, rgba(255,255,255,0.35), rgba(211,47,47,0.45))',
                    transform: 'translateY(-2px) scale(1.1)',
                    boxShadow: '0 6px 20px rgba(255, 255, 255, 0.2)'
                  },
                  '& svg': {
                    fontSize: '1.4rem',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                  }
                }}
              >
                <Badge 
                  badgeContent={getCartItemsCount()} 
                  color="error"
                  sx={{
                    '& .MuiBadge-badge': {
                      background: 'linear-gradient(45deg, #FF6B6B, #FF8E53)',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.75rem',
                      minWidth: '20px',
                      height: '20px',
                      borderRadius: '10px',
                      border: '2px solid rgba(255,255,255,0.8)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                    }
                  }}
                >
                  <ShoppingCart />
                </Badge>
              </IconButton>
            </Tooltip>
          )}

          {/* Orders Icon */}
          <Tooltip title="Orders">
            <IconButton
                color="inherit"
                onClick={() => navigate('/orders')}
                sx={{
                  p: 1.5,
                  borderRadius: '12px',
                  background: isActive('/orders') 
                    ? 'linear-gradient(45deg, rgba(255,255,255,0.25), rgba(211,47,47,0.3))'
                    : 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, rgba(255,255,255,0.2), rgba(211,47,47,0.2))',
                    transform: 'translateY(-2px) scale(1.1)',
                    boxShadow: '0 6px 20px rgba(255, 255, 255, 0.2)'
                  },
                  '& svg': {
                    fontSize: '1.4rem',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                  }
                }}
            >
              <Receipt />
            </IconButton>
          </Tooltip>

          {/* User Menu */}
          <Tooltip title="Account">
            <IconButton
              onClick={handleMenuOpen}
              sx={{
                p: 0.5,
                ml: 2,
                borderRadius: '50%',
                background: 'linear-gradient(45deg, rgba(255,255,255,0.2), rgba(255,168,150,0.3))',
                backdropFilter: 'blur(15px)',
                border: '3px solid rgba(255, 255, 255, 0.4)',
                boxShadow: '0 4px 15px rgba(255, 255, 255, 0.2)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: -2,
                  left: -2,
                  right: -2,
                  bottom: -2,
                  borderRadius: '50%',
                  background: 'linear-gradient(45deg, #D32F2F, #ffffff, #B71C1C)',
                  zIndex: -1,
                  opacity: 0,
                  transition: 'opacity 0.3s ease'
                },
                '&:hover': {
                  transform: 'translateY(-3px) scale(1.1)',
                  boxShadow: '0 8px 25px rgba(255, 255, 255, 0.3)',
                  border: '3px solid rgba(255, 255, 255, 0.6)',
                  '&::before': {
                    opacity: 1
                  }
                }
              }}
            >
              <Avatar
                sx={{
                  width: 42,
                  height: 42,
                  background: 'linear-gradient(135deg, #CD1C18, #FFA896)',
                  color: 'white',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  border: '2px solid rgba(255,255,255,0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'rotate(5deg)'
                  }
                }}
              >
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </Avatar>
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            onClick={handleMenuClose}
            PaperProps={{
              elevation: 8,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                mt: 1.5,
                minWidth: 200,
                '& .MuiAvatar-root': {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            {/* User Info */}
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {user?.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.email}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  color: 'primary.main',
                  fontWeight: 500,
                  textTransform: 'capitalize'
                }}
              >
                {user?.role}
                {user?.role === 'vendor' && !user?.vendorDetails?.isApproved && ' (Pending Approval)'}
              </Typography>
            </Box>
            
            <Divider />
            
            {/* Menu Items */}
            <MenuItem onClick={() => handleNavigation('/profile')}>
              <Person sx={{ mr: 2 }} />
              Profile
            </MenuItem>
            
            {/* Mobile Navigation Items */}
            <Box sx={{ display: { xs: 'block', md: 'none' } }}>
              <Divider />
              {getNavItems().map((item) => (
                <MenuItem
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  selected={isActive(item.path)}
                >
                  {React.cloneElement(item.icon, { sx: { mr: 2 } })}
                  {item.label}
                </MenuItem>
              ))}
            </Box>
            
            <Divider />
            
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 2 }} />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;