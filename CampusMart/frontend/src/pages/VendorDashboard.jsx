import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Grid, Card, CardContent, TextField, Button, Alert, Chip, Divider, Tabs, Tab, Badge, CardMedia 
} from '@mui/material';
import { useTheme } from '../contexts/ThemeContext';
import axios from 'axios';

const VendorDashboard = () => {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: ''
  });
  const [images, setImages] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchMyProducts();
  }, []);

  const fetchMyProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('/products/vendor/my-products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(res.data.products || []);
    } catch (e) {
      console.error('Error loading products:', e);
      setError(e.response?.data?.message || 'Failed to load your products');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    setImages(files.slice(0, 5)); // limit to 5 images
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', price: '', category: '' });
    setImages([]);
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate basic fields
    if (!formData.name || !formData.description || !formData.price || !formData.category) {
      setError('Please fill in name, description, price, and category');
      return;
    }
    if (images.length === 0) {
      setError('Please upload at least one product image');
      return;
    }

    try {
      setLoading(true);
      const form = new FormData();
      form.append('name', formData.name);
      form.append('description', formData.description);
      form.append('price', formData.price);
      form.append('category', formData.category);
      // Optional defaults to match backend expectations
      form.append('spiceLevel', 'mild');
      form.append('isVegetarian', 'false');
      form.append('isVegan', 'false');

      images.forEach(file => form.append('images', file));

      const token = localStorage.getItem('token');
      await axios.post('/products', form, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
      });

      setSuccess('Product created successfully');
      resetForm();
      fetchMyProducts();
    } catch (err) {
      console.error('Create product error:', err);
      setError(err.response?.data?.message || 'Failed to create product');
    } finally {
      setLoading(false);
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
      
      <Container maxWidth="lg" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
        <Box textAlign="center" mb={3}>
          <Typography variant="h4" gutterBottom sx={{ color: 'white', fontWeight: 700 }}>
            Vendor Dashboard
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
            Manage your food items, orders, and business analytics.
          </Typography>
        </Box>

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
            <Tab label="Add Dish" />
            <Tab 
              label={
                <Badge badgeContent={products.length} color="info">
                  My Dishes
                </Badge>
              }
            />
          </Tabs>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>
        )}

        {activeTab === 0 && (
          <Card sx={{ background: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', border: isDarkMode ? '1px solid rgba(255,255,255,0.2)' : 'none' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, color: isDarkMode ? 'white' : 'inherit' }}>
                Add a New Dish
              </Typography>
              <Box component="form" onSubmit={handleCreateProduct}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Dish Name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      fullWidth
                      multiline
                      minRows={3}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Price"
                      name="price"
                      type="number"
                      value={formData.price}
                      onChange={handleInputChange}
                      fullWidth
                      required
                      inputProps={{ step: '0.01' }}
                    />
                  </Grid>
                  <Grid item xs={12} md={8}>
                    <Button variant="contained" component="label">
                      Upload Images (up to 5)
                      <input type="file" hidden multiple accept="image/*" onChange={handleImageChange} />
                    </Button>
                    <Box mt={1} display="flex" gap={1} flexWrap="wrap">
                      {images.map((img, idx) => (
                        <Chip key={idx} label={img.name} size="small" />
                      ))}
                    </Box>
                  </Grid>
                </Grid>
                <Divider sx={{ my: 2 }} />
                <Box display="flex" gap={2}>
                  <Button type="submit" variant="contained" disabled={loading}>
                    {loading ? 'Submitting...' : 'Create Dish'}
                  </Button>
                  <Button type="button" variant="outlined" onClick={resetForm} disabled={loading}>
                    Reset
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}

        {activeTab === 1 && (
          <Grid container spacing={3}>
            {products.length === 0 ? (
              <Grid item xs={12}>
                <Card sx={{ background: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', border: isDarkMode ? '1px solid rgba(255,255,255,0.2)' : 'none' }}>
                  <CardContent>
                    <Box textAlign="center" py={4}>
                      <Typography variant="h6" sx={{ color: isDarkMode ? 'white' : 'inherit' }}>
                        No dishes yet. Create your first dish!
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ) : (
              products.map((product) => (
                <Grid item xs={12} md={6} lg={4} key={product._id}>
                  <Card sx={{ background: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', border: isDarkMode ? '1px solid rgba(255,255,255,0.2)' : 'none' }}>
                    {product.images && product.images.length > 0 && (
                      <CardMedia
                        component="img"
                        height="160"
                        image={product.images[0].startsWith('http') ? product.images[0] : `http://localhost:3001/${product.images[0]}`}
                        alt={product.name}
                      />
                    )}
                    <CardContent>
                      <Typography variant="h6" sx={{ color: isDarkMode ? 'white' : 'inherit' }}>
                        {product.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'text.secondary' }}>
                        {product.category} • ₹{product.price}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {product.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default VendorDashboard;