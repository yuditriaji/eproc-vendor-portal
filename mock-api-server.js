const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3001'],
  credentials: true
}));
app.use(express.json());

// Mock data
const users = [
  {
    id: '1',
    email: 'vendor@eproc.local',
    username: 'vendor',
    firstName: 'Test',
    lastName: 'Vendor',
    role: 'VENDOR',
    verified: true,
    createdAt: '2024-01-01T00:00:00.000Z'
  }
];

const tokens = new Map();

// Mock login endpoint
app.post('/api/v1/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  console.log('Login attempt:', { email, password });
  
  // Simple mock authentication
  if (email === 'vendor@eproc.local' && password === 'vendor123') {
    const user = users.find(u => u.email === email);
    const token = `mock-jwt-token-${Date.now()}`;
    
    tokens.set(token, user);
    
    res.json({
      accessToken: token,
      user: user
    });
  } else {
    res.status(401).json({
      message: 'Invalid credentials',
      error: 'Unauthorized'
    });
  }
});

// Mock register endpoint
app.post('/api/v1/auth/register', (req, res) => {
  const { email, password, username, firstName, lastName } = req.body;
  
  console.log('Register attempt:', { email, username, firstName, lastName });
  
  // Check if user already exists
  if (users.find(u => u.email === email || u.username === username)) {
    return res.status(400).json({
      message: 'User already exists',
      error: 'Bad Request'
    });
  }
  
  const newUser = {
    id: String(users.length + 1),
    email,
    username,
    firstName,
    lastName,
    role: 'VENDOR',
    verified: false,
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  const token = `mock-jwt-token-${Date.now()}`;
  tokens.set(token, newUser);
  
  res.status(201).json({
    accessToken: token,
    user: newUser
  });
});

// Mock me endpoint
app.get('/api/v1/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'No token provided',
      error: 'Unauthorized'
    });
  }
  
  const token = authHeader.substring(7);
  const user = tokens.get(token);
  
  if (!user) {
    return res.status(401).json({
      message: 'Invalid token',
      error: 'Unauthorized'
    });
  }
  
  res.json(user);
});

// Mock tenders endpoint
app.get('/api/v1/tenders', (req, res) => {
  const mockTenders = [
    {
      id: '1',
      title: 'IT Equipment Procurement',
      description: 'Procurement of laptops and desktop computers for office use',
      estimatedValue: 150000,
      closingDate: '2024-12-31T23:59:59.000Z',
      category: 'IT',
      department: 'Technology',
      status: 'OPEN',
      createdAt: '2024-01-01T00:00:00.000Z',
      creator: {
        username: 'procurement_officer',
        role: 'PROCUREMENT_OFFICER'
      }
    },
    {
      id: '2',
      title: 'Office Supplies Annual Contract',
      description: 'Annual contract for office supplies including stationery, paper, and consumables',
      estimatedValue: 75000,
      closingDate: '2024-11-30T23:59:59.000Z',
      category: 'Supplies',
      department: 'Administration',
      status: 'OPEN',
      createdAt: '2024-01-15T00:00:00.000Z',
      creator: {
        username: 'admin_officer',
        role: 'PROCUREMENT_OFFICER'
      }
    }
  ];
  
  res.json(mockTenders);
});

// Mock tender by ID endpoint
app.get('/api/v1/tenders/:id', (req, res) => {
  const { id } = req.params;
  
  const mockTender = {
    id,
    title: 'IT Equipment Procurement',
    description: 'Procurement of laptops and desktop computers for office use',
    requirements: {
      technical: ['Must meet specifications', 'Warranty required'],
      commercial: ['Valid business license', 'Financial capability']
    },
    criteria: {
      price: 60,
      quality: 25,
      delivery: 15
    },
    estimatedValue: 150000,
    closingDate: '2024-12-31T23:59:59.000Z',
    category: 'IT',
    department: 'Technology',
    status: 'OPEN',
    createdAt: '2024-01-01T00:00:00.000Z',
    creator: {
      username: 'procurement_officer',
      role: 'PROCUREMENT_OFFICER'
    },
    bids: []
  };
  
  res.json(mockTender);
});

// Mock logout endpoint
app.post('/api/v1/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    tokens.delete(token);
  }
  
  res.json({ message: 'Logged out successfully' });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Mock API server is running' });
});

// Catch-all for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    message: `Cannot ${req.method} ${req.originalUrl}`,
    error: 'Not Found',
    statusCode: 404
  });
});

app.listen(port, () => {
  console.log(`Mock API server running at http://localhost:${port}`);
  console.log('Available endpoints:');
  console.log('- POST /api/v1/auth/login');
  console.log('- POST /api/v1/auth/register');
  console.log('- GET  /api/v1/auth/me');
  console.log('- POST /api/v1/auth/logout');
  console.log('- GET  /api/v1/tenders');
  console.log('- GET  /api/v1/tenders/:id');
  console.log('- GET  /health');
});