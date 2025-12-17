const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Middleware to check if user is logged in
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  next();
};

// Login page
router.get('/login', (req, res) => {
  if (req.session.userId) {
    return res.redirect('/dashboard');
  }
  res.render('login', { error: null });
});

// Login handler
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    
    if (!user) {
      return res.render('login', { error: 'Invalid username or password' });
    }
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.render('login', { error: 'Invalid username or password' });
    }
    
    req.session.userId = user._id;
    req.session.username = user.username;
    req.session.isAdmin = user.isAdmin;
    
    res.redirect('/dashboard');
  } catch (error) {
    res.render('login', { error: 'An error occurred. Please try again.' });
  }
});

// Register page
router.get('/register', (req, res) => {
  if (req.session.userId) {
    return res.redirect('/dashboard');
  }
  res.render('register', { error: null });
});

// Register handler
router.post('/register', async (req, res) => {
  try {
    const { username, password, registrationPassword } = req.body;
    
    // Debug: Check if env variable is loaded
    if (!process.env.REGISTRATION_PASSWORD) {
      console.log('WARNING: REGISTRATION_PASSWORD not found in environment variables');
      console.log('Using default password: secret-santa-2024');
    }
    
    const requiredPassword = (process.env.REGISTRATION_PASSWORD || 'secret-santa-2024').trim();
    const providedPassword = (registrationPassword || '').trim();
    
    // Debug logging (remove in production)
    console.log('Registration attempt:');
    console.log('Required password length:', requiredPassword.length);
    console.log('Provided password length:', providedPassword.length);
    console.log('Passwords match:', providedPassword === requiredPassword);
    
    // Check registration password (case-sensitive, but trimmed)
    if (providedPassword !== requiredPassword) {
      return res.render('register', { error: 'Invalid registration password. Please check your .env file and restart the server.' });
    }
    
    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.render('register', { error: 'Username already exists' });
    }
    
    // Generate unique user ID
    const userId = await User.generateUserId();
    
    // Check if this is the first user (make them admin)
    const userCount = await User.countDocuments();
    const isAdmin = userCount === 0;
    
    // Create new user
    const user = new User({
      username,
      password,
      userId,
      isAdmin
    });
    
    await user.save();
    
    // Auto-login after registration
    req.session.userId = user._id;
    req.session.username = user.username;
    req.session.isAdmin = user.isAdmin;
    
    res.redirect('/dashboard');
  } catch (error) {
    res.render('register', { error: 'An error occurred. Please try again.' });
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

module.exports = router;

