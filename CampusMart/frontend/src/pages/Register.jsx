import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import {
  Person,
  Email,
  Lock,
  Phone,
  School,
  Business,
  Visibility,
  VisibilityOff,
  Restaurant,
  ShoppingCart,
  ArrowBack,
  ArrowForward
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import LoadingSpinner from '../components/LoadingSpinner';

const steps = ['Choose Role', 'Basic Info', 'Additional Details'];

const Register = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    college: '',
    role: '',
    studentId: '',
    businessName: '',
    businessType: '',
    location: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  
  const { register, loading, error, clearError } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear errors when user starts typing
    if (error) clearError();
    if (localError) setLocalError('');
  };

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const validateStep = () => {
    switch (activeStep) {
      case 0:
        if (!formData.role) {
          setLocalError('Please select a role');
          return false;
        }
        break;
      case 1:
        if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword || !formData.phone || !formData.college) {
          setLocalError('Please fill in all required fields');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setLocalError('Passwords do not match');
          return false;
        }
        if (formData.password.length < 6) {
          setLocalError('Password must be at least 6 characters');
          return false;
        }
        break;
      case 2:
        if (formData.role === 'student' && !formData.studentId) {
          setLocalError('Student ID is required');
          return false;
        }
        if (formData.role === 'vendor' && (!formData.businessName || !formData.businessType || !formData.location)) {
          setLocalError('All business details are required');
          return false;
        }
        break;
      default:
        break;
    }
    setLocalError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep()) return;

    const userData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      college: formData.college,
      role: formData.role
    };

    if (formData.role === 'student') {
      userData.studentId = formData.studentId;
    } else if (formData.role === 'vendor') {
      userData.vendorDetails = {
        businessName: formData.businessName,
        businessType: formData.businessType,
        location: formData.location
      };
    }

    const result = await register(userData);
    
    if (result.success) {
      navigate('/dashboard');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  if (loading) {
    return <LoadingSpinner message="Creating your account..." />;
  }

  const renderRoleSelection = () => (
    <Box>
      <Typography variant="h6" gutterBottom align="center">
        Choose Your Role
      </Typography>
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              cursor: 'pointer',
              border: formData.role === 'student' ? '2px solid #e23744' : '1px solid #e0e0e0',
              '&:hover': {
                boxShadow: 3,
                borderColor: '#e23744'
              }
            }}
            onClick={() => setFormData({ ...formData, role: 'student' })}
          >
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <ShoppingCart sx={{ fontSize: 48, color: '#e23744', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Student
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Buy food from vendors and trade second-hand items
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              cursor: 'pointer',
              border: formData.role === 'vendor' ? '2px solid #e23744' : '1px solid #e0e0e0',
              '&:hover': {
                boxShadow: 3,
                borderColor: '#e23744'
              }
            }}
            onClick={() => setFormData({ ...formData, role: 'vendor' })}
          >
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Restaurant sx={{ fontSize: 48, color: '#e23744', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Vendor
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sell food items and manage your business on campus
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  const renderBasicInfo = () => (
    <Box>
      <Typography variant="h6" gutterBottom align="center">
        Basic Information
      </Typography>
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            name="name"
            label="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            name="email"
            type="email"
            label="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            name="password"
            type={showPassword ? 'text' : 'password'}
            label="Password"
            value={formData.password}
            onChange={handleChange}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={togglePasswordVisibility} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            label="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={toggleConfirmPasswordVisibility} edge="end">
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            name="phone"
            label="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Phone color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            name="college"
            label="College/University"
            value={formData.college}
            onChange={handleChange}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <School color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );

  const renderAdditionalDetails = () => (
    <Box>
      <Typography variant="h6" gutterBottom align="center">
        {formData.role === 'student' ? 'Student Details' : 'Business Details'}
      </Typography>
      {formData.role === 'student' ? (
        <TextField
          fullWidth
          name="studentId"
          label="Student ID"
          value={formData.studentId}
          onChange={handleChange}
          required
          sx={{ mt: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <School color="action" />
              </InputAdornment>
            ),
          }}
        />
      ) : (
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              name="businessName"
              label="Business Name"
              value={formData.businessName}
              onChange={handleChange}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Business color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Business Type</InputLabel>
              <Select
                name="businessType"
                value={formData.businessType}
                onChange={handleChange}
                label="Business Type"
              >
                <MenuItem value="restaurant">Restaurant</MenuItem>
                <MenuItem value="cafe">Cafe</MenuItem>
                <MenuItem value="food-truck">Food Truck</MenuItem>
                <MenuItem value="canteen">Canteen</MenuItem>
                <MenuItem value="bakery">Bakery</MenuItem>
                <MenuItem value="juice-bar">Juice Bar</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="location"
              label="Location on Campus"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </Grid>
        </Grid>
      )}
    </Box>
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: isDarkMode 
          ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
          : 'linear-gradient(135deg, #CD1C18 0%, #FFA896 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
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
      <Container maxWidth="md">
        <Paper
          elevation={24}
          sx={{
            padding: 4,
            borderRadius: 3,
            background: isDarkMode 
              ? 'rgba(255, 255, 255, 0.1)'
              : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.2)' : 'none'
          }}
        >
          {/* Header */}
          <Box textAlign="center" mb={4}>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #e23744, #ff6b75)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}
            >
              Join Campus Mart
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'text.secondary'
              }}
            >
              Create your account to get started
            </Typography>
          </Box>

          {/* Stepper */}
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Error Alert */}
          {(error || localError) && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error || localError}
            </Alert>
          )}

          {/* Form Content */}
          <form onSubmit={handleSubmit}>
            {activeStep === 0 && renderRoleSelection()}
            {activeStep === 1 && renderBasicInfo()}
            {activeStep === 2 && renderAdditionalDetails()}

            {/* Navigation Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                onClick={handleBack}
                disabled={activeStep === 0}
                startIcon={<ArrowBack />}
              >
                Back
              </Button>
              
              {activeStep === steps.length - 1 ? (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{
                    background: 'linear-gradient(135deg, #e23744, #ff6b75)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #d32f2f, #e23744)',
                    },
                  }}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  variant="contained"
                  endIcon={<ArrowForward />}
                  sx={{
                    background: 'linear-gradient(135deg, #e23744, #ff6b75)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #d32f2f, #e23744)',
                    },
                  }}
                >
                  Next
                </Button>
              )}
            </Box>
          </form>

          {/* Login Link */}
          <Box textAlign="center" mt={3}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'text.secondary'
              }}
            >
              Already have an account?{' '}
              <Link
                to="/login"
                style={{
                  color: '#e23744',
                  textDecoration: 'none',
                  fontWeight: 600
                }}
              >
                Sign In
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;