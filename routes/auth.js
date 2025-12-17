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
    console.log('=== REGISTRATION START ===');
    const { username, password, registrationPassword } = req.body;
    console.log('Received registration data:', {
      username: username ? `${username.substring(0, 3)}...` : 'missing',
      passwordLength: password ? password.length : 0,
      registrationPasswordLength: registrationPassword ? registrationPassword.length : 0
    });
    
    // Debug: Check if env variable is loaded
    if (!process.env.REGISTRATION_PASSWORD) {
      console.log('WARNING: REGISTRATION_PASSWORD not found in environment variables');
      console.log('Using default password: secret-santa-2024');
    }
    
    const requiredPassword = (process.env.REGISTRATION_PASSWORD || 'secret-santa-2024').trim();
    const providedPassword = (registrationPassword || '').trim();
    
    // Debug logging
    console.log('Password validation:');
    console.log('  Required password length:', requiredPassword.length);
    console.log('  Provided password length:', providedPassword.length);
    console.log('  Passwords match:', providedPassword === requiredPassword);
    
    // Check registration password (case-sensitive, but trimmed)
    if (providedPassword !== requiredPassword) {
      console.log('❌ Registration failed: Invalid registration password');
      return res.render('register', { error: 'Invalid registration password. Please check your .env file and restart the server.' });
    }
    console.log('✅ Registration password validated');
    
    // Check if username already exists
    console.log('Checking for existing user...');
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.log('❌ Registration failed: Username already exists');
      return res.render('register', { error: 'Username already exists' });
    }
    console.log('✅ Username is available');
    
    // Generate unique user ID
    console.log('Generating unique user ID...');
    const userId = await User.generateUserId();
    console.log('✅ Generated user ID:', userId);
    
    // Check if this is the first user (make them admin)
    console.log('Checking user count for admin status...');
    const userCount = await User.countDocuments();
    const isAdmin = userCount === 0;
    console.log(`  User count: ${userCount}, isAdmin: ${isAdmin}`);
    
    // Create new user
    console.log('Creating user object...');
    const user = new User({
      username,
      password,
      userId,
      isAdmin
    });
    console.log('✅ User object created');
    
    console.log('Saving user to database...');
    await user.save();
    console.log('✅ User saved successfully. User ID:', user._id);
    
    // Auto-login after registration
    console.log('Setting up session...');
    req.session.userId = user._id;
    req.session.username = user.username;
    req.session.isAdmin = user.isAdmin;
    console.log('✅ Session data set:', {
      userId: req.session.userId,
      username: req.session.username,
      isAdmin: req.session.isAdmin,
      sessionId: req.sessionID
    });
    
    // Save session explicitly
    req.session.save((err) => {
      if (err) {
        console.error('❌ Session save error:', err);
        return res.render('register', { error: 'Failed to create session. Please try again.' });
      }
      console.log('✅ Session saved successfully');
      console.log('Redirecting to dashboard...');
      res.redirect('/dashboard');
      console.log('=== REGISTRATION SUCCESS ===');
    });
  } catch (error) {
    console.error('❌ REGISTRATION ERROR:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.render('register', { error: `An error occurred: ${error.message}` });
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

module.exports = router;

