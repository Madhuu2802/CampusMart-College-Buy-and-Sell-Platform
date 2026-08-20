import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Rating,
  IconButton,
  Skeleton,
  Alert
} from '@mui/material';
import {
  Search,
  Restaurant,
  ShoppingCart,
  Store,
  ShoppingBag,
  LocationOn,
  AccessTime,
  Star,
  Add,
  TrendingUp
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import axios from 'axios';

// Helper function to construct image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=200&fit=crop&crop=center';
  
  // If it's already a full URL (like Unsplash), return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // If it's a relative path, prepend the backend URL
  return `http://localhost:3001/${imagePath}`;
};

const Dashboard = () => {
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [marketplaceItems, setMarketplaceItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch vendors
      const vendorsResponse = await axios.get('/vendors');
      setVendors(vendorsResponse.data.vendors.slice(0, 6)); // Show top 6
      
      // Fetch featured products
      const productsResponse = await axios.get('/products/featured');
      setProducts(productsResponse.data.products.slice(0, 8)); // Show top 8
      
      // Fetch recent marketplace items (for students)
      if (user?.role === 'student') {
        const marketplaceResponse = await axios.get('/marketplace/recent');
        setMarketplaceItems(marketplaceResponse.data.items.slice(0, 6));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      if (searchTerm.trim()) {
        navigate(`/marketplace?search=${encodeURIComponent(searchTerm.trim())}`);
      }
    }
  };

  const handleVendorClick = (vendorId) => {
    navigate(`/vendor/${vendorId}`);
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const renderWelcomeSection = () => (
    <Box
      sx={{
        background: isDarkMode 
          ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
          : 'linear-gradient(135deg, #CD1C18 0%, #FFA896 100%)',
        color: 'white',
        borderRadius: 3,
        p: 4,
        mb: 4,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Welcome back, {user?.name}! 👋
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>
          {user?.role === 'student' 
            ? 'Discover delicious food and great deals on campus'
            : user?.role === 'vendor'
            ? 'Manage your business and reach more customers'
            : 'Oversee the campus marketplace'
          }
        </Typography>
        
        {/* Search Bar */}
        <TextField
          fullWidth
          placeholder="Search for food, vendors, or items..."
          value={searchTerm}
          onChange={handleSearch}
          onKeyPress={handleSearchSubmit}
          sx={{
            maxWidth: 500,
            '& .MuiOutlinedInput-root': {
              backgroundColor: isDarkMode 
                ? 'rgba(255, 255, 255, 0.15)' 
                : 'rgba(255, 255, 255, 0.9)',
              borderRadius: 2,
              color: isDarkMode ? '#ffffff' : '#333333',
              '& fieldset': {
                border: 'none'
              },
              '& input::placeholder': {
                color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                opacity: 1
              },
              '&:hover': {
                backgroundColor: isDarkMode 
                  ? 'rgba(255, 255, 255, 0.2)' 
                  : 'rgba(255, 255, 255, 0.95)'
              }
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IconButton 
                  onClick={handleSearchSubmit} 
                  size="small"
                  sx={{
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.6)',
                    '&:hover': {
                      backgroundColor: isDarkMode 
                        ? 'rgba(255, 255, 255, 0.1)' 
                        : 'rgba(0, 0, 0, 0.04)',
                      color: isDarkMode ? '#ffffff' : '#333333'
                    }
                  }}
                >
                  <Search />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>
      
      {/* Background decoration */}
      <Box
        sx={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          zIndex: 0
        }}
      />
    </Box>
  );

  const renderQuickActions = () => (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} md={6}>
        <Card
          sx={{
            height: '100%',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 32px rgba(226, 55, 68, 0.2)'
            }
          }}
          onClick={() => navigate('/vendors')}
        >
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #e23744, #ff6b75)',
                mx: 'auto',
                mb: 2
              }}
            >
              <Restaurant sx={{ fontSize: 40, color: 'white' }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
              Local Vendors
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Discover food outlets and restaurants on campus
            </Typography>
            <Chip
              label={`${vendors.length}+ Vendors`}
              color="primary"
              size="small"
            />
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Card
          sx={{
            height: '100%',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 32px rgba(255, 152, 0, 0.2)'
            }
          }}
          onClick={() => navigate('/marketplace')}
        >
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ff9800, #ffb74d)',
                mx: 'auto',
                mb: 2
              }}
            >
              <ShoppingBag sx={{ fontSize: 40, color: 'white' }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
              Student Marketplace
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Buy and sell second-hand items with fellow students
            </Typography>
            <Chip
              label={`${marketplaceItems.length}+ Items`}
              sx={{ bgcolor: '#ff9800', color: 'white' }}
              size="small"
            />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderFeaturedProducts = () => (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
          <TrendingUp sx={{ mr: 1, color: 'primary.main' }} />
          Featured Food Items
        </Typography>
        <Button
          variant="outlined"
          onClick={() => navigate('/products')}
          sx={{ borderRadius: 2 }}
        >
          View All
        </Button>
      </Box>
      
      {loading ? (
        <Grid container spacing={2}>
          {[...Array(3)].map((_, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
                <Skeleton variant="rectangular" height={200} />
                <CardContent>
                  <Skeleton variant="text" height={24} />
                  <Skeleton variant="text" height={20} width="60%" />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={2}>
          {products.map((product) => (
            <Grid item xs={3} sm={2.4} md={1.5} key={product._id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  borderRadius: 3,
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.15)'
                  }
                }}
                onClick={() => navigate(`/vendor/${product.vendor?._id}`)}
              >
                <CardMedia
                  component="img"
                  height="60"
                  image={getImageUrl(product.images?.[0])}
                  alt={product.name}
                  sx={{ 
                    objectFit: 'cover',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05)'
                    }
                  }}
                />
                <CardContent sx={{ p: 0.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontWeight: 600, 
                      mb: 0.2, 
                      fontSize: '0.65rem',
                      lineHeight: 1,
                      minHeight: '1.3rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {product.name.substring(0, 12)}...
                  </Typography>
                  <Typography 
                    variant="caption" 
                    color="text.secondary" 
                    sx={{ 
                      mb: 0.3,
                      display: 'flex',
                      alignItems: 'center',
                      fontWeight: 400,
                      fontSize: '0.5rem'
                    }}
                  >
                    <Store sx={{ fontSize: 8, mr: 0.2 }} />
                    {(product.vendor?.vendorDetails?.businessName || 'Campus').substring(0, 8)}
                  </Typography>
                  <Box sx={{ mt: 'auto' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.2 }}>
                      <Typography variant="caption" color="primary.main" sx={{ fontWeight: 700, fontSize: '0.7rem' }}>
                        ₹{product.price}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Star sx={{ fontSize: 8, color: '#ffc107', mr: 0.1 }} />
                        <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.5rem' }}>
                          {product.rating?.average?.toFixed(1) || '4.5'}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={(product.category || 'Food').substring(0, 4)}
                      size="small"
                      sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        fontWeight: 500,
                        textTransform: 'capitalize',
                        fontSize: '0.45rem',
                        height: '14px',
                        minWidth: '30px',
                        '& .MuiChip-label': {
                          px: 0.3
                        }
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );

  const renderMarketplaceItems = () => (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
          <ShoppingBag sx={{ mr: 1, color: 'primary.main' }} />
          Student Marketplace
        </Typography>
        <Button
          variant="outlined"
          onClick={() => navigate('/marketplace')}
          sx={{ borderRadius: 2 }}
        >
          View All
        </Button>
      </Box>
      
      {loading ? (
        <Grid container spacing={2}>
          {[...Array(4)].map((_, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
                <Skeleton variant="rectangular" height={180} />
                <CardContent>
                  <Skeleton variant="text" height={20} />
                  <Skeleton variant="text" height={16} width="60%" />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={2}>
          {marketplaceItems.slice(0, 3).map((item) => (
            <Grid item xs={12} sm={4} md={4} key={item._id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  borderRadius: 3,
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.15)'
                  }
                }}
                onClick={() => navigate('/marketplace')}
              >
                <CardMedia
                  component="img"
                  height="120"
                  image={getImageUrl(item.images?.[0])}
                  alt={item.title}
                  sx={{ 
                    objectFit: 'cover',
                    transition: 'transform 0.3s ease',
                    aspectRatio: '1/1',
                    '&:hover': {
                      transform: 'scale(1.05)'
                    }
                  }}
                />
                <CardContent sx={{ p: 0.8, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontWeight: 600, 
                      mb: 0.4, 
                      fontSize: '0.7rem',
                      lineHeight: 1.1,
                      minHeight: '1.4rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {item.title}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    color="text.secondary" 
                    sx={{ 
                      mb: 0.7,
                      display: 'flex',
                      alignItems: 'center',
                      fontWeight: 500,
                      fontSize: '0.6rem'
                    }}
                  >
                    <LocationOn sx={{ fontSize: 10, mr: 0.2 }} />
                    {item.location}
                  </Typography>
                  <Box sx={{ mt: 'auto' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.4 }}>
                      <Typography variant="caption" color="primary.main" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>
                        ₹{item.price}
                      </Typography>
                      <Chip
                        label={item.condition}
                        size="small"
                        sx={{
                          bgcolor: item.condition === 'new' ? '#4caf50' : 
                                   item.condition === 'like-new' ? '#2196f3' : 
                                   item.condition === 'good' ? '#ff9800' : '#757575',
                          color: 'white',
                          fontWeight: 600,
                          textTransform: 'capitalize',
                          fontSize: '0.55rem',
                          height: '16px'
                        }}
                      />
                    </Box>
                    <Chip
                      label={item.category}
                      size="small"
                      variant="outlined"
                      sx={{
                        textTransform: 'capitalize',
                        fontWeight: 500,
                        fontSize: '0.5rem',
                        height: '14px'
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );

  const renderTopVendors = () => (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
          <Store sx={{ mr: 1, color: 'primary.main' }} />
          Popular Vendors
        </Typography>
        <Button
          variant="outlined"
          onClick={() => navigate('/vendors')}
          sx={{ borderRadius: 2 }}
        >
          View All
        </Button>
      </Box>
      
      {loading ? (
        <Grid container spacing={2}>
          {[...Array(3)].map((_, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card>
                <CardContent>
                  <Skeleton variant="circular" width={60} height={60} />
                  <Skeleton variant="text" height={24} sx={{ mt: 1 }} />
                  <Skeleton variant="text" height={20} width="80%" />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={3}>
          {vendors.map((vendor) => (
            <Grid item xs={12} md={4} key={vendor._id}>
              <Card
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  borderRadius: 3,
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.15)'
                  }
                }}
                onClick={() => navigate('/vendors')}
              >
                <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
                    <Box
                      sx={{
                        width: 70,
                        height: 70,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #e23744, #ff6b75)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2,
                        boxShadow: '0 4px 16px rgba(226, 55, 68, 0.3)'
                      }}
                    >
                      <Restaurant sx={{ color: 'white', fontSize: 32 }} />
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem', mb: 0.5 }}>
                        {vendor.vendorDetails?.businessName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                        {vendor.name}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LocationOn sx={{ fontSize: 18, color: 'text.secondary', mr: 1 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      {vendor.vendorDetails?.location}
                    </Typography>
                  </Box>
                  <Box sx={{ mt: 'auto' }}>
                    <Chip
                      label={vendor.vendorDetails?.businessType}
                      size="medium"
                      sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        fontWeight: 600,
                        px: 1
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ position: 'relative', overflow: 'hidden', minHeight: '100vh' }}>
      {/* Animated Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: isDarkMode
              ? `
                radial-gradient(circle at 20% 80%, rgba(155, 19, 19, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(205, 28, 24, 0.08) 0%, transparent 50%),
                radial-gradient(circle at 40% 40%, rgba(56, 0, 10, 0.05) 0%, transparent 50%)
              `
              : `
                radial-gradient(circle at 20% 80%, rgba(205, 28, 24, 0.08) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(255, 168, 150, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 40% 40%, rgba(155, 19, 19, 0.05) 0%, transparent 50%)
              `,
            animation: 'backgroundFloat 25s ease-in-out infinite'
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            right: '-50%',
            width: '200%',
            height: '200%',
            background: isDarkMode
              ? `
                radial-gradient(circle at 60% 60%, rgba(56, 0, 10, 0.08) 0%, transparent 50%),
                radial-gradient(circle at 90% 10%, rgba(155, 19, 19, 0.06) 0%, transparent 50%)
              `
              : `
                radial-gradient(circle at 60% 60%, rgba(255, 168, 150, 0.08) 0%, transparent 50%),
                radial-gradient(circle at 90% 10%, rgba(205, 28, 24, 0.06) 0%, transparent 50%)
              `,
            animation: 'backgroundFloat 30s ease-in-out infinite reverse'
          },
          '@keyframes backgroundFloat': {
            '0%, 100%': {
              transform: 'translate(0px, 0px) rotate(0deg)'
            },
            '33%': {
              transform: 'translate(20px, -20px) rotate(120deg)'
            },
            '66%': {
              transform: 'translate(-15px, 15px) rotate(240deg)'
            }
          }
        }}
      />
      
      {/* Floating Geometric Shapes */}
      {[...Array(8)].map((_, index) => (
        <Box
          key={index}
          sx={{
             position: 'absolute',
             width: { xs: '40px', md: '60px' },
             height: { xs: '40px', md: '60px' },
             borderRadius: index % 3 === 0 ? '50%' : index % 3 === 1 ? '20%' : '0%',
             background: isDarkMode
               ? `rgba(255, 168, 150, ${0.03 + (index * 0.01)})`
               : `rgba(205, 28, 24, ${0.05 + (index * 0.01)})`,
             backdropFilter: 'blur(5px)',
             border: isDarkMode 
               ? '1px solid rgba(255, 168, 150, 0.1)'
               : '1px solid rgba(205, 28, 24, 0.1)',
             top: `${5 + (index * 12)}%`,
             left: `${2 + (index * 12)}%`,
             animation: `dashboardFloat${index} ${18 + index * 3}s ease-in-out infinite`,
             zIndex: 1,
            '@keyframes dashboardFloat0': {
              '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
              '50%': { transform: 'translateY(-15px) rotate(180deg)' }
            },
            '@keyframes dashboardFloat1': {
              '0%, 100%': { transform: 'translateX(0px) rotate(0deg)' },
              '50%': { transform: 'translateX(15px) rotate(-180deg)' }
            },
            '@keyframes dashboardFloat2': {
              '0%, 100%': { transform: 'translate(0px, 0px) rotate(0deg)' },
              '50%': { transform: 'translate(-10px, -10px) rotate(90deg)' }
            },
            '@keyframes dashboardFloat3': {
              '0%, 100%': { transform: 'translateY(0px) scale(1)' },
              '50%': { transform: 'translateY(12px) scale(1.05)' }
            },
            '@keyframes dashboardFloat4': {
              '0%, 100%': { transform: 'translate(0px, 0px) rotate(0deg)' },
              '50%': { transform: 'translate(8px, -8px) rotate(-90deg)' }
            },
            '@keyframes dashboardFloat5': {
              '0%, 100%': { transform: 'translateX(0px) rotate(0deg)' },
              '50%': { transform: 'translateX(-18px) rotate(270deg)' }
            },
            '@keyframes dashboardFloat6': {
              '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
              '50%': { transform: 'translate(10px, 10px) scale(0.95)' }
            },
            '@keyframes dashboardFloat7': {
              '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
              '50%': { transform: 'translateY(-20px) rotate(360deg)' }
            }
          }}
        />
      ))}
      
      <Container maxWidth="lg" sx={{ py: 4, position: 'relative', zIndex: 10 }}>
        {renderWelcomeSection()}
        {renderQuickActions()}
        {user?.role === 'student' && marketplaceItems.length > 0 && renderMarketplaceItems()}
        {renderTopVendors()}
      </Container>
    </Box>
  );
};

export default Dashboard;