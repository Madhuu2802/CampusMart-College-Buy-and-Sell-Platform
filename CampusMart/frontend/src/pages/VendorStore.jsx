import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Box, Typography, Grid, Card, CardContent, CardMedia, Chip, Button, Rating } from '@mui/material';
import axios from 'axios';
// Removed local Navbar to avoid duplicate nav bars
import { useCart } from '../contexts/CartContext';

const VendorStore = () => {
  const { id } = useParams();
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/vendors/${id}`);
        setVendor(res.data?.vendor || null);
        setProducts(res.data?.products || []);
      } catch (err) {
        console.error('Failed to load vendor', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVendor();
  }, [id]);

  

  return (
    <>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {vendor && (
          <Box mb={3}>
            <Typography variant="h4" fontWeight={700}>{vendor.vendorDetails?.businessName || vendor.name}</Typography>
            <Typography variant="body2" color="text.secondary">{vendor.vendorDetails?.location}</Typography>
          </Box>
        )}

        <Grid container spacing={3}>
          {products.map(p => (
            <Grid item xs={12} md={4} key={p._id}>
              <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
                {p.images && p.images.length > 0 && (
                  <CardMedia component="img" height="160" image={p.images[0]} alt={p.name} sx={{ objectFit: 'cover' }} />
                )}
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{p.name}</Typography>
                    <Chip label={`₹${p.price}`} color="primary" sx={{ fontWeight: 700 }} />
                  </Box>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Rating value={p.rating?.average || 0} precision={0.5} readOnly size="small" />
                    <Typography variant="caption" color="text.secondary">({p.rating?.count || 0})</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{p.description}</Typography>
                  <Box display="flex" gap={1}>
                    <Button
                      variant="contained"
                      onClick={() => addToCart({
                        _id: p._id,
                        title: p.name,
                        price: p.price,
                        images: p.images,
                        type: 'product',
                        vendor: vendor?._id || (vendor && vendor.id) || p.vendor
                      })}
                    >
                      Add to Cart
                    </Button>
                    <Button variant="outlined" href={`/product/${p._id}`}>View Details</Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {!loading && products.length === 0 && (
            <Box px={2}>
              <Typography>No products yet.</Typography>
            </Box>
          )}
        </Grid>
      </Container>
    </>
  );
};

export default VendorStore;