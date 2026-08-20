import React, { useState } from 'react';
import { Button, Box, Typography, Alert } from '@mui/material';
import { useCart } from '../contexts/CartContext';

const TestMarketplaceOrder = () => {
  const { addToCart, cartItems } = useCart();
  const [message, setMessage] = useState('');

  // Sample marketplace items from the API response
  const sampleItems = [
    {
      _id: "68c709d707a176e376575f21",
      title: "MacBook Pro 13-inch",
      price: 45000,
      category: "electronics",
      condition: "good",
      images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop&crop=center"]
    },
    {
      _id: "68c709d707a176e376575f23",
      title: "Engineering Textbooks",
      price: 1200,
      category: "books",
      condition: "good",
      images: ["https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop&crop=center"]
    }
  ];

  const addSampleItemToCart = (item) => {
    try {
      addToCart(item, 1);
      setMessage(`Added "${item.title}" to cart successfully!`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(`Error adding item to cart: ${error.message}`);
    }
  };

  const clearMessage = () => setMessage('');

  return (
    <Box sx={{ p: 2, border: '1px solid #ddd', borderRadius: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Test Marketplace Order
      </Typography>
      
      {message && (
        <Alert 
          severity={message.includes('Error') ? 'error' : 'success'} 
          onClose={clearMessage}
          sx={{ mb: 2 }}
        >
          {message}
        </Alert>
      )}

      <Typography variant="body2" sx={{ mb: 2 }}>
        Current cart items: {cartItems.length}
      </Typography>

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {sampleItems.map((item) => (
          <Button
            key={item._id}
            variant="outlined"
            size="small"
            onClick={() => addSampleItemToCart(item)}
          >
            Add {item.title} (₹{item.price})
          </Button>
        ))}
      </Box>

      <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
        Click the buttons above to add sample marketplace items to your cart, then try the payment flow.
      </Typography>
    </Box>
  );
};

export default TestMarketplaceOrder;