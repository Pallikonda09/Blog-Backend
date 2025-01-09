const express = require('express');
const app = express();
require('dotenv').config(); // Load environment variables
const mc = require('mongodb').MongoClient; // Use destructuring for cleaner imports
const path = require('path');
const cors = require('cors');
const jwt = require('jsonwebtoken'); // Import JWT

// Enable CORS before defining routes
app.use(cors({
    origin: 'http://localhost:3000', // Allow requests from the React frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Include all necessary HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Include Authorization header for JWT
}));
app.options('*', cors()); // Handle preflight requests for all routes

// Middleware to parse JSON bodies
app.use(express.json());

// API Routes
const userApp = require('./Api/user-api');
const authorApp = require('./Api/author-api');
const adminApp = require('./Api/admin-api');

app.use('/user-api', userApp);
app.use('/author-api', authorApp);
app.use('/admin-api', adminApp);

// Serve static files from React build folder
app.use(express.static(path.join(__dirname, '../client/build')));
// MongoDB connection
mc.connect(process.env.DB_URL)
  .then(client => {
    const blogdb = client.db('blogdb');
    const userscollection = blogdb.collection("userscollection");
    const Articlescollection = blogdb.collection('Articlescollection');
    const Authorscollection = blogdb.collection("Authorscollection");

    app.set('userscollection', userscollection);
    app.set('Articlescollection', Articlescollection);
    app.set('Authorscollection', Authorscollection);

    console.log("DB Connected successfully");
  })
  .catch(err => {
    console.error("Database connection failed:", err);
    process.exit(1); // Exit process if the database connection fails
  });

// React Router fallback for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Error occurred:", err);
  res.status(500).json({ message: "An error occurred", error: err.message });
});

// Start Server
const PORT = process.env.PORT || 4000; // Default to port 4000
app.listen(PORT, () => {
  console.log(`Web server running on port ${PORT}`);
});
