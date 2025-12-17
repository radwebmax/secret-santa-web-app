# Secret Santa Web Application

A web application for organizing Secret Santa gift exchanges with user registration, wish management, exclusion system, and automated pairing.

## Features

- **Password-Protected Registration**: Only users with the registration password can create accounts
- **User ID System**: Each user receives a unique ID that can be shared for exclusions
- **Wish Management**: Users can create one wish for their Secret Santa
- **Exclusion System**: Users can exclude specific people from being their Secret Santa recipient
- **Admin Control**: Admin can start the Secret Santa selection process
- **Automatic Pairing**: Smart algorithm that respects exclusions and ensures valid pairings
- **Results Display**: Users can see who they're giving a gift to and their wish

## Tech Stack

- **Backend**: Node.js + Express.js
- **Database**: MongoDB
- **Templating**: EJS
- **Styling**: CSS
- **Authentication**: Session-based with bcrypt password hashing

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## Installation

1. Clone or download this repository

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/secret-santa
SESSION_SECRET=your-secret-key-change-this-in-production
REGISTRATION_PASSWORD=secret-santa-2024
ADMIN_USERNAME=admin
```

4. Make sure MongoDB is running:
   - For local MongoDB: Start your MongoDB service
   - For MongoDB Atlas: Update `MONGODB_URI` in `.env` with your connection string

5. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

6. Open your browser and navigate to `http://localhost:3000`

## Usage

### Creating an Admin Account

You have two options to create an admin account:

**Option 1: Automatic (First User)**
1. The first user to register will automatically become the admin
2. Use the registration password (default: `secret-santa-2024`) to create an account
3. After registration, you'll receive a unique User ID

**Option 2: Manual Script**
1. Run the admin creation script:
   ```bash
   npm run create-admin
   ```
2. Enter your desired username and password when prompted
3. The script will create an admin account for you

### First Time Setup

1. Create your admin account using one of the methods above
2. After registration, you'll receive a unique User ID

### User Flow

1. **Register/Login**: Create an account with username, password, and the registration password
2. **View Your ID**: Your unique ID is displayed on the dashboard - share this with others
3. **Create Wish**: Enter your wish in the text field (one wish per user)
4. **Manage Exclusions**: Enter other users' IDs to exclude them from being your recipient
5. **Wait for Selection**: Admin will start the Secret Santa selection
6. **View Results**: After selection, refresh the page to see who you're giving a gift to

### Admin Flow

1. **Access Admin Panel**: Click "Admin Panel" from your dashboard
2. **View All Users**: See all registered users, their wishes, and exclusions
3. **Start Selection**: Click "Start Secret Santa Selection" to run the pairing algorithm
4. **View Pairings**: See all the Secret Santa pairings
5. **Reset Selection**: If needed, reset the selection to start over

## Configuration

Edit the `.env` file to customize:

- `PORT`: Server port (default: 3000)
- `MONGODB_URI`: MongoDB connection string
- `SESSION_SECRET`: Secret key for session encryption (change in production!)
- `REGISTRATION_PASSWORD`: Password required for registration
- `ADMIN_USERNAME`: Reserved admin username (optional)

## Project Structure

```
secret-santa/
├── models/          # MongoDB models (User, Pairing, Selection)
├── routes/          # Express routes (auth, dashboard, admin, api)
├── views/           # EJS templates (login, register, dashboard, admin)
├── public/          # Static files
│   ├── css/        # Stylesheets
│   └── js/         # JavaScript files
├── server.js        # Main server file
├── package.json     # Dependencies
└── README.md        # This file
```

## Security Notes

- Passwords are hashed using bcrypt
- Session-based authentication
- Registration is password-protected
- Change `SESSION_SECRET` and `REGISTRATION_PASSWORD` in production

## Troubleshooting

- **MongoDB Connection Error**: Make sure MongoDB is running and the connection string is correct
- **Port Already in Use**: Change the PORT in `.env` or stop the process using port 3000
- **Selection Fails**: Check if there are enough users and if exclusions allow valid pairings

## License

ISC

