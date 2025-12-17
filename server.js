require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');

const app = express();

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// MongoDB connection and session store setup
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/secret-santa';
console.log('Attempting MongoDB connection...');
console.log('MongoDB URI present:', !!process.env.MONGODB_URI);

// Create session store (will connect when MongoDB is ready)
const sessionStore = MongoStore.create({
  mongoUrl: mongoUri,
  collectionName: 'sessions'
});

// Session configuration with MongoDB store
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret-santa-secret-key',
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: { 
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax' // Helps with cross-site requests
  }
}));

// Log session configuration on startup
console.log('Session configuration:', {
  store: 'MongoDB (connect-mongo)',
  secure: process.env.NODE_ENV === 'production',
  httpOnly: true,
  sameSite: 'lax',
  nodeEnv: process.env.NODE_ENV
});

// Connect to MongoDB
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  console.log('MongoDB connection state:', mongoose.connection.readyState);
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  console.error('Error details:', {
    name: err.name,
    message: err.message
  });
});

// Import routes
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const adminRoutes = require('./routes/admin');
const apiRoutes = require('./routes/api');

// Routes
app.use('/', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/admin', adminRoutes);
app.use('/api', apiRoutes);

// Home page redirect
app.get('/', (req, res) => {
  if (req.session.userId) {
    res.redirect('/dashboard');
  } else {
    res.redirect('/login');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

