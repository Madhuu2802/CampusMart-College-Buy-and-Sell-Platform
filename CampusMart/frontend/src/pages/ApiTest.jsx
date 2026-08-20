import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Button, Alert, Card, CardContent } from '@mui/material';
import axios from 'axios';

const ApiTest = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testEndpoint = async (name, url) => {
    try {
      setLoading(true);
      const response = await axios.get(url);
      setResults(prev => ({
        ...prev,
        [name]: {
          status: 'success',
          data: response.data,
          url: url
        }
      }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [name]: {
          status: 'error',
          error: error.message,
          url: url
        }
      }));
    } finally {
      setLoading(false);
    }
  };

  const runAllTests = async () => {
    setResults({});
    
    // Test different API configurations
    const hostname = window.location.hostname;
    const networkUrl = `http://${hostname}:3001/api`;
    const localUrl = 'http://localhost:3001/api';
    
    console.log('Current hostname:', hostname);
    console.log('Network URL:', networkUrl);
    console.log('Axios base URL:', axios.defaults.baseURL);
    
    await testEndpoint('vendors_network', `${networkUrl}/vendors`);
    await testEndpoint('vendors_local', `${localUrl}/vendors`);
    await testEndpoint('products_network', `${networkUrl}/products/featured`);
    await testEndpoint('marketplace_network', `${networkUrl}/marketplace/recent`);
  };

  useEffect(() => {
    runAllTests();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        API Connectivity Test
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="body1">
          <strong>Current Hostname:</strong> {window.location.hostname}
        </Typography>
        <Typography variant="body1">
          <strong>Axios Base URL:</strong> {axios.defaults.baseURL}
        </Typography>
      </Box>
      
      <Button 
        variant="contained" 
        onClick={runAllTests} 
        disabled={loading}
        sx={{ mb: 3 }}
      >
        {loading ? 'Testing...' : 'Run Tests'}
      </Button>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {Object.entries(results).map(([name, result]) => (
          <Card key={name}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {name.replace('_', ' ').toUpperCase()}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                URL: {result.url}
              </Typography>
              {result.status === 'success' ? (
                <Alert severity="success">
                  ✅ Success - Returned {Array.isArray(result.data.vendors) ? result.data.vendors.length : 
                    Array.isArray(result.data.products) ? result.data.products.length :
                    Array.isArray(result.data.items) ? result.data.items.length : 'data'} items
                </Alert>
              ) : (
                <Alert severity="error">
                  ❌ Error: {result.error}
                </Alert>
              )}
            </CardContent>
          </Card>
        ))}
      </Box>
    </Container>
  );
};

export default ApiTest;