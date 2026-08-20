import React from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Box, Typography, Button, Paper } from '@mui/material';

const CartDebug = () => {
  const { cartItems } = useCart();
  const { user } = useAuth();

  const logCartData = () => {
    console.log('Cart Items:', cartItems);
    console.log('User:', user);
    console.log('Cart Items Count:', cartItems.length);
    
    cartItems.forEach((item, index) => {
      console.log(`Item ${index}:`, {
        id: item._id,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        seller: item.seller,
        fullItem: item
      });
    });
  };

  const addTestItem = () => {
    // This would need to be implemented in CartContext
    console.log('Add test item functionality would go here');
  };

  return (
    <Paper sx={{ p: 2, m: 2 }}>
      <Typography variant="h6">Cart Debug</Typography>
      <Typography>Items in cart: {cartItems.length}</Typography>
      <Typography>User logged in: {user ? 'Yes' : 'No'}</Typography>
      <Box sx={{ mt: 2 }}>
        <Button onClick={logCartData} variant="outlined" sx={{ mr: 1 }}>
          Log Cart Data
        </Button>
      </Box>
      {cartItems.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2">Cart Items:</Typography>
          {cartItems.map((item, index) => (
            <Typography key={index} variant="body2">
              {item.title} - ${item.price} x {item.quantity}
            </Typography>
          ))}
        </Box>
      )}
    </Paper>
  );
};

export default CartDebug;