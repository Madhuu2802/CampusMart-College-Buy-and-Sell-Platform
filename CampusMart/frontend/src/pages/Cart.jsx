import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Button,
  IconButton,
  Grid,
  Divider,
  Alert,
  Chip
} from '@mui/material';
import {
  Add,
  Remove,
  Delete,
  Payment,
  ShoppingCartCheckout,
  ArrowBack
} from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';


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

const Cart = () => {
  const { isDarkMode } = useTheme();
  const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    try {
      setProcessing(true);
      setError('');
      
      // Check if user is authenticated
      if (!user) {
        setError('Please log in to proceed with payment.');
        navigate('/login');
        return;
      }

      // Check if token exists
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        navigate('/login');
        return;
      }
      
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError('Failed to load payment gateway. Please try again.');
        return;
      }

      // Decide checkout route based on cart item types
      const types = new Set(cartItems.map(ci => ci.type || 'marketplace'));
      if (types.size > 1) {
        setError('Please checkout vendor products and marketplace items separately.');
        return;
      }

      const [type] = Array.from(types);

      let orderResponse;
      if (type === 'product') {
        // Ensure all vendor products are from the same vendor
        const vendorIds = new Set(cartItems.map(ci => (ci.vendor?._id || ci.vendor)));
        if (vendorIds.size > 1) {
          setError('All vendor items must be from the same vendor. Remove items from other vendors.');
          return;
        }

        // Create vendor product order
        orderResponse = await fetch('http://localhost:3001/api/payments/create-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            items: cartItems.map(ci => ({ productId: ci._id, quantity: ci.quantity })),
            deliveryDetails: { type: 'pickup', phone: user?.phone }
          })
        });
      } else {
        // Marketplace order
        orderResponse = await fetch('http://localhost:3001/api/payments/create-marketplace-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            cartItems: cartItems,
            customerDetails: {
               name: user?.name,
               email: user?.email,
               phone: user?.phone
             }
          })
        });
      }

      console.log('Order request sent:', {
        cartItems: cartItems,
        customerDetails: {
          name: user?.name,
          email: user?.email,
          phone: user?.phone
        }
      });
      console.log('Order response status:', orderResponse.status);

      if (!orderResponse.ok) {
        let errorMessage = 'Failed to create order';
        try {
          const errorData = await orderResponse.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          console.error('Error parsing order response:', parseError);
          errorMessage = `Server error: ${orderResponse.status}`;
        }
        throw new Error(errorMessage);
      }

      const orderData = await orderResponse.json();

      // Configure Razorpay options
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'CampusMart',
        description: types.has('product') ? 'Vendor Product Purchase' : 'Marketplace Purchase',
        order_id: orderData.orderId || orderData.razorpayOrder?.id,
        handler: async (response) => {
          try {
            // Verify payment on backend
            const verifyResponse = await fetch('http://localhost:3001/api/payments/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: orderData?.order?.id
              })
            });

            if (verifyResponse.ok) {
              // Parse the successful response
              const verifyData = await verifyResponse.json();
              console.log('Payment verification successful:', verifyData);
              
              // Payment successful
              clearCart();
              setPaymentDialog(false);
              navigate('/orders');
            } else {
              // Parse error response if available
              let errorMessage = 'Payment verification failed';
              try {
                const errorData = await verifyResponse.json();
                errorMessage = errorData.message || errorMessage;
              } catch (parseError) {
                console.error('Error parsing verification response:', parseError);
              }
              throw new Error(errorMessage);
            }
          } catch (error) {
            setError('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
           name: user?.name,
           email: user?.email,
           contact: user?.phone
         },
        theme: {
          color: isDarkMode ? '#1976d2' : '#CD1C18'
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
          }
        }
      };

      // Open Razorpay checkout
      const razorpay = new window.Razorpay(options);
      razorpay.open();
      
    } catch (error) {
      console.error('Payment error:', error);
      setError(error.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: isDarkMode 
          ? 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #2d2d2d 100%)'
          : 'linear-gradient(135deg, #CD1C18 0%, #FFA896 100%)',
        py: 4,
        color: isDarkMode ? '#ffffff' : 'inherit'
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
            sx={{ color: 'white' }}
          >
            Back
          </Button>
          <Typography variant="h4" sx={{ color: 'white', fontWeight: 700, flex: 1, textAlign: 'center' }}>
            Shopping Cart ({cartItems.length} items)
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {cartItems.length === 0 ? (
          <Card sx={{ 
            textAlign: 'center', 
            py: 8,
            borderRadius: 3,
            boxShadow: isDarkMode 
              ? '0 4px 20px rgba(0,0,0,0.3)' 
              : '0 4px 20px rgba(0,0,0,0.1)',
            border: isDarkMode 
              ? '1px solid rgba(255,255,255,0.1)' 
              : '1px solid rgba(0,0,0,0.05)',
            background: isDarkMode 
              ? 'linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)' 
              : '#ffffff'
          }}>
            <CardContent>
              <ShoppingCartCheckout sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Your cart is empty
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Add some items from the marketplace to get started!
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/marketplace')}
                sx={{
                  background: 'linear-gradient(135deg, #CD1C18, #9B1313)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #9B1313, #CD1C18)'
                  }
                }}
              >
                Browse Marketplace
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {/* Cart Items */}
            <Grid item xs={12} md={8}>
              {cartItems.map((item) => (
                <Card 
                   key={item._id} 
                   sx={{ 
                     mb: 3,
                     borderRadius: 3,
                     boxShadow: isDarkMode 
                       ? '0 4px 20px rgba(0,0,0,0.3)' 
                       : '0 4px 20px rgba(0,0,0,0.1)',
                     border: isDarkMode 
                       ? '1px solid rgba(255,255,255,0.1)' 
                       : '1px solid rgba(0,0,0,0.05)',
                     background: isDarkMode 
                       ? 'linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)' 
                       : '#ffffff',
                     transition: 'all 0.3s ease',
                     '&:hover': {
                       boxShadow: isDarkMode 
                         ? '0 8px 30px rgba(0,0,0,0.4)' 
                         : '0 8px 30px rgba(0,0,0,0.15)',
                       transform: 'translateY(-2px)'
                     }
                   }}
                 >
                  <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={3}>
                        <Box
                          sx={{
                            width: '100%',
                            height: { xs: 200, sm: 120 },
                            borderRadius: 2,
                            overflow: 'hidden',
                            position: 'relative',
                            background: 'linear-gradient(135deg, #f5f5f5, #e0e0e0)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {item.images && item.images.length > 0 ? (
                            <CardMedia
                              component="img"
                              sx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                transition: 'transform 0.3s ease',
                                '&:hover': {
                                  transform: 'scale(1.05)'
                                }
                              }}
                              image={getImageUrl(item.images?.[0])}
                              alt={item.title || item.name}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <Box
                            sx={{
                              position: item.images && item.images.length > 0 ? 'absolute' : 'static',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              display: item.images && item.images.length > 0 ? 'none' : 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: 'linear-gradient(135deg, #f5f5f5, #e0e0e0)',
                              color: 'text.secondary'
                            }}
                          >
                            <ShoppingCartCheckout sx={{ fontSize: 40, opacity: 0.5 }} />
                          </Box>
                        </Box>
                      </Grid>
                       <Grid item xs={12} sm={6}>
                         <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                           <Box>
                             <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                               {item.title || item.name}
                             </Typography>
                             <Typography 
                               variant="body2" 
                               color="text.secondary" 
                               gutterBottom 
                               sx={{ 
                                 display: '-webkit-box',
                                 WebkitLineClamp: 2,
                                 WebkitBoxOrient: 'vertical',
                                 overflow: 'hidden',
                                 mb: 2
                               }}
                             >
                               {item.description || 'No description available'}
                             </Typography>
                             <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                               <Chip 
                                 label={item.category || (item.type === 'product' ? 'food' : '')} 
                                 size="small" 
                                 color="primary" 
                                 variant="outlined"
                               />
                               <Chip 
                                 label={item.condition || ''} 
                                 size="small" 
                                 color="secondary" 
                                 variant="outlined"
                               />
                             </Box>
                           </Box>
                           <Typography 
                              variant="h5" 
                              color="primary" 
                              sx={{ 
                                fontWeight: 700,
                                background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                              }}
                            >
                              ₹{item.price}
                            </Typography>
                         </Box>
                       </Grid>
                       <Grid item xs={12} sm={3}>
                          <Box sx={{ 
                            display: 'flex', 
                            flexDirection: { xs: 'row', sm: 'column' }, 
                            alignItems: { xs: 'center', sm: 'flex-end' },
                            justifyContent: { xs: 'space-between', sm: 'center' },
                            gap: 2,
                            height: '100%'
                          }}>
                            {/* Quantity Controls */}
                            <Box sx={{ 
                               display: 'flex', 
                               alignItems: 'center', 
                               gap: 1,
                               background: isDarkMode 
                                 ? 'rgba(255,255,255,0.1)' 
                                 : 'rgba(0,0,0,0.05)',
                               borderRadius: 2,
                               p: 0.5
                             }}>
                              <IconButton
                                onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                                size="small"
                                sx={{
                                  background: 'linear-gradient(45deg, #f44336, #ff7961)',
                                  color: 'white',
                                  '&:hover': {
                                    background: 'linear-gradient(45deg, #d32f2f, #f44336)',
                                    transform: 'scale(1.1)'
                                  },
                                  width: 32,
                                  height: 32
                                }}
                              >
                                <Remove fontSize="small" />
                              </IconButton>
                              <Typography 
                                variant="h6" 
                                sx={{ 
                                  minWidth: 40, 
                                  textAlign: 'center',
                                  fontWeight: 600,
                                  background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                                  WebkitBackgroundClip: 'text',
                                  WebkitTextFillColor: 'transparent'
                                }}
                              >
                                {item.quantity}
                              </Typography>
                              <IconButton
                                onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                                size="small"
                                sx={{
                                  background: 'linear-gradient(45deg, #4caf50, #81c784)',
                                  color: 'white',
                                  '&:hover': {
                                    background: 'linear-gradient(45deg, #388e3c, #4caf50)',
                                    transform: 'scale(1.1)'
                                  },
                                  width: 32,
                                  height: 32
                                }}
                              >
                                <Add fontSize="small" />
                              </IconButton>
                            </Box>
                            
                            {/* Remove Button */}
                            <Button
                              startIcon={<Delete />}
                              onClick={() => removeFromCart(item._id)}
                              variant="outlined"
                              color="error"
                              size="small"
                              sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 600,
                                '&:hover': {
                                  background: 'rgba(244, 67, 54, 0.1)',
                                  transform: 'translateY(-1px)'
                                }
                              }}
                            >
                              Remove
                            </Button>
                            
                            {/* Item Total */}
                            <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                              <Typography variant="caption" color="text.secondary">
                                Subtotal
                              </Typography>
                              <Typography 
                                 variant="h6" 
                                 sx={{ 
                                   fontWeight: 700,
                                   color: 'success.main'
                                 }}
                               >
                                 ₹{(item.price * item.quantity).toFixed(2)}
                               </Typography>
                            </Box>
                          </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Grid>

            {/* Order Summary */}
            <Grid item xs={12} md={4}>
              <Card sx={{ 
                 position: 'sticky', 
                 top: 20,
                 borderRadius: 3,
                 boxShadow: isDarkMode 
                   ? '0 4px 20px rgba(0,0,0,0.3)' 
                   : '0 4px 20px rgba(0,0,0,0.1)',
                 border: isDarkMode 
                   ? '1px solid rgba(255,255,255,0.1)' 
                   : '1px solid rgba(0,0,0,0.05)',
                 background: isDarkMode 
                   ? 'linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)' 
                   : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
               }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography 
                    variant="h5" 
                    gutterBottom 
                    sx={{ 
                      fontWeight: 700,
                      background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 3
                    }}
                  >
                    Order Summary
                  </Typography>
                  <Divider sx={{ my: 2, background: 'linear-gradient(90deg, transparent, #1976d2, transparent)' }} />
                  
                  {cartItems.map((item) => (
                    <Box 
                      key={item._id} 
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        mb: 2,
                         p: 2,
                         borderRadius: 2,
                         background: isDarkMode 
                           ? 'rgba(25, 118, 210, 0.15)' 
                           : 'rgba(25, 118, 210, 0.05)',
                         border: isDarkMode 
                           ? '1px solid rgba(25, 118, 210, 0.3)' 
                           : '1px solid rgba(25, 118, 210, 0.1)'
                      }}
                    >
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {item.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                           Qty: {item.quantity} × ₹{item.price}
                         </Typography>
                       </Box>
                       <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                         ₹{(item.price * item.quantity).toFixed(2)}
                       </Typography>
                    </Box>
                  ))}
                  
                  <Divider sx={{ my: 3, background: 'linear-gradient(90deg, transparent, #1976d2, transparent)' }} />
                  
                  {/* Total Section */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    mb: 3,
                    p: 2,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
                    color: 'white'
                  }}>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      Total
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>
                       ₹{getCartTotal().toFixed(2)}
                     </Typography>
                  </Box>
                  
                  <Button
                     fullWidth
                     variant="contained"
                     startIcon={<Payment />}
                     onClick={handlePayment}
                     disabled={processing}
                     sx={{
                       background: 'linear-gradient(135deg, #4CAF50, #66BB6A)',
                       '&:hover': {
                         background: 'linear-gradient(135deg, #388E3C, #4CAF50)'
                       },
                       mb: 2
                     }}
                   >
                     {processing ? 'Processing...' : 'Pay with Razorpay'}
                   </Button>
                  
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={clearCart}
                    color="error"
                  >
                    Clear Cart
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

      </Container>
    </Box>
  );
};

export default Cart;