import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
  Chip,
  Rating,
  TextField,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  IconButton,
  Badge,
  Alert,
  CircularProgress,
  Paper,
  Stack,
  Tabs,
  Tab
} from '@mui/material';
import {
  Add,
  Remove,
  ShoppingCart,
  Favorite,
  FavoriteBorder,
  Share,
  ArrowBack,
  Store,
  LocalShipping,
  Security,
  Star
} from '@mui/icons-material';
import AuthContext from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import axios from 'axios';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchProduct();
    fetchReviews();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/products/${id}`);
      setProduct(response.data);
      
      // Check if product is in user's favorites
      if (user) {
        checkFavoriteStatus();
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      setError('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`/products/${id}/reviews`);
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const checkFavoriteStatus = async () => {
    try {
      const response = await axios.get('/user/favorites');
      const favorites = response.data;
      setIsFavorite(favorites.some(fav => fav._id === id));
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 1)) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        _id: product._id,
        title: product.name,
        price: product.price,
        images: product.images,
        vendor: product.vendor,
        type: 'product',
        quantity: quantity
      });
      alert('Product added to cart!');
    }
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      if (isFavorite) {
        await axios.delete(`/user/favorites/${id}`);
        setIsFavorite(false);
      } else {
        await axios.post(`/user/favorites/${id}`);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleSubmitReview = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!newReview.comment.trim()) {
      alert('Please write a review comment');
      return;
    }

    try {
      setSubmittingReview(true);
      await axios.post(`/products/${id}/reviews`, newReview);
      setNewReview({ rating: 5, comment: '' });
      fetchReviews(); // Refresh reviews
      alert('Review submitted successfully!');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading product details...
        </Typography>
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Product not found'}
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          variant="outlined"
        >
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3 }}
      >
        Back to Products
      </Button>

      <Grid container spacing={4}>
        {/* Product Images */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardMedia
              component="img"
              height="400"
              image={product.images?.[0] || '/placeholder-food.jpg'}
              alt={product.name}
              sx={{ objectFit: 'cover' }}
            />
          </Card>
          
          {/* Additional Images */}
          {product.images && product.images.length > 1 && (
            <Box sx={{ mt: 2, display: 'flex', gap: 1, overflowX: 'auto' }}>
              {product.images.slice(1).map((image, index) => (
                <Card key={index} sx={{ minWidth: 80, height: 80 }}>
                  <CardMedia
                    component="img"
                    height="80"
                    image={image}
                    alt={`${product.name} ${index + 2}`}
                    sx={{ objectFit: 'cover' }}
                  />
                </Card>
              ))}
            </Box>
          )}
        </Grid>

        {/* Product Info */}
        <Grid item xs={12} md={6}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {product.name}
            </Typography>

            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Rating value={product.rating || 0} readOnly precision={0.5} />
              <Typography variant="body2" color="text.secondary">
                ({reviews.length} reviews)
              </Typography>
            </Box>

            <Typography variant="h5" color="primary" gutterBottom>
              ₹{product.price}
            </Typography>

            <Box display="flex" gap={1} mb={2}>
              <Chip label={product.category} color="primary" variant="outlined" />
              {product.isVeg !== undefined && (
                <Chip 
                  label={product.isVeg ? 'Vegetarian' : 'Non-Vegetarian'} 
                  color={product.isVeg ? 'success' : 'error'}
                  variant="outlined"
                />
              )}
              {product.stock > 0 ? (
                <Chip label="In Stock" color="success" variant="outlined" />
              ) : (
                <Chip label="Out of Stock" color="error" variant="outlined" />
              )}
            </Box>

            <Typography variant="body1" paragraph>
              {product.description}
            </Typography>

            {/* Vendor Info */}
            <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
              <Box display="flex" alignItems="center" gap={2}>
                <Store color="primary" />
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {product.vendor?.businessName || product.vendor?.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Vendor
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {/* Quantity and Add to Cart */}
            {product.stock > 0 && (
              <Box mb={3}>
                <Typography variant="subtitle1" gutterBottom>
                  Quantity
                </Typography>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <IconButton 
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                  >
                    <Remove />
                  </IconButton>
                  <Typography variant="h6" sx={{ minWidth: 40, textAlign: 'center' }}>
                    {quantity}
                  </Typography>
                  <IconButton 
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stock}
                  >
                    <Add />
                  </IconButton>
                  <Typography variant="body2" color="text.secondary">
                    ({product.stock} available)
                  </Typography>
                </Box>

                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<ShoppingCart />}
                    onClick={handleAddToCart}
                    sx={{ flex: 1 }}
                  >
                    Add to Cart
                  </Button>
                  <IconButton
                    onClick={handleToggleFavorite}
                    color={isFavorite ? 'error' : 'default'}
                    size="large"
                  >
                    {isFavorite ? <Favorite /> : <FavoriteBorder />}
                  </IconButton>
                  <IconButton size="large">
                    <Share />
                  </IconButton>
                </Stack>
              </Box>
            )}

            {/* Features */}
            <Box display="flex" gap={2} mb={3}>
              <Box display="flex" alignItems="center" gap={1}>
                <LocalShipping color="primary" />
                <Typography variant="body2">Fast Delivery</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Security color="primary" />
                <Typography variant="body2">Secure Payment</Typography>
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Tabs for Description and Reviews */}
      <Box sx={{ mt: 4 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Description" />
          <Tab label={`Reviews (${reviews.length})`} />
        </Tabs>

        <Box sx={{ mt: 3 }}>
          {activeTab === 0 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Product Description
              </Typography>
              <Typography variant="body1">
                {product.description || 'No detailed description available.'}
              </Typography>
              
              {product.ingredients && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Ingredients
                  </Typography>
                  <Typography variant="body1">
                    {product.ingredients}
                  </Typography>
                </Box>
              )}
            </Paper>
          )}

          {activeTab === 1 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Customer Reviews
              </Typography>

              {/* Write Review */}
              {user && (
                <Box sx={{ mb: 4, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Write a Review
                  </Typography>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Typography variant="body2">Rating:</Typography>
                    <Rating
                      value={newReview.rating}
                      onChange={(event, newValue) => 
                        setNewReview(prev => ({ ...prev, rating: newValue }))
                      }
                    />
                  </Box>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Share your experience with this product..."
                    value={newReview.comment}
                    onChange={(e) => 
                      setNewReview(prev => ({ ...prev, comment: e.target.value }))
                    }
                    sx={{ mb: 2 }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleSubmitReview}
                    disabled={submittingReview}
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </Button>
                </Box>
              )}

              {/* Reviews List */}
              {reviews.length > 0 ? (
                <List>
                  {reviews.map((review, index) => (
                    <React.Fragment key={review._id || index}>
                      <ListItem alignItems="flex-start">
                        <ListItemAvatar>
                          <Avatar>
                            {review.user?.name?.charAt(0)?.toUpperCase()}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={2}>
                              <Typography variant="subtitle1">
                                {review.user?.name || 'Anonymous'}
                              </Typography>
                              <Rating value={review.rating} readOnly size="small" />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" sx={{ mt: 1 }}>
                                {review.comment}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < reviews.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                  No reviews yet. Be the first to review this product!
                </Typography>
              )}
            </Paper>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default ProductDetails;