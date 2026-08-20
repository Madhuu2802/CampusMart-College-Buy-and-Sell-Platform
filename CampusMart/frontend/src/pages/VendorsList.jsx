import React, { useEffect, useState } from 'react';
import { Container, Box, Typography, TextField, Grid, Card, CardContent, Button } from '@mui/material';
import { Store } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// Removed local Navbar to avoid duplicate nav bars

const VendorsList = () => {
  const [vendors, setVendors] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      const res = await axios.get('/vendors', { params });
      setVendors(res.data?.vendors || []);
    } catch (err) {
      console.error('Error fetching vendors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVendors(); }, []);

  return (
    <>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Store color="primary" />
          <Typography variant="h5" fontWeight={600}>All Vendors</Typography>
        </Box>

        <Box display="flex" gap={2} mb={3}>
          <TextField
            placeholder="Search vendors by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
          />
          <Button variant="contained" onClick={fetchVendors} disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </Box>

        <Grid container spacing={3}>
          {vendors.map(v => (
            <Grid item xs={12} md={4} key={v._id}>
              <Card sx={{ cursor: 'pointer' }} onClick={() => navigate(`/vendor/${v._id}`)}>
                <CardContent>
                  <Typography variant="h6">{v.vendorDetails?.businessName || v.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{v.vendorDetails?.location}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </>
  );
};

export default VendorsList;