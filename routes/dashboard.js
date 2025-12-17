const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Selection = require('../models/Selection');

// Middleware to check if user is logged in
const requireAuth = (req, res, next) => {
  console.log('🔐 Auth check - Session data:', {
    userId: req.session.userId,
    username: req.session.username,
    isAdmin: req.session.isAdmin,
    sessionId: req.sessionID
  });
  if (!req.session.userId) {
    console.log('❌ Auth failed: No userId in session, redirecting to login');
    return res.redirect('/login');
  }
  console.log('✅ Auth passed');
  next();
};

// Dashboard page
router.get('/', requireAuth, async (req, res) => {
  try {
    console.log('📊 Loading dashboard for user:', req.session.userId);
    const user = await User.findById(req.session.userId);
    if (!user) {
      console.log('❌ User not found in database:', req.session.userId);
      req.session.destroy();
      return res.redirect('/login');
    }
    console.log('✅ User found:', user.username);
    
    const selection = await Selection.findOne();
    const isSelectionActive = selection && selection.isActive;
    
    let assignedUser = null;
    if (isSelectionActive && user.assignedTo) {
      assignedUser = await User.findById(user.assignedTo);
    }
    
    res.render('dashboard', {
      user,
      isSelectionActive,
      assignedUser,
      error: null,
      success: null
    });
  } catch (error) {
    console.error('❌ Dashboard error:', error);
    res.render('dashboard', {
      user: null,
      isSelectionActive: false,
      assignedUser: null,
      error: 'An error occurred',
      success: null
    });
  }
});

// Update wish
router.post('/wish', requireAuth, async (req, res) => {
  try {
    const { wish } = req.body;
    const user = await User.findById(req.session.userId);
    
    const selection = await Selection.findOne();
    // Allow wish updates if selection is not active, OR if user doesn't have an assignment yet
    if (selection && selection.isActive && user.assignedTo) {
      return res.json({ success: false, message: 'Selection has already started. Cannot modify wish.' });
    }
    
    user.wish = wish || '';
    await user.save();
    
    res.json({ success: true, message: 'Wish updated successfully' });
  } catch (error) {
    res.json({ success: false, message: 'An error occurred' });
  }
});

// Add exclusion
router.post('/exclude', requireAuth, async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(req.session.userId);
    
    const selection = await Selection.findOne();
    // Allow exclusion updates if selection is not active, OR if user doesn't have an assignment yet
    if (selection && selection.isActive && user.assignedTo) {
      return res.json({ success: false, message: 'Selection has already started. Cannot modify exclusions.' });
    }
    
    // Find user by userId
    const excludedUser = await User.findOne({ userId });
    if (!excludedUser) {
      return res.json({ success: false, message: 'User ID not found' });
    }
    
    if (excludedUser._id.toString() === user._id.toString()) {
      return res.json({ success: false, message: 'Cannot exclude yourself' });
    }
    
    // Check if already excluded
    if (user.excludedUsers.includes(excludedUser.userId)) {
      return res.json({ success: false, message: 'User already excluded' });
    }
    
    user.excludedUsers.push(excludedUser.userId);
    await user.save();
    
    res.json({ success: true, message: 'User excluded successfully' });
  } catch (error) {
    res.json({ success: false, message: 'An error occurred' });
  }
});

// Remove exclusion
router.post('/remove-exclusion', requireAuth, async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(req.session.userId);
    
    const selection = await Selection.findOne();
    // Allow exclusion removal if selection is not active, OR if user doesn't have an assignment yet
    if (selection && selection.isActive && user.assignedTo) {
      return res.json({ success: false, message: 'Selection has already started. Cannot modify exclusions.' });
    }
    
    user.excludedUsers = user.excludedUsers.filter(id => id !== userId);
    await user.save();
    
    res.json({ success: true, message: 'Exclusion removed successfully' });
  } catch (error) {
    res.json({ success: false, message: 'An error occurred' });
  }
});

// Test route to verify router is working
router.get('/test-route', (req, res) => {
  res.json({ success: true, message: 'Dashboard router is working!' });
});

// Update username
router.post('/username', (req, res, next) => {
  console.log('📝 Username route middleware hit!');
  console.log('Request method:', req.method);
  console.log('Request path:', req.path);
  console.log('Request url:', req.url);
  next();
}, requireAuth, async (req, res) => {
  console.log('📝 Username route handler hit!');
  try {
    console.log('📝 Username update request received');
    const { username } = req.body;
    
    if (!username) {
      return res.json({ success: false, message: 'Username is required' });
    }
    
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }
    
    // Validate username
    const trimmedUsername = username.trim();
    if (trimmedUsername.length < 3) {
      return res.json({ success: false, message: 'Username must be at least 3 characters long' });
    }
    
    if (trimmedUsername.length > 30) {
      return res.json({ success: false, message: 'Username must be no more than 30 characters long' });
    }
    
    const selection = await Selection.findOne();
    // Only allow username change if selection is not active, OR if user doesn't have an assignment yet
    if (selection && selection.isActive && user.assignedTo) {
      return res.json({ success: false, message: 'Selection has already started. Cannot modify username.' });
    }
    
    // Check if username already exists
    const existingUser = await User.findOne({ username: trimmedUsername });
    if (existingUser && existingUser._id.toString() !== user._id.toString()) {
      return res.json({ success: false, message: 'Username already taken' });
    }
    
    // Update username
    user.username = trimmedUsername;
    await user.save();
    console.log('✅ Username updated:', trimmedUsername);
    
    // Update session
    req.session.username = user.username;
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
      }
    });
    
    res.json({ success: true, message: 'Username updated successfully' });
  } catch (error) {
    console.error('❌ Update username error:', error);
    res.json({ success: false, message: `An error occurred: ${error.message}` });
  }
});

// Log that username route is registered
console.log('✅ Dashboard routes loaded, including /username route');

module.exports = router;

