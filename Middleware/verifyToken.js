// const jwt = require('jsonwebtoken');

// const verifyToken = (req, res, next) => {
//   const token = req.header('Authorization')?.split(' ')[1];  // Extract token from 'Bearer <token>'

//   if (!token) {
//     return res.status(401).send({ message: 'No token provided' });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.KEY);
//     req.user = decoded;  // Attach the decoded user info to the request object
//     next();  // Proceed to the next middleware/handler
//   } catch (error) {
//     console.error('Token verification failed:', error);
//     return res.status(401).send({ message: 'Invalid or expired token' });
//   }
// };

// module.exports = verifyToken;

const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  console.log("Request Headers:", req.headers); // 🔥 Debugging

  const token = req.header("Authorization")?.split(" ")[1]; // Extract token
  console.log("Extracted Token:", token); // 🔥 Debugging

  if (!token) {
    return res.status(401).send({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.KEY);
    console.log("Decoded Token:", decoded); // 🔥 Debugging
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    return res.status(401).send({ message: "Invalid or expired token" });
  }
};

module.exports = verifyToken;




