require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/secret-santa', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Connected to MongoDB\n');
    
    // Get input from user
    rl.question('Enter username: ', async (username) => {
      rl.question('Enter password: ', async (password) => {
        try {
          // Check if username already exists
          const existingUser = await User.findOne({ username });
          if (existingUser) {
            if (existingUser.isAdmin) {
              console.log('\n❌ User already exists and is already an admin!');
            } else {
              // Make existing user admin
              existingUser.isAdmin = true;
              await existingUser.save();
              console.log('\n✅ Existing user is now an admin!');
            }
            rl.close();
            await mongoose.connection.close();
            process.exit(0);
          }
          
          // Generate unique user ID
          const userId = await User.generateUserId();
          
          // Create admin user
          const admin = new User({
            username,
            password,
            userId,
            isAdmin: true
          });
          
          await admin.save();
          
          console.log('\n✅ Admin account created successfully!');
          console.log(`Username: ${username}`);
          console.log(`User ID: ${userId}`);
          console.log('\nYou can now login at http://localhost:3000/login');
          
        } catch (error) {
          console.error('\n❌ Error creating admin:', error.message);
        } finally {
          rl.close();
          await mongoose.connection.close();
          process.exit(0);
        }
      });
    });
    
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    rl.close();
    process.exit(1);
  }
}

createAdmin();

