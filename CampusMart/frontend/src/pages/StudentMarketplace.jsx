import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Alert,
  Tabs,
  Tab,
  Badge,
  Avatar,
  Divider,
  Snackbar
} from '@mui/material';
import {
  Add,
  PhotoCamera,
  Delete,
  Edit,
  ShoppingCart,
  Visibility,
  LocationOn,
  AttachMoney,
  Category,
  Person,
  Phone,
  Email,
  Payment
} from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
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

const StudentMarketplace = () => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const { addToCart, getCartItemsCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [items, setItems] = useState([]);
  const [myItems, setMyItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: '',
    location: '',
    isNegotiable: true,
    contactInfo: {
      phone: '',
      email: user?.email || '',
      preferredContact: 'both'
    }
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const categories = [
    'books', 'electronics', 'furniture', 'clothing', 
    'sports', 'stationery', 'gadgets', 'other'
  ];

  const conditions = [
    'new', 'like-new', 'good', 'fair', 'poor'
  ];

  useEffect(() => {
    // Get search parameter from URL
    const urlParams = new URLSearchParams(location.search);
    const searchParam = urlParams.get('search');
    if (searchParam) {
      setSearchTerm(searchParam);
      fetchMarketplaceItems(1, false, searchParam);
    } else {
      fetchMarketplaceItems();
    }
    if (user) {
      fetchMyItems();
    }
  }, [user, location.search]);

  // Generate search suggestions when no results found
  const generateSearchSuggestions = (searchQuery) => {
    const suggestions = [
      'iPhone', 'Samsung', 'laptop', 'books', 'table', 'chair',
      'headphones', 'electronics', 'furniture', 'textbooks',
      'gaming', 'study materials', 'phone', 'computer'
    ];
    
    // Filter suggestions based on search query
    const filtered = suggestions.filter(suggestion => 
      suggestion.toLowerCase().includes(searchQuery.toLowerCase()) ||
      searchQuery.toLowerCase().includes(suggestion.toLowerCase())
    );
    
    return filtered.length > 0 ? filtered.slice(0, 5) : suggestions.slice(0, 5);
  };

  const fetchMarketplaceItems = async (pageNum = 1, append = false, searchQuery = '') => {
    try {
      if (!append) setLoading(true);
      else setLoadingMore(true);
      
      let url = `/marketplace?page=${pageNum}&limit=10`;
      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
      }
      
      const response = await axios.get(url);
      const newItems = response.data.items || [];
      
      if (append) {
        setItems(prev => [...prev, ...newItems]);
      } else {
        setItems(newItems);
        
        // Show suggestions if no results found for search
        if (searchQuery && newItems.length === 0) {
          const suggestions = generateSearchSuggestions(searchQuery);
          setSearchSuggestions(suggestions);
          setShowSuggestions(true);
        } else {
          setShowSuggestions(false);
        }
      }
      
      setHasMore(newItems.length === 10);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching marketplace items:', error);
      setError('Failed to load marketplace items');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreItems = () => {
    if (!loadingMore && hasMore) {
      fetchMarketplaceItems(page + 1, true, searchTerm);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    navigate(`/marketplace?search=${encodeURIComponent(suggestion)}`);
  };

  // Handle direct item click
  const handleItemClick = (item) => {
    // Navigate to item detail or show item details
    navigate(`/marketplace/item/${item._id}`);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.trim()) {
      // Debounce search
      setTimeout(() => {
        navigate(`/marketplace?search=${encodeURIComponent(value.trim())}`);
      }, 500);
    } else {
      navigate('/marketplace');
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
    setShowSuggestions(false);
    navigate('/marketplace');
  };

  const fetchMyItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/marketplace/my-items', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyItems(response.data.items || []);
    } catch (error) {
      console.error('Error fetching my items:', error);
    }
  };

  const handleImageSelect = (event) => {
    const files = Array.from(event.target.files);
    if (files.length + selectedImages.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }
    setSelectedImages([...selectedImages, ...files]);
  };

  const removeImage = (index) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('contactInfo.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        contactInfo: {
          ...formData.contactInfo,
          [field]: value
        }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingItem && selectedImages.length === 0) {
      setError('Please select at least one image');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'contactInfo') {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      selectedImages.forEach(image => {
        formDataToSend.append('images', image);
      });

      const token = localStorage.getItem('token');
      
      if (editingItem) {
        // Update existing item
        await axios.put(`/marketplace/${editingItem._id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        });
        setSuccess('Item updated successfully!');
      } else {
        // Create new item
        await axios.post('/marketplace', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        });
        setSuccess('Item uploaded successfully! It will be visible after admin approval.');
      }

      setOpenDialog(false);
      resetForm();
      fetchMyItems();
    } catch (error) {
      setError(error.response?.data?.message || `Failed to ${editingItem ? 'update' : 'upload'} item`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price: '',
      category: '',
      condition: '',
      location: '',
      isNegotiable: true,
      contactInfo: {
        phone: '',
        email: user?.email || '',
        preferredContact: 'both'
      }
    });
    setSelectedImages([]);
    setEditingItem(null);
  };

  const handleAddToCart = (item) => {
    try {
      addToCart(item);
      setSnackbarMessage(`${item.title} added to cart!`);
      setSnackbarOpen(true);
    } catch (error) {
      setError('Failed to add item to cart');
    }
  };

  const handleCheckout = () => {
    if (getCartItemsCount() === 0) {
      setError('Your cart is empty');
      return;
    }
    navigate('/cart');
  };

  const handleEditItem = (item) => {
    // Pre-fill form with existing item data
    setFormData({
      title: item.title,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      condition: item.condition,
      location: item.location,
      contactInfo: item.contactInfo || { phone: '', email: '', preferredMethod: 'both' },
      isNegotiable: item.isNegotiable || false
    });
    setEditingItem(item);
    setOpenDialog(true);
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/marketplace/${itemId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Item deleted successfully!');
        fetchMyItems();
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to delete item');
      }
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: isDarkMode 
          ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
          : 'linear-gradient(135deg, #CD1C18 0%, #FFA896 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Animated Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: `
              radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)
            `,
            animation: 'float 20s ease-in-out infinite'
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            right: '-50%',
            width: '200%',
            height: '200%',
            background: `
              radial-gradient(circle at 60% 60%, rgba(255, 255, 255, 0.08) 0%, transparent 50%),
              radial-gradient(circle at 90% 10%, rgba(255, 255, 255, 0.06) 0%, transparent 50%)
            `,
            animation: 'float 25s ease-in-out infinite reverse'
          },
          '@keyframes float': {
            '0%, 100%': {
              transform: 'translate(0px, 0px) rotate(0deg)'
            },
            '33%': {
              transform: 'translate(30px, -30px) rotate(120deg)'
            },
            '66%': {
              transform: 'translate(-20px, 20px) rotate(240deg)'
            }
          }
        }}
      />
      
      {/* Floating Geometric Shapes */}
      {[...Array(6)].map((_, index) => (
        <Box
          key={index}
          sx={{
            position: 'absolute',
            width: { xs: '60px', md: '80px' },
            height: { xs: '60px', md: '80px' },
            borderRadius: index % 2 === 0 ? '50%' : '20%',
            background: `rgba(255, 255, 255, ${0.05 + (index * 0.02)})`,
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            top: `${10 + (index * 15)}%`,
            left: `${5 + (index * 15)}%`,
            animation: `floatShape${index} ${15 + index * 2}s ease-in-out infinite`,
            '@keyframes floatShape0': {
              '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
              '50%': { transform: 'translateY(-20px) rotate(180deg)' }
            },
            '@keyframes floatShape1': {
              '0%, 100%': { transform: 'translateX(0px) rotate(0deg)' },
              '50%': { transform: 'translateX(20px) rotate(-180deg)' }
            },
            '@keyframes floatShape2': {
              '0%, 100%': { transform: 'translate(0px, 0px) rotate(0deg)' },
              '50%': { transform: 'translate(-15px, -15px) rotate(90deg)' }
            },
            '@keyframes floatShape3': {
              '0%, 100%': { transform: 'translateY(0px) scale(1)' },
              '50%': { transform: 'translateY(15px) scale(1.1)' }
            },
            '@keyframes floatShape4': {
              '0%, 100%': { transform: 'translate(0px, 0px) rotate(0deg)' },
              '50%': { transform: 'translate(10px, -10px) rotate(-90deg)' }
            },
            '@keyframes floatShape5': {
              '0%, 100%': { transform: 'translateX(0px) rotate(0deg)' },
              '50%': { transform: 'translateX(-25px) rotate(270deg)' }
            }
          }}
        />
      ))}
      
      <Container maxWidth="lg" sx={{ py: 4, position: 'relative', zIndex: 10 }}>
        {/* Header */}
        <Box textAlign="center" mb={4}>
          <Typography variant="h4" gutterBottom sx={{ color: 'white', fontWeight: 700 }}>
            Student Marketplace
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 3 }}>
            Buy and sell second-hand items with fellow students
          </Typography>
          
          {/* Search Bar */}
           <Box sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
             <TextField
               fullWidth
               placeholder="Search for items (e.g., iPhone 12, laptop, books)..."
               value={searchTerm}
               onChange={handleSearchChange}
               sx={{
                 '& .MuiOutlinedInput-root': {
                   backgroundColor: isDarkMode 
                     ? 'rgba(255, 255, 255, 0.15)' 
                     : 'rgba(255, 255, 255, 0.9)',
                   borderRadius: 2,
                   color: isDarkMode ? '#ffffff' : '#333333',
                   '& fieldset': { border: 'none' },
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
                 endAdornment: searchTerm && (
                   <IconButton 
                     onClick={clearSearch} 
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
                     <Delete />
                   </IconButton>
                 )
               }}
             />
           </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenDialog(true)}
              sx={{
                background: 'linear-gradient(135deg, #9B1313, #38000A)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #38000A, #9B1313)'
                }
              }}
            >
              Sell an Item
            </Button>
            <Button
              variant="contained"
              startIcon={<Badge badgeContent={getCartItemsCount()} color="error"><ShoppingCart /></Badge>}
              onClick={handleCheckout}
              sx={{
                background: 'linear-gradient(135deg, #FF9800, #FFB74D)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #F57C00, #FF9800)'
                }
              }}
            >
              Checkout ({getCartItemsCount()})
            </Button>
          </Box>
        </Box>

        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'rgba(255,255,255,0.2)', mb: 3 }}>
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{
              '& .MuiTab-root': { color: 'rgba(255,255,255,0.7)' },
              '& .Mui-selected': { color: 'white !important' },
              '& .MuiTabs-indicator': { backgroundColor: 'white' }
            }}
          >
            <Tab label="Browse Items" />
            <Tab label={`My Items (${myItems.length})`} />
          </Tabs>
        </Box>

        {/* Tab Content */}
        {activeTab === 0 && (
          <Box sx={{ maxWidth: '800px', margin: '0 auto' }}>
            {/* Search Results Info */}
            {searchTerm && (
              <Box sx={{ mb: 3, textAlign: 'center' }}>
                <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
                  {items.length > 0 
                    ? `Found ${items.length} result${items.length !== 1 ? 's' : ''} for "${searchTerm}"`
                    : `No results found for "${searchTerm}"`
                  }
                </Typography>
              </Box>
            )}

            {/* No Results - Show Suggestions */}
            {showSuggestions && searchTerm && items.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                  Item "${searchTerm}" is currently unavailable
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', mb: 3 }}>
                  Try searching for these popular items instead:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                  {searchSuggestions.map((suggestion, index) => (
                    <Chip
                      key={index}
                      label={suggestion}
                      onClick={() => handleSuggestionClick(suggestion)}
                      sx={{
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.3)'
                        }
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {items.map((item) => (
              <Box key={item._id} sx={{ mb: 3 }}>
                <Card 
                  sx={{ 
                    background: isDarkMode 
                      ? 'rgba(255,255,255,0.1)' 
                      : 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(10px)',
                    border: isDarkMode ? '1px solid rgba(255,255,255,0.2)' : 'none',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: isDarkMode 
                        ? '0 8px 32px rgba(255,255,255,0.1)'
                        : '0 8px 32px rgba(0,0,0,0.15)'
                    }
                  }}
                  onClick={() => handleItemClick(item)}
                >
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' } }}>
                    {/* Image Section */}
                    <Box
                      sx={{
                        width: { xs: '100%', sm: '300px' },
                        height: '200px',
                        position: 'relative',
                        overflow: 'hidden',
                        borderRadius: { xs: '4px 4px 0 0', sm: '4px 0 0 4px' }
                      }}
                    >
                      <CardMedia
                        component="img"
                        image={getImageUrl(item.images?.[0])}
                        alt={item.title}
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    </Box>
                    
                    {/* Content Section */}
                    <CardContent sx={{ flex: 1, p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                        <Typography 
                          variant="h5" 
                          sx={{ 
                            color: isDarkMode ? 'white' : 'inherit',
                            fontWeight: 600,
                            flex: 1,
                            mr: 2
                          }}
                        >
                          {item.title}
                        </Typography>
                        <Typography 
                          variant="h4" 
                          sx={{ 
                            color: isDarkMode ? '#4CAF50' : 'primary.main',
                            fontWeight: 700
                          }}
                        >
                          ₹{item.price}
                        </Typography>
                      </Box>
                      
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          mb: 2,
                          color: isDarkMode ? 'rgba(255,255,255,0.8)' : 'text.primary',
                          lineHeight: 1.6
                        }}
                      >
                        {item.description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <Category 
                            fontSize="small" 
                            sx={{ 
                              color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'action.active'
                            }}
                          />
                          <Typography 
                            variant="body2"
                            sx={{ 
                              color: isDarkMode ? 'rgba(255,255,255,0.8)' : 'text.secondary'
                            }}
                          >
                            {item.category}
                          </Typography>
                        </Box>
                        
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <Typography 
                            variant="body2"
                            sx={{ 
                              color: isDarkMode ? 'rgba(255,255,255,0.8)' : 'text.secondary'
                            }}
                          >
                            Condition: {item.condition}
                          </Typography>
                        </Box>
                        
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <LocationOn 
                            fontSize="small" 
                            sx={{ 
                              color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'action.active'
                            }}
                          />
                          <Typography 
                            variant="body2"
                            sx={{ 
                              color: isDarkMode ? 'rgba(255,255,255,0.8)' : 'text.secondary'
                            }}
                          >
                            {item.location}
                          </Typography>
                        </Box>
                        
                        {item.isNegotiable && (
                          <Chip 
                            label="Negotiable" 
                            size="small" 
                            sx={{
                              backgroundColor: isDarkMode ? 'rgba(76, 175, 80, 0.2)' : undefined,
                              color: isDarkMode ? '#4CAF50' : undefined
                            }}
                          />
                        )}
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 2, mt: 'auto' }}>
                        <Button
                          variant="contained"
                          startIcon={<ShoppingCart />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(item);
                          }}
                          sx={{
                            background: 'linear-gradient(135deg, #4CAF50, #66BB6A)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #388E3C, #4CAF50)'
                            },
                            px: 3,
                            py: 1
                          }}
                        >
                          Add to Cart
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<Visibility />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleItemClick(item);
                          }}
                          sx={{
                            borderColor: isDarkMode ? 'rgba(255,255,255,0.3)' : undefined,
                            color: isDarkMode ? 'rgba(255,255,255,0.8)' : undefined,
                            '&:hover': {
                              borderColor: isDarkMode ? 'rgba(255,255,255,0.5)' : undefined,
                              backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : undefined
                            }
                          }}
                        >
                          View Details
                        </Button>
                      </Box>
                    </CardContent>
                  </Box>
                </Card>
              </Box>
            ))}
            
            {/* Load More Button */}
            {hasMore && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Button
                  variant="outlined"
                  onClick={loadMoreItems}
                  disabled={loadingMore}
                  sx={{
                    borderColor: isDarkMode ? 'rgba(255,255,255,0.3)' : undefined,
                    color: isDarkMode ? 'rgba(255,255,255,0.8)' : undefined,
                    '&:hover': {
                      borderColor: isDarkMode ? 'rgba(255,255,255,0.5)' : undefined,
                      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : undefined
                    },
                    px: 4,
                    py: 1.5
                  }}
                >
                  {loadingMore ? 'Loading...' : 'Load More Items'}
                </Button>
              </Box>
            )}
            
            {!hasMore && items.length > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'text.secondary',
                    fontStyle: 'italic'
                  }}
                >
                  You've reached the end of the marketplace
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {activeTab === 1 && (
          <Box sx={{ maxWidth: '800px', margin: '0 auto' }}>
            {myItems.map((item) => (
              <Box key={item._id} sx={{ mb: 3 }}>
                <Card 
                  sx={{ 
                    background: isDarkMode 
                      ? 'rgba(255,255,255,0.1)' 
                      : 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(10px)',
                    border: isDarkMode ? '1px solid rgba(255,255,255,0.2)' : 'none',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: isDarkMode 
                        ? '0 8px 32px rgba(255,255,255,0.1)'
                        : '0 8px 32px rgba(0,0,0,0.15)'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' } }}>
                    {/* Image Section */}
                    <Box
                      sx={{
                        width: { xs: '100%', sm: '300px' },
                        height: '200px',
                        position: 'relative',
                        overflow: 'hidden',
                        borderRadius: { xs: '4px 4px 0 0', sm: '4px 0 0 4px' }
                      }}
                    >
                      <CardMedia
                           component="img"
                           image={getImageUrl(item.images?.[0])}
                           alt={item.title}
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    </Box>
                    
                    {/* Content Section */}
                    <CardContent sx={{ flex: 1, p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                        <Typography 
                          variant="h5" 
                          sx={{ 
                            color: isDarkMode ? 'white' : 'inherit',
                            fontWeight: 600,
                            flex: 1,
                            mr: 2
                          }}
                        >
                          {item.title}
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'end', gap: 1 }}>
                          <Typography 
                            variant="h4" 
                            sx={{ 
                              color: isDarkMode ? '#4CAF50' : 'primary.main',
                              fontWeight: 700
                            }}
                          >
                            ₹{item.price}
                          </Typography>
                          <Chip 
                            label={item.status} 
                            size="small"
                            color={item.status === 'approved' ? 'success' : 
                                   item.status === 'pending' ? 'warning' : 'error'}
                            sx={{
                              color: isDarkMode ? 'white' : undefined,
                              '& .MuiChip-label': {
                                color: isDarkMode && item.status === 'pending' ? '#000' : undefined
                              }
                            }}
                          />
                        </Box>
                      </Box>
                      
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          mb: 2,
                          color: isDarkMode ? 'rgba(255,255,255,0.8)' : 'text.primary',
                          lineHeight: 1.6
                        }}
                      >
                        {item.description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <Category 
                            fontSize="small" 
                            sx={{ 
                              color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'action.active'
                            }}
                          />
                          <Typography 
                            variant="body2"
                            sx={{ 
                              color: isDarkMode ? 'rgba(255,255,255,0.8)' : 'text.secondary'
                            }}
                          >
                            {item.category}
                          </Typography>
                        </Box>
                        
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <Typography 
                            variant="body2"
                            sx={{ 
                              color: isDarkMode ? 'rgba(255,255,255,0.8)' : 'text.secondary'
                            }}
                          >
                            Condition: {item.condition}
                          </Typography>
                        </Box>
                        
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <LocationOn 
                            fontSize="small" 
                            sx={{ 
                              color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'action.active'
                            }}
                          />
                          <Typography 
                            variant="body2"
                            sx={{ 
                              color: isDarkMode ? 'rgba(255,255,255,0.8)' : 'text.secondary'
                            }}
                          >
                            {item.location}
                          </Typography>
                        </Box>
                        
                        {item.interestedBuyers?.length > 0 && (
                          <Chip 
                            label={`${item.interestedBuyers.length} interested`}
                            size="small"
                            color="info"
                            sx={{
                              backgroundColor: isDarkMode ? 'rgba(33, 150, 243, 0.2)' : undefined,
                              color: isDarkMode ? '#2196F3' : undefined
                            }}
                          />
                        )}
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 2, mt: 'auto' }}>
                        <Button
                          variant="contained"
                          startIcon={<Edit />}
                          onClick={() => handleEditItem(item)}
                          sx={{
                            background: 'linear-gradient(135deg, #ff9800, #ffb74d)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #f57c00, #ff9800)'
                            },
                            px: 3,
                            py: 1
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<Delete />}
                          onClick={() => handleDeleteItem(item._id)}
                          sx={{
                            borderColor: '#f44336',
                            color: '#f44336',
                            '&:hover': {
                              borderColor: '#d32f2f',
                              backgroundColor: 'rgba(244, 67, 54, 0.1)'
                            }
                          }}
                        >
                          Delete
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<Visibility />}
                          sx={{
                            borderColor: isDarkMode ? 'rgba(255,255,255,0.3)' : undefined,
                            color: isDarkMode ? 'rgba(255,255,255,0.8)' : undefined,
                            '&:hover': {
                              borderColor: isDarkMode ? 'rgba(255,255,255,0.5)' : undefined,
                              backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : undefined
                            }
                          }}
                        >
                          View Details
                        </Button>
                      </Box>
                    </CardContent>
                  </Box>
                </Card>
              </Box>
            ))}
          </Box>
        )}
      </Container>

      {/* Upload Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: isDarkMode 
              ? 'linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)' 
              : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            boxShadow: isDarkMode 
              ? '0 20px 40px rgba(0,0,0,0.4)' 
              : '0 20px 40px rgba(0,0,0,0.1)',
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            background: isDarkMode 
              ? 'linear-gradient(135deg, #CD1C18 0%, #9B1313 100%)' 
              : 'linear-gradient(135deg, #CD1C18 0%, #FFA896 100%)',
            color: 'white',
            textAlign: 'center',
            py: 3,
            fontSize: '1.5rem',
            fontWeight: 700,
            borderRadius: '12px 12px 0 0'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <Add sx={{ fontSize: '2rem' }} />
            {editingItem ? 'Edit Your Item' : 'List Your Item for Sale'}
          </Box>
        </DialogTitle>
        
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ p: 4 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}
            
            {success && (
              <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                {success}
              </Alert>
            )}

            {/* Basic Information Section */}
            <Box sx={{ mb: 4 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 3, 
                  color: isDarkMode ? '#ffffff' : '#333333',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <Category color="primary" />
                Basic Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Item Title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., iPhone 13 Pro Max - Excellent Condition"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    multiline
                    rows={4}
                    required
                    placeholder="Describe your item in detail - condition, features, reason for selling, etc."
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Pricing & Location Section */}
            <Box sx={{ mb: 4 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 3, 
                  color: isDarkMode ? '#ffffff' : '#333333',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <AttachMoney color="primary" />
                Pricing & Location
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Price (₹)"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    placeholder="0"
                    InputProps={{
                      startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary' }}>₹</Typography>
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Campus Hostel A, Room 201"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Category & Condition Section */}
             <Box sx={{ mb: 4 }}>
               <Typography 
                 variant="h6" 
                 sx={{ 
                   mb: 3, 
                   color: isDarkMode ? '#ffffff' : '#333333',
                   fontWeight: 600,
                   display: 'flex',
                   alignItems: 'center',
                   gap: 1
                 }}
               >
                 <Category color="primary" />
                 Category and Condition
               </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required sx={{ minWidth: '200px' }}>
                    <InputLabel>Category</InputLabel>
                    <Select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      label="Category"
                      sx={{
                        borderRadius: 2,
                        backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                      }}
                    >
                      {categories.map(cat => (
                        <MenuItem key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required sx={{ minWidth: '200px' }}>
                    <InputLabel>Condition</InputLabel>
                    <Select
                      name="condition"
                      value={formData.condition}
                      onChange={handleInputChange}
                      label="Condition"
                      sx={{
                        borderRadius: 2,
                        backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                      }}
                    >
                      {conditions.map(cond => (
                        <MenuItem key={cond} value={cond}>
                          {cond.charAt(0).toUpperCase() + cond.slice(1)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>

            {/* Contact Information Section */}
            <Box sx={{ mb: 4 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 3, 
                  color: isDarkMode ? '#ffffff' : '#333333',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <Person color="primary" />
                Contact Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number (Optional)"
                    name="contactInfo.phone"
                    value={formData.contactInfo.phone}
                    onChange={handleInputChange}
                    placeholder="+91 98765 43210"
                    InputProps={{
                      startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    name="contactInfo.email"
                    value={formData.contactInfo.email}
                    onChange={handleInputChange}
                    required
                    type="email"
                    InputProps={{
                      startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Images Section */}
            <Box sx={{ mb: 2 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 3, 
                  color: isDarkMode ? '#ffffff' : '#333333',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <PhotoCamera color="primary" />
                Product Images
              </Typography>
              
              <Box 
                sx={{ 
                  p: 3, 
                  border: `2px dashed ${isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`,
                  borderRadius: 3,
                  backgroundColor: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                  textAlign: 'center'
                }}
              >
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="image-upload"
                  multiple
                  type="file"
                  onChange={handleImageSelect}
                />
                <label htmlFor="image-upload">
                  <Button
                    variant="contained"
                    component="span"
                    startIcon={<PhotoCamera />}
                    sx={{
                      background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
                      borderRadius: 2,
                      px: 4,
                      py: 1.5,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #1565c0, #1976d2)',
                      }
                    }}
                  >
                    Upload Images
                  </Button>
                </label>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Upload up to 5 high-quality images of your item
                </Typography>
                
                {selectedImages.length > 0 && (
                  <Box sx={{ display: 'flex', gap: 2, mt: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
                    {selectedImages.map((image, index) => (
                      <Box 
                        key={index} 
                        sx={{ 
                          position: 'relative',
                          borderRadius: 2,
                          overflow: 'hidden',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                        }}
                      >
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Preview ${index}`}
                          style={{ 
                            width: 100, 
                            height: 100, 
                            objectFit: 'cover'
                          }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => removeImage(index)}
                          sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            bgcolor: 'rgba(244, 67, 54, 0.9)',
                            color: 'white',
                            width: 24,
                            height: 24,
                            '&:hover': { 
                              bgcolor: 'error.dark',
                              transform: 'scale(1.1)'
                            }
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Box>
          </DialogContent>
          
          <DialogActions 
            sx={{ 
              p: 3, 
              background: isDarkMode 
                ? 'rgba(255,255,255,0.05)' 
                : 'rgba(0,0,0,0.02)',
              gap: 2,
              justifyContent: 'center'
            }}
          >
            <Button 
              onClick={() => setOpenDialog(false)}
              variant="outlined"
              sx={{ 
                borderRadius: 2,
                px: 4,
                py: 1.5,
                borderColor: isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
                color: isDarkMode ? '#ffffff' : '#333333'
              }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={loading}
              sx={{
                background: 'linear-gradient(135deg, #4CAF50, #66BB6A)',
                borderRadius: 2,
                px: 4,
                py: 1.5,
                '&:hover': {
                  background: 'linear-gradient(135deg, #388E3C, #4CAF50)',
                },
                '&:disabled': {
                  background: 'rgba(0,0,0,0.12)'
                }
              }}
            >
              {loading ? 'Submitting...' : (editingItem ? 'Update Item' : 'Submit for Approval')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Cart Notification Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        sx={{
          '& .MuiSnackbarContent-root': {
            backgroundColor: '#4CAF50',
            color: 'white'
          }
        }}
      />
    </Box>
  );
};

export default StudentMarketplace;