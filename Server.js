// const express = require('express');
// const app = express();
// require('dotenv').config();
// const mc = require('mongodb').MongoClient; 
// const path = require('path');
// const cors = require('cors');
// const jwt = require('jsonwebtoken'); 

// // Enable CORS before defining routes
// app.use(cors({
//     origin: 'http://localhost:3000', 
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
//     allowedHeaders: ['Content-Type', 'Authorization'],
//     credentials: true,  
// }));
// app.options('*', cors()); 

// // Middleware to parse JSON bodies
// app.use(express.json());

// // API Routes
// const userApp = require('./Api/user-api');
// const authorApp = require('./Api/author-api');
// const adminApp = require('./Api/admin-api');


// app.use('/user-api', userApp);
// app.use('/author-api', authorApp);
// app.use('/admin-api', adminApp);


// // Serve static files from React build folder
// app.use(express.static(path.join(__dirname, '../client/build')));
// // MongoDB connection
// mc.connect(process.env.DB_URL)
//   .then(client => {
//     const blogdb = client.db('blogdb');
//     const userscollection = blogdb.collection("userscollection");
//     const Articlescollection = blogdb.collection('Articlescollection');
//     const Authorscollection = blogdb.collection("Authorscollection");

//     app.set('userscollection', userscollection);
//     app.set('Articlescollection', Articlescollection);
//     app.set('Authorscollection', Authorscollection);

//     console.log("DB Connected successfully");
//   })
//   .catch(err => {
//     console.error("Database connection failed:", err);
//     process.exit(1); // Exit process if the database connection fails
//   });

// // React Router fallback for SPA
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '../client/build/index.html'));
// });

// // Error Handling Middleware
// app.use((err, req, res, next) => {
//   console.error("Error occurred:", err);
//   res.status(500).json({ message: "An error occurred", error: err.message });
// });

// // Start Server
// const PORT = process.env.PORT || 4000; // Default to port 4000
// app.listen(PORT, () => {
//   console.log(`Web server running on port ${PORT}`);
// });




const express = require('express');
const app = express();
require('dotenv').config();
const mc = require('mongodb').MongoClient;
const path = require('path');
const cors = require('cors');
const jwt = require('jsonwebtoken');



// Enable CORS before defining routes
app.use(cors({
    origin: ["http://localhost:3000",,'https://blog-app-adityapallikonda.netlify.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,  
}));
app.options('*', cors()); 

// Middleware to parse JSON bodies
app.use(express.json());

// API Routes
const userApp = require('./Api/user-api');
const authorApp = require('./Api/author-api');
const adminApp = require('./Api/admin-api');

app.use('/user-api', userApp);
app.use('/author-api', authorApp);
app.use('/admin-api', adminApp);

// // Serve static files from React build folder
// app.use(express.static(path.join(__dirname, '/client/build')));
app.use(express.static(path.join(__dirname, 'build')));




// MongoDB connection
async function connectDB() {
  try {
    const client = await mc.connect(process.env.DB_URL);
    const Blogdb = client.db('BlogDb');

    app.set('userscollection', Blogdb.collection("userscollection"));
    app.set('Articlescollection', Blogdb.collection("Articlescollection"));
    app.set('Authorscollection', Blogdb.collection("Authorscollection"));

    console.log("DB Connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1); // Exit process if the database connection fails
  }
}
connectDB();

// React Router fallback for SPA
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '/client/build/index.html'));
// });
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});


// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Error occurred:", err);
  res.status(500).json({ message: "An error occurred", error: err.message });
});

// Start Server
const PORT = process.env.PORT || 4000; 
app.listen(PORT, () => {
  console.log(`Web server running on port ${PORT}`);
  console.log("MongoDB URL:", process.env.DB_URL);

});