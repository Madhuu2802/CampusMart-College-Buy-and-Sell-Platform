import React, { useState } from 'react';
import { Container, Box, Typography, TextField, Grid, Card, CardContent, Button, Alert } from '@mui/material';
import { Store } from '@mui/icons-material';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';

const BecomeVendor = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({ businessName: '', businessType: '', location: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.businessName || !formData.businessType || !formData.location) {
      setError('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post('/vendors/apply', formData);
      const updatedUser = res.data?.user;
      if (updatedUser) {
        updateUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      setSuccess(res.data?.message || 'Application submitted');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  const alreadyVendor = user?.role === 'vendor';
  const isApproved = user?.vendorDetails?.isApproved;

  return (
    <>
      <Navbar />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box textAlign="center" mb={3}>
          <Store color="primary" sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="h4" fontWeight={700}>Become a Vendor</Typography>
          <Typography variant="body1" color="text.secondary">
            Register your business to sell food to students on campus.
          </Typography>
        </Box>

        {alreadyVendor && (
          <Alert severity={isApproved ? 'info' : 'warning'} sx={{ mb: 2 }}>
            {isApproved
              ? 'You are already an approved vendor.'
              : 'Your vendor application is pending approval from admin.'}
          </Alert>
        )}

        <Card>
          <CardContent>
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Business Name"
                    fullWidth
                    value={formData.businessName}
                    onChange={(e) => handleChange('businessName', e.target.value)}
                    required
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Business Type"
                    fullWidth
                    value={formData.businessType}
                    onChange={(e) => handleChange('businessType', e.target.value)}
                    placeholder="e.g., Fast Food, Bakery"
                    required
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Location"
                    fullWidth
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    placeholder="e.g., Main Canteen, Hostel Block A"
                    required
                    disabled={loading}
                  />
                </Grid>
              </Grid>

              {error && <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError('')}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ mt: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

              <Box mt={3}>
                <Button type="submit" variant="contained" disabled={loading}>
                  {loading ? 'Submitting...' : alreadyVendor ? 'Update Application' : 'Apply as Vendor'}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </>
  );
};

export default BecomeVendor;