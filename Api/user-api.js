

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
    // Send 400 status and specific error message if the username exists
    return res.status(400).send({ message: "Username already exists. Please choose another." });
  } else {
    newUser.password = await bcryptjs.hash(newUser.password, 6);
    await usercollection.insertOne(newUser);
    // Send success message upon successful registration
    return res.send({ message: "User Registration Success" });
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

  const signedToken = jwt.sign({ username: dbuser.username, id: dbuser._id }, process.env.KEY, { expiresIn: '1d' });

  res.send({ message: "Login success", token: signedToken, user: dbuser });
}));

// // User Registration
// userApp.post("/user", expressAsyncHandler(async (req, res) => {
//   const newUser = req.body;
//   const dbuser = await usercollection.findOne({ username: newUser.username });

//   if (dbuser) {
//     res.send({ message: "User existed" });
//   } else {
//     newUser.password = await bcryptjs.hash(newUser.password, 6);
//     await usercollection.insertOne(newUser);
//     res.send({ message: "User Registration Success" });
//   }
// }));

// // User Login
// userApp.post("/login", expressAsyncHandler(async (req, res) => {
//   const userCred = req.body;
//   const dbuser = await usercollection.findOne({ username: userCred.username });

//   if (!dbuser) {
//     return res.send({ message: "Invalid username" });
//   }

//   const status = await bcryptjs.compare(userCred.password, dbuser.password);
//   if (!status) {
//     return res.send({ message: "Invalid password" });
//   }

//   const signedToken = jwt.sign({ username: dbuser.username, id: dbuser._id }, process.env.KEY, { expiresIn: '1d' });

//   res.send({ message: "Login success", token: signedToken, user: dbuser });
// }));

// Get Articles (Protected Route)
userApp.get("/articles", verifyToken, expressAsyncHandler(async (req, res) => {
  const articlesList = await Articlescollection.find({ status: true }).toArray();
  res.send({ message: "articles", payload: articlesList });
}));

// Post a Comment on Article
userApp.post("/articles/:articleId/comment", verifyToken, expressAsyncHandler(async (req, res) => {
  const { content } = req.body;
  const articleIdFromUrl = req.params.articleId;

  const article = await Articlescollection.findOne({ articleId: articleIdFromUrl });
  if (!article) {
    return res.status(404).json({ message: 'Article not found' });
  }

  const userComment = {
    commentId: new Date().getTime(),
    username: req.user.username,
    userId: req.user.id,
    content: content,
    createdAt: new Date().toISOString()
  };

  try {
    await Articlescollection.updateOne(
      { articleId: articleIdFromUrl },
      { $push: { comments: userComment } }
    );
    res.status(200).send({ message: "Comment posted", comment: userComment });
  } catch (err) {
    res.status(500).json({ message: 'Error posting comment', error: err.message });
  }
}));

// Like an Article
userApp.post("/articles/:articleId/like", verifyToken, expressAsyncHandler(async (req, res) => {
  const articleIdFromUrl = req.params.articleId;
  const article = await Articlescollection.findOne({ articleId: articleIdFromUrl });

  if (!article) {
    return res.status(404).json({ message: 'Article not found' });
  }

  const userHasLiked = article.likes && article.likes.includes(req.user.id);

  if (userHasLiked) {
    return res.status(400).json({ message: 'You have already liked this article' });
  }

  try {
    await Articlescollection.updateOne(
      { articleId: articleIdFromUrl },
      { $push: { likes: req.user.id } }
    );
    res.status(200).send({ message: "Article liked" });
  } catch (err) {
    res.status(500).json({ message: 'Error liking article', error: err.message });
  }
}));

// Edit a Comment
userApp.put("/comments/:commentId", verifyToken, expressAsyncHandler(async (req, res) => {
  const { content } = req.body;
  const commentIdFromUrl = req.params.commentId;
  const article = await Articlescollection.findOne({ "comments.commentId": commentIdFromUrl });

  if (!article) {
    return res.status(404).json({ message: 'Comment not found' });
  }

  const comment = article.comments.find(c => c.commentId == commentIdFromUrl);
  
  if (comment.userId !== req.user.id) {
    return res.status(403).json({ message: 'You are not authorized to edit this comment' });
  }

  try {
    await Articlescollection.updateOne(
      { "comments.commentId": commentIdFromUrl },
      { $set: { "comments.$.content": content } }
    );
    res.status(200).send({ message: "Comment updated" });
  } catch (err) {
    res.status(500).json({ message: 'Error updating comment', error: err.message });
  }
}));

// Delete a Comment
userApp.delete("/comments/:commentId", verifyToken, expressAsyncHandler(async (req, res) => {
  const commentIdFromUrl = req.params.commentId;
  const article = await Articlescollection.findOne({ "comments.commentId": commentIdFromUrl });

  if (!article) {
    return res.status(404).json({ message: 'Comment not found' });
  }

  const comment = article.comments.find(c => c.commentId == commentIdFromUrl);
  
  if (comment.userId !== req.user.id) {
    return res.status(403).json({ message: 'You are not authorized to delete this comment' });
  }

  try {
    await Articlescollection.updateOne(
      { "comments.commentId": commentIdFromUrl },
      { $pull: { comments: { commentId: commentIdFromUrl } } }
    );
    res.status(200).send({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting comment', error: err.message });
  }
}));

module.exports = userApp;
