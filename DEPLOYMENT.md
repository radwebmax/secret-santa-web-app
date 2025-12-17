# Deployment Guide

This guide will help you deploy your Secret Santa app to **Render** (recommended) or **Netlify**.

## 🚀 Render Deployment (Recommended)

Render is perfect for Node.js apps with databases. It offers free tier hosting with automatic deployments from GitHub.

### Prerequisites

1. **GitHub Account**: Your code should be in a GitHub repository
2. **MongoDB Atlas Account**: Free MongoDB database (or use Render's MongoDB)

### Step 1: Set Up MongoDB Atlas (Free)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new cluster (free tier M0)
4. Create a database user (Database Access → Add New User)
5. Whitelist IP addresses (Network Access → Add IP Address → Allow Access from Anywhere: `0.0.0.0/0`)
6. Get your connection string:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (replace `<password>` with your database user password)

### Step 2: Deploy to Render

#### Option A: Using render.yaml (Automatic Setup)

1. **Push your code to GitHub** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Sign up/Login to Render**:
   - Go to [render.com](https://render.com)
   - Sign up with your GitHub account

3. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Render will detect the `render.yaml` file automatically
   - Click "Apply"

4. **Configure Environment Variables**:
   - In the Render dashboard, go to your service → Environment
   - Add the following environment variables:
     ```
     NODE_ENV=production
     PORT=10000
     MONGODB_URI=<your-mongodb-atlas-connection-string>
     SESSION_SECRET=<generate-a-random-secret-key>
     REGISTRATION_PASSWORD=<your-registration-password>
     ADMIN_USERNAME=<optional-admin-username>
     ```
   - **SESSION_SECRET**: Generate a random string (you can use: `openssl rand -base64 32`)
   - **MONGODB_URI**: Your MongoDB Atlas connection string from Step 1

5. **Deploy**:
   - Click "Save Changes"
   - Render will automatically build and deploy your app
   - Wait for deployment to complete (usually 2-5 minutes)

#### Option B: Manual Setup (Without render.yaml)

1. **Sign up/Login to Render** with GitHub

2. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Render will auto-detect Node.js

3. **Configure Settings**:
   - **Name**: secret-santa (or your preferred name)
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

4. **Add Environment Variables** (same as Option A, Step 4)

5. **Deploy**: Click "Create Web Service"

### Step 3: Access Your App

- Your app will be available at: `https://your-app-name.onrender.com`
- The first deployment may take a few minutes
- Subsequent deployments happen automatically when you push to GitHub

### Step 4: Create Admin Account

After deployment, you can create an admin account:

1. Visit your deployed app
2. Register the first user (they'll automatically become admin)
3. Or use the admin creation script locally and connect to the same MongoDB database

---

## 🌐 Netlify Deployment (Alternative)

**Note**: Netlify is primarily for static sites. For a full Express app, you'll need to use Netlify Functions or consider Render instead.

### If you still want to use Netlify:

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Create netlify.toml** (already created for you)

3. **Deploy**:
   ```bash
   netlify login
   netlify init
   netlify deploy --prod
   ```

However, **Render is strongly recommended** for this type of application.

---

## 🔧 Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `10000` (Render) or `3000` (local) |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/secret-santa` |
| `SESSION_SECRET` | Secret for session encryption | Random string (32+ characters) |
| `REGISTRATION_PASSWORD` | Password required for registration | `your-secret-password` |
| `ADMIN_USERNAME` | Reserved admin username (optional) | `admin` |

---

## 📝 Post-Deployment Checklist

- [ ] App is accessible at the provided URL
- [ ] MongoDB connection is working
- [ ] Can register a new user
- [ ] Can login
- [ ] Admin panel is accessible
- [ ] Session cookies are working (try logging in)
- [ ] Environment variables are set correctly

---

## 🔄 Automatic Deployments

Both Render and Netlify support automatic deployments:
- **Render**: Automatically deploys when you push to your main branch
- **Netlify**: Automatically deploys when you push to your main branch

---

## 🐛 Troubleshooting

### App won't start
- Check build logs in Render dashboard
- Verify all environment variables are set
- Ensure MongoDB connection string is correct

### Database connection errors
- Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Check database user credentials
- Ensure connection string format is correct

### Session not working
- Verify `SESSION_SECRET` is set
- Check that cookies are enabled in browser
- In production, ensure `secure: true` is set (already configured)

### Build fails
- Check Node.js version compatibility
- Verify all dependencies in `package.json`
- Check build logs for specific errors

---

## 💡 Tips

1. **Free Tier Limits**:
   - Render free tier: App spins down after 15 minutes of inactivity
   - First request after spin-down may take 30-60 seconds
   - Consider upgrading for production use

2. **MongoDB Atlas Free Tier**:
   - 512MB storage
   - Shared cluster (may have performance limits)
   - Perfect for small to medium apps

3. **Security**:
   - Never commit `.env` file (already in `.gitignore`)
   - Use strong `SESSION_SECRET` in production
   - Change `REGISTRATION_PASSWORD` from default

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [MongoDB Atlas Setup](https://docs.atlas.mongodb.com/getting-started/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

