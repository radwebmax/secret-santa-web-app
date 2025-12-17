# Quick Setup Guide

## Step 1: Install Dependencies
```bash
npm install
```

## Step 2: Set Up Environment Variables
Create a `.env` file in the root directory with:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/secret-santa
SESSION_SECRET=change-this-to-a-random-string
REGISTRATION_PASSWORD=secret-santa-2024
```

## Step 3: Start MongoDB
Make sure MongoDB is running on your system.

## Step 4: Start the Server
```bash
npm start
```

## Step 5: Access the Application
Open your browser and go to: `http://localhost:3000`

## First User = Admin
The first user to register will automatically become the admin and can start the Secret Santa selection.

