const exp = require("express");
const userApp = exp.Router();
const bcryptjs = require("bcryptjs");
const expressAsyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const verifyToken = require("../Middleware/verifyToken"); // Ensure this exists
require("dotenv").config();

let usercollection;
let Articlescollection;

// Middleware to get collections
userApp.use((req, res, next) => {
  usercollection = req.app.get("userscollection");
  Articlescollection = req.app.get("Articlescollection"); // ✅ Fixed key
  next();
});

// User Registration
userApp.post("/user", expressAsyncHandler(async (req, res) => {
  const newUser = req.body;
  const dbuser = await usercollection.findOne({ username: newUser.username });

  if (dbuser) {
    res.send({ message: "User existed" });
  } else {
    newUser.password = await bcryptjs.hash(newUser.password, 6);
    await usercollection.insertOne(newUser);
    res.send({ message: "User created" });
  }
}));

// User Login
userApp.post("/login", expressAsyncHandler(async (req, res) => {
  const userCred = req.body;
  const dbuser = await usercollection.findOne({ username: userCred.username });

  if (!dbuser) {
    return res.send({ message: "Invalid username" });
  }

  const status = await bcryptjs.compare(userCred.password, dbuser.password);
  if (!status) {
    return res.send({ message: "Invalid password" });
  }

  const signedToken = jwt.sign({ username: dbuser.username }, process.env.KEY, { expiresIn: '1d' });

  res.send({ message: "Login success", token: signedToken, user: dbuser });
}));

// Get Articles (Protected Route)
userApp.get("/articles", verifyToken, expressAsyncHandler(async (req, res) => {
  const Articlescollection = req.app.get("Articlescollection");
  const articlesList = await Articlescollection.find({ status: true }).toArray();
  res.send({ message: "articles", payload: articlesList });
}));

   

userApp.post(
  "/articles/:articleId/comment", 
  verifyToken,
  expressAsyncHandler(async (req, res) => {
    // Get user comment content from request body
    const { content } = req.body;
    
    // Get article ID from URL and convert to number
    const articleIdFromUrl = (+req.params.articleId);
    
    // Create comment object with user info from token
    const userComment = {
      commentId: new Date().getTime(), // Generate unique ID
      username: req.user.username,
      userId: req.user.id,
      content: content,
      createdAt: new Date().toISOString()
    };
    
    // Insert userComment object to comments array of article by id
    let result = await Articlescollection.updateOne(
      { articleId: articleIdFromUrl },
      { $addToSet: { comments: userComment } }
    );
    
    console.log(result);
    
    // Return the created comment so frontend can add it without refetching
    res.status(200).send({ 
      message: "Comment posted",
      comment: userComment
    });
  })
);


module.exports = userApp;
