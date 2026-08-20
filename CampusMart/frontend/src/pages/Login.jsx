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
  Divider
} from '@mui/material';
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Restaurant,
  School
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  
  const { login, loading, error, clearError } = useAuth();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.email || !formData.password) {
      setLocalError('Please fill in all fields');
      return;
    }

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      navigate('/dashboard');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (loading) {
    return <LoadingSpinner message="Signing you in..." />;
  }

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
      <Container maxWidth="sm">
        <Paper
          elevation={24}
          sx={{
            padding: 4,
            borderRadius: 3,
            background: isDarkMode 
              ? 'rgba(30, 30, 30, 0.95)' 
              : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            color: isDarkMode ? '#ffffff' : '#333333'
          }}
        >
          {/* Logo and Title */}
          <Box textAlign="center" mb={4}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: isDarkMode
                  ? 'linear-gradient(135deg, #9B1313, #38000A)'
                  : 'linear-gradient(135deg, #CD1C18, #FFA896)',
                mb: 2,
                boxShadow: '0 8px 32px rgba(226, 55, 68, 0.3)'
              }}
            >
              <Restaurant sx={{ fontSize: 40, color: 'white' }} />
            </Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 700,
                background: isDarkMode
                  ? 'linear-gradient(135deg, #FFA896, #CD1C18)'
                  : 'linear-gradient(135deg, #CD1C18, #FFA896)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}
            >
              Campus Mart
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'text.secondary'
              }}
            >
              Your campus food & marketplace hub
            </Typography>
          </Box>

          {/* Error Alert */}
          {(error || localError) && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error || localError}
            </Alert>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              name="email"
              type="email"
              label="Email Address"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: '#e23744',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#e23744',
                  },
                },
              }}
            />

            <TextField
              fullWidth
              name="password"
              type={showPassword ? 'text' : 'password'}
              label="Password"
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={togglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: '#e23744',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#e23744',
                  },
                },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #e23744, #ff6b75)',
                boxShadow: '0 4px 20px rgba(226, 55, 68, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #d32f2f, #e23744)',
                  boxShadow: '0 6px 25px rgba(226, 55, 68, 0.4)',
                },
                '&:disabled': {
                  background: '#ccc',
                }
              }}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              New to Campus Mart?
            </Typography>
          </Divider>

          {/* Register Link */}
          <Box textAlign="center">
            <Button
              component={Link}
              to="/register"
              variant="outlined"
              size="large"
              startIcon={<School />}
              sx={{
                borderRadius: 2,
                borderColor: '#e23744',
                color: '#e23744',
                '&:hover': {
                  borderColor: '#d32f2f',
                  backgroundColor: 'rgba(226, 55, 68, 0.04)',
                },
              }}
            >
              Create Account
            </Button>
          </Box>


        </Paper>
      </Container>
    </Box>
  );
};

export default Login;