import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import { useTheme } from '../contexts/ThemeContext';

const Orders = () => {
  const { isDarkMode } = useTheme();

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
              radial-gradient(circle at 15% 85%, rgba(255, 255, 255, 0.11) 0%, transparent 50%),
              radial-gradient(circle at 85% 15%, rgba(255, 255, 255, 0.09) 0%, transparent 50%),
              radial-gradient(circle at 60% 60%, rgba(255, 255, 255, 0.07) 0%, transparent 50%)
            `,
            animation: 'ordersFloat 24s ease-in-out infinite'
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            right: '-50%',
            width: '200%',
            height: '200%',
            background: `
              radial-gradient(circle at 25% 75%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 75% 25%, rgba(255, 255, 255, 0.08) 0%, transparent 50%)
            `,
            animation: 'ordersFloat 30s ease-in-out infinite reverse'
          },
          '@keyframes ordersFloat': {
            '0%, 100%': {
              transform: 'translate(0px, 0px) rotate(0deg)'
            },
            '20%': {
              transform: 'translate(35px, -15px) rotate(72deg)'
            },
            '40%': {
              transform: 'translate(10px, -40px) rotate(144deg)'
            },
            '60%': {
              transform: 'translate(-25px, -20px) rotate(216deg)'
            },
            '80%': {
              transform: 'translate(-35px, 25px) rotate(288deg)'
            }
          }
        }}
      />
      
      {/* Floating Geometric Shapes - Stars, Pentagons, Octagons */}
      {[...Array(8)].map((_, index) => {
        const shapeType = index % 4; // 0: star, 1: pentagon, 2: octagon, 3: cross
        return (
          <Box
            key={index}
            sx={{
              position: 'absolute',
              width: { xs: '45px', md: '65px' },
              height: { xs: '45px', md: '65px' },
              background: `rgba(255, 255, 255, ${0.05 + (index * 0.012)})`,
              backdropFilter: 'blur(6px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              top: `${12 + (index * 11)}%`,
              left: `${4 + (index * 12)}%`,
              animation: `ordersShape${index} ${18 + index * 2.2}s ease-in-out infinite`,
              zIndex: 1,
              // Star shape
              ...(shapeType === 0 && {
                clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
              }),
              // Pentagon shape
              ...(shapeType === 1 && {
                clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
              }),
              // Octagon shape
              ...(shapeType === 2 && {
                clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
              }),
              // Cross shape
              ...(shapeType === 3 && {
                clipPath: 'polygon(40% 0%, 60% 0%, 60% 40%, 100% 40%, 100% 60%, 60% 60%, 60% 100%, 40% 100%, 40% 60%, 0% 60%, 0% 40%, 40% 40%)',
              }),
              '@keyframes ordersShape0': {
                '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
                '50%': { transform: 'translateY(-22px) rotate(144deg)' }
              },
              '@keyframes ordersShape1': {
                '0%, 100%': { transform: 'translateX(0px) rotate(0deg)' },
                '50%': { transform: 'translateX(28px) rotate(-144deg)' }
              },
              '@keyframes ordersShape2': {
                '0%, 100%': { transform: 'translate(0px, 0px) rotate(0deg)' },
                '50%': { transform: 'translate(-20px, 20px) rotate(216deg)' }
              },
              '@keyframes ordersShape3': {
                '0%, 100%': { transform: 'translateY(0px) scale(1)' },
                '50%': { transform: 'translateY(25px) scale(1.2)' }
              },
              '@keyframes ordersShape4': {
                '0%, 100%': { transform: 'translate(0px, 0px) rotate(0deg)' },
                '50%': { transform: 'translate(15px, -25px) rotate(-72deg)' }
              },
              '@keyframes ordersShape5': {
                '0%, 100%': { transform: 'translateX(0px) rotate(0deg)' },
                '50%': { transform: 'translateX(-30px) rotate(288deg)' }
              },
              '@keyframes ordersShape6': {
                '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
                '50%': { transform: 'translate(20px, 18px) scale(0.85)' }
              },
              '@keyframes ordersShape7': {
                '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
                '50%': { transform: 'translateY(-32px) rotate(360deg)' }
              }
            }}
          />
        );
      })}
      
      <Container maxWidth="lg" sx={{ py: 4, position: 'relative', zIndex: 10 }}>
        <Box textAlign="center">
          <Typography variant="h4" gutterBottom sx={{ color: 'white', fontWeight: 700 }}>
            My Orders
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
            Track your current and past orders.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Orders;