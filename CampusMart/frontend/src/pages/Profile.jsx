import React, { useState, useContext, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  Paper,
  Divider,
  Alert,
  Tabs,
  Tab,
  Chip,
  IconButton
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  LocationOn,
  Edit,
  Save,
  Cancel,
  Store,
  PhotoCamera
} from '@mui/icons-material';
import AuthContext from '../contexts/AuthContext';
import axios from 'axios';

const Profile = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    bio: '',
    profilePicture: ''
  });

  const [vendorData, setVendorData] = useState({
    businessName: '',
    businessType: '',
    description: '',
    address: '',
    phone: '',
    website: ''
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        bio: user.bio || '',
        profilePicture: user.profilePicture || ''
      });

      if (user.role === 'vendor' && user.vendorDetails) {
        setVendorData({
          businessName: user.vendorDetails.businessName || '',
          businessType: user.vendorDetails.businessType || '',
          description: user.vendorDetails.description || '',
          address: user.vendorDetails.address || '',
          phone: user.vendorDetails.phone || '',
          website: user.vendorDetails.website || ''
        });
      }
    }
  }, [user]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleVendorInputChange = (field, value) => {
    setVendorData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const updateData = {
        ...profileData,
        ...(user.role === 'vendor' && { vendorDetails: vendorData })
      };

      const response = await axios.put(
        'http://localhost:3001/api/auth/profile',
        updateData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      updateUser(response.data.user);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update profile' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset to original data
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        bio: user.bio || '',
        profilePicture: user.profilePicture || ''
      });

      if (user.role === 'vendor' && user.vendorDetails) {
        setVendorData({
          businessName: user.vendorDetails.businessName || '',
          businessType: user.vendorDetails.businessType || '',
          description: user.vendorDetails.description || '',
          address: user.vendorDetails.address || '',
          phone: user.vendorDetails.phone || '',
          website: user.vendorDetails.website || ''
        });
      }
    }
    setIsEditing(false);
    setMessage({ type: '', text: '' });
  };

  const ProfileTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Box position="relative" display="inline-block">
              <Avatar
                sx={{ 
                  width: 120, 
                  height: 120, 
                  mx: 'auto', 
                  mb: 2,
                  bgcolor: 'primary.main',
                  fontSize: '3rem'
                }}
                src={profileData.profilePicture}
              >
                {profileData.name?.charAt(0)?.toUpperCase()}
              </Avatar>
              {isEditing && (
                <IconButton
                  sx={{
                    position: 'absolute',
                    bottom: 16,
                    right: -8,
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': { bgcolor: 'primary.dark' }
                  }}
                  size="small"
                >
                  <PhotoCamera />
                </IconButton>
              )}
            </Box>
            
            <Typography variant="h5" gutterBottom>
              {profileData.name}
            </Typography>
            
            <Chip 
              label={user?.role?.toUpperCase()} 
              color="primary" 
              sx={{ mb: 2 }}
            />
            
            {profileData.bio && (
              <Typography variant="body2" color="text.secondary">
                {profileData.bio}
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6">Personal Information</Typography>
              {!isEditing ? (
                <Button
                  startIcon={<Edit />}
                  onClick={() => setIsEditing(true)}
                  variant="outlined"
                >
                  Edit Profile
                </Button>
              ) : (
                <Box>
                  <Button
                    startIcon={<Save />}
                    onClick={handleSaveProfile}
                    variant="contained"
                    disabled={loading}
                    sx={{ mr: 1 }}
                  >
                    Save
                  </Button>
                  <Button
                    startIcon={<Cancel />}
                    onClick={handleCancel}
                    variant="outlined"
                  >
                    Cancel
                  </Button>
                </Box>
              )}
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={profileData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  value={profileData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={profileData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Address"
                  value={profileData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Bio"
                  multiline
                  rows={3}
                  value={profileData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Tell us about yourself..."
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const VendorTab = () => (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6">Vendor Information</Typography>
          {!isEditing ? (
            <Button
              startIcon={<Edit />}
              onClick={() => setIsEditing(true)}
              variant="outlined"
            >
              Edit Vendor Details
            </Button>
          ) : (
            <Box>
              <Button
                startIcon={<Save />}
                onClick={handleSaveProfile}
                variant="contained"
                disabled={loading}
                sx={{ mr: 1 }}
              >
                Save
              </Button>
              <Button
                startIcon={<Cancel />}
                onClick={handleCancel}
                variant="outlined"
              >
                Cancel
              </Button>
            </Box>
          )}
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Business Name"
              value={vendorData.businessName}
              onChange={(e) => handleVendorInputChange('businessName', e.target.value)}
              disabled={!isEditing}
              InputProps={{
                startAdornment: <Store sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Business Type"
              value={vendorData.businessType}
              onChange={(e) => handleVendorInputChange('businessType', e.target.value)}
              disabled={!isEditing}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Business Description"
              multiline
              rows={3}
              value={vendorData.description}
              onChange={(e) => handleVendorInputChange('description', e.target.value)}
              disabled={!isEditing}
              placeholder="Describe your business..."
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Business Address"
              value={vendorData.address}
              onChange={(e) => handleVendorInputChange('address', e.target.value)}
              disabled={!isEditing}
              InputProps={{
                startAdornment: <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Business Phone"
              value={vendorData.phone}
              onChange={(e) => handleVendorInputChange('phone', e.target.value)}
              disabled={!isEditing}
              InputProps={{
                startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Website"
              value={vendorData.website}
              onChange={(e) => handleVendorInputChange('website', e.target.value)}
              disabled={!isEditing}
              placeholder="https://your-website.com"
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">
          Please log in to access your profile.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Profile
      </Typography>

      {message.text && (
        <Alert 
          severity={message.type} 
          sx={{ mb: 3 }}
          onClose={() => setMessage({ type: '', text: '' })}
        >
          {message.text}
        </Alert>
      )}

      <Paper sx={{ width: '100%', p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <Tabs
              orientation="vertical"
              value={activeTab}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab 
                icon={<Person />} 
                label="Profile" 
                iconPosition="start"
              />
              {user.role === 'vendor' && (
                <Tab 
                  icon={<Store />} 
                  label="Vendor Details" 
                  iconPosition="start"
                />
              )}
            </Tabs>
          </Grid>
          <Grid item xs={12} md={9}>
            <Box sx={{ p: 1 }}>
              {activeTab === 0 && <ProfileTab />}
              {activeTab === 1 && user.role === 'vendor' && <VendorTab />}
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Profile;