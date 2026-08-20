import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Tabs,
  Tab,
  Badge,
  Avatar,
  Divider
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Visibility,
  Person,
  AttachMoney,
  Category,
  LocationOn,
  Schedule,
  Phone,
  Email
} from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';
import axios from 'axios';

const AdminDashboard = () => {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [pendingItems, setPendingItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  // NEW: pending vendors state
  const [pendingVendors, setPendingVendors] = useState([]);

  useEffect(() => {
    fetchPendingItems();
    fetchPendingVendors();
  }, []);

  const fetchPendingItems = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/marketplace/pending', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingItems(response.data.items || []);
    } catch (error) {
      console.error('Error fetching pending items:', error);
      setError('Failed to load pending items');
    } finally {
      setLoading(false);
    }
  };

  // NEW: fetch pending vendors
  const fetchPendingVendors = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('/vendors/pending', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingVendors(res.data.vendors || []);
    } catch (e) {
      console.error('Error fetching pending vendors:', e);
      setError(e.response?.data?.message || 'Failed to load pending vendors');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (itemId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.put(`/marketplace/${itemId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Item approved successfully!');
      fetchPendingItems();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to approve item');
    } finally {
      setLoading(false);
    }
  };

  // NEW: approve vendor
  const handleApproveVendor = async (vendorId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.put(`/vendors/${vendorId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Vendor approved successfully!');
      fetchPendingVendors();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to approve vendor');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedItem || !rejectionReason.trim()) {
      setError('Please provide a rejection reason');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.put(`/marketplace/${selectedItem._id}/reject`, {
        reason: rejectionReason
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Item rejected successfully!');
      setOpenDialog(false);
      setSelectedItem(null);
      setRejectionReason('');
      fetchPendingItems();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to reject item');
    } finally {
      setLoading(false);
    }
  };

  const openRejectDialog = (item) => {
    setSelectedItem(item);
    setOpenDialog(true);
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
            Admin Dashboard
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 3 }}>
            Manage vendors, marketplace items, and platform analytics
          </Typography>
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
            <Tab 
              label={
                <Badge badgeContent={pendingItems.length} color="warning">
                  Pending Marketplace
                </Badge>
              } 
            />
            {/* NEW: Vendor approvals tab */}
            <Tab 
              label={
                <Badge badgeContent={pendingVendors.length} color="info">
                  Vendor Approvals
                </Badge>
              }
            />
            <Tab label="Platform Analytics" />
          </Tabs>
        </Box>

        {/* Tab Content */}
        {activeTab === 0 && (
          <Grid container spacing={3}>
            {pendingItems.length === 0 ? (
              <Grid item xs={12}>
                <Card sx={{ 
                  background: isDarkMode 
                    ? 'rgba(255,255,255,0.1)' 
                    : 'rgba(255,255,255,0.95)', 
                  backdropFilter: 'blur(10px)',
                  border: isDarkMode ? '1px solid rgba(255,255,255,0.2)' : 'none'
                }}>
                  <CardContent>
                    <Box textAlign="center" py={4}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          color: isDarkMode ? 'rgba(255,255,255,0.8)' : 'text.secondary'
                        }}
                      >
                        No pending items for approval
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ) : (
              pendingItems.map((item) => (
                <Grid item xs={12} md={6} lg={4} key={item._id}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      background: isDarkMode 
                        ? 'rgba(255,255,255,0.1)' 
                        : 'rgba(255,255,255,0.95)',
                      backdropFilter: 'blur(10px)',
                      border: isDarkMode ? '1px solid rgba(255,255,255,0.2)' : 'none',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: isDarkMode 
                          ? '0 8px 32px rgba(255,255,255,0.1)'
                          : '0 8px 32px rgba(0,0,0,0.15)'
                      }
                    }}
                  >
                    <Box
                      sx={{
                        position: 'relative',
                        width: '100%',
                        paddingTop: '60%', // 5:3 aspect ratio
                        overflow: 'hidden',
                        borderRadius: '4px 4px 0 0'
                      }}
                    >
                      <CardMedia
                        component="img"
                        image={`http://localhost:3001/${item.images?.[0]}` || '/placeholder.jpg'}
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
                    <CardContent>
                      <Typography 
                        variant="h6" 
                        gutterBottom 
                        noWrap
                        sx={{ 
                          color: isDarkMode ? 'white' : 'inherit'
                        }}
                      >
                        {item.title}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          mb: 2,
                          color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'text.secondary'
                        }}
                      >
                        {item.description?.substring(0, 100)}...
                      </Typography>
                      
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <AttachMoney 
                          sx={{ 
                            color: isDarkMode ? '#4CAF50' : 'primary.main'
                          }} 
                          fontSize="small" 
                        />
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            color: isDarkMode ? '#4CAF50' : 'primary.main'
                          }}
                        >
                          ${item.price}
                        </Typography>
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
                      
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Category 
                          fontSize="small" 
                          sx={{ 
                            color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'action.active'
                          }}
                        />
                        <Typography 
                          variant="caption"
                          sx={{ 
                            color: isDarkMode ? 'rgba(255,255,255,0.8)' : 'inherit'
                          }}
                        >
                          {item.category} • {item.condition}
                        </Typography>
                      </Box>
                      
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <LocationOn 
                          fontSize="small" 
                          sx={{ 
                            color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'action.active'
                          }}
                        />
                        <Typography 
                          variant="caption"
                          sx={{ 
                            color: isDarkMode ? 'rgba(255,255,255,0.8)' : 'inherit'
                          }}
                        >
                          {item.location}
                        </Typography>
                      </Box>
                      
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Person 
                          fontSize="small" 
                          sx={{ 
                            color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'action.active'
                          }}
                        />
                        <Typography 
                          variant="caption"
                          sx={{ 
                            color: isDarkMode ? 'rgba(255,255,255,0.8)' : 'inherit'
                          }}
                        >
                          {item.seller?.name}
                        </Typography>
                      </Box>
                      
                      <Box display="flex" alignItems="center" gap={1} mb={2}>
                        <Schedule 
                          fontSize="small" 
                          sx={{ 
                            color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'action.active'
                          }}
                        />
                        <Typography 
                          variant="caption"
                          sx={{ 
                            color: isDarkMode ? 'rgba(255,255,255,0.8)' : 'inherit'
                          }}
                        >
                          {new Date(item.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                      
                      <Divider 
                        sx={{ 
                          mb: 2,
                          borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : undefined
                        }} 
                      />
                      
                      <Box display="flex" gap={1}>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          startIcon={<CheckCircle />}
                          onClick={() => handleApprove(item._id)}
                          disabled={loading}
                          fullWidth
                        >
                          Approve
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          startIcon={<Cancel />}
                          onClick={() => openRejectDialog(item)}
                          disabled={loading}
                          fullWidth
                        >
                          Reject
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        )}

        {activeTab === 1 && (
          <Grid container spacing={3}>
            {pendingVendors.length === 0 ? (
              <Grid item xs={12}>
                <Card sx={{ 
                  background: isDarkMode 
                    ? 'rgba(255,255,255,0.1)' 
                    : 'rgba(255,255,255,0.95)', 
                  backdropFilter: 'blur(10px)',
                  border: isDarkMode ? '1px solid rgba(255,255,255,0.2)' : 'none'
                }}>
                  <CardContent>
                    <Box textAlign="center" py={4}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          color: isDarkMode ? 'rgba(255,255,255,0.8)' : 'text.secondary'
                        }}
                      >
                        No pending vendors for approval
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ) : (
              pendingVendors.map((vendor) => (
                <Grid item xs={12} md={6} lg={4} key={vendor._id}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      background: isDarkMode 
                        ? 'rgba(255,255,255,0.1)' 
                        : 'rgba(255,255,255,0.95)',
                      backdropFilter: 'blur(10px)',
                      border: isDarkMode ? '1px solid rgba(255,255,255,0.2)' : 'none',
                      transition: 'all 0.3s ease',
                      '&:hover': { transform: 'translateY(-4px)' }
                    }}
                  >
                    <CardContent>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar src={vendor.profileImage ? `http://localhost:3001/${vendor.profileImage}` : undefined} />
                        <Box>
                          <Typography variant="h6" sx={{ color: isDarkMode ? 'white' : 'inherit' }}>
                            {vendor.name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'text.secondary' }}>
                            {vendor.vendorDetails?.businessName} • {vendor.vendorDetails?.businessType}
                          </Typography>
                        </Box>
                      </Box>

                      <Box mt={2} display="flex" flexDirection="column" gap={1}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Email fontSize="small" sx={{ color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'action.active' }} />
                          <Typography variant="caption">{vendor.email}</Typography>
                        </Box>
                        {vendor.phone && (
                          <Box display="flex" alignItems="center" gap={1}>
                            <Phone fontSize="small" sx={{ color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'action.active' }} />
                            <Typography variant="caption">{vendor.phone}</Typography>
                          </Box>
                        )}
                        {vendor.vendorDetails?.location && (
                          <Box display="flex" alignItems="center" gap={1}>
                            <LocationOn fontSize="small" sx={{ color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'action.active' }} />
                            <Typography variant="caption">{vendor.vendorDetails.location}</Typography>
                          </Box>
                        )}
                      </Box>

                      <Divider sx={{ my: 2, borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : undefined }} />

                      <Box display="flex" gap={1}>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          startIcon={<CheckCircle />}
                          onClick={() => handleApproveVendor(vendor._id)}
                          disabled={loading}
                          fullWidth
                        >
                          Approve Vendor
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        )}

        {activeTab === 1 && (
          <></>
        )}
      </Container>

      {/* Rejection Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Reject Item</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Please provide a reason for rejecting "{selectedItem?.title}"
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Rejection Reason"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Explain why this item cannot be approved..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleReject} 
            variant="contained" 
            color="error"
            disabled={loading || !rejectionReason.trim()}
          >
            {loading ? 'Rejecting...' : 'Reject Item'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;