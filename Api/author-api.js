// const exp = require('express');
// const authorApp = exp.Router();
// const bcryptjs = require('bcryptjs');
// const JWT = require("jsonwebtoken");
// const expressAsyncHandler = require('express-async-handler');
// const verifyToken = require('../Middleware/verifyToken');

// let Authorcollection;
// let Articlescollection;

// // Middleware to get collections
// authorApp.use((req, res, next) => {
//   Authorcollection = req.app.get("Authorscollection");
//   Articlescollection = req.app.get("Articlescollection");
//   next();
// });

// // Author Registration
// authorApp.post('/user', exp.json(), expressAsyncHandler(async (req, res) => {
//   const newAuthor = req.body;

//   if (newAuthor.email === newAuthor.password) {
//     return res.status(400).send({ message: "Password and email cannot be the same." });
//   }

//   try {
//     const dbauthorByUsername = await Authorcollection.findOne({ username: newAuthor.username });
//     const dbauthorByEmail = await Authorcollection.findOne({ email: newAuthor.email });

//     if (dbauthorByUsername !== null) {
//       return res.status(400).send({ message: "Username already exists." });
//     }
//     if (dbauthorByEmail !== null) {
//       return res.status(400).send({ message: "Email already exists." });
//     }

//     const hashedPassword = await bcryptjs.hash(newAuthor.password, 7);
//     newAuthor.password = hashedPassword;

//     await Authorcollection.insertOne(newAuthor);
//     res.send({ message: "Author Registration Success" });
//   } catch (error) {
//     console.error("Error during author registration:", error);
//     res.status(500).send({ message: "Internal Server Error. Please try again later." });
//   }
// }));

// // Author Login
// authorApp.post('/login', exp.json(), expressAsyncHandler(async (req, res) => {
//   const credentialObj = req.body;

//   const dbauthor = await Authorcollection.findOne({ username: credentialObj.username });
//   if (!dbauthor) {
//     return res.status(400).send({ message: "Invalid username" });
//   }

//   const isPasswordValid = await bcryptjs.compare(credentialObj.password, dbauthor.password);
//   if (!isPasswordValid) {
//     return res.status(400).send({ message: "Invalid password" });
//   }

//   const signedToken = JWT.sign(
//     { username: dbauthor.username },
//     process.env.KEY,
//     { expiresIn: '1d' }
//   );

//   return res.status(200).send({
//     message: "Author login success",
//     token: signedToken,
//     author: dbauthor,
//   });
// }));

//   // Add Article
// authorApp.post('/add-article', verifyToken, expressAsyncHandler(async (req, res) => {
//   const newArticle = req.body;
//   const isDraft = req.body.isDraft || false;
    
//   // Set status based on isDraft flag (true = published, false = draft)
//   newArticle.status = !isDraft;
//   // Set the username from the token
//   newArticle.username = req.user.username;
  
//   try {
//     const result = await Articlescollection.insertOne(newArticle);
//     const message = isDraft ? 'Draft saved successfully' : 'New article published';
//     res.send({ message, articleId: newArticle.articleId });
//   } catch (error) {
//     console.error('Error inserting article:', error);
//     res.status(500).send({ message: 'Internal server error' });
//   }
// }));


// // Get Articles by Author
// authorApp.get('/articles-by-author/:username', expressAsyncHandler(async (req, res) => {
//   const { username } = req.params;

//   try {
//     const articles = await Articlescollection.find({ username }).toArray();
//     res.send({ articles });
//   } catch (error) {
//     console.error('Error fetching articles:', error);
//     res.status(500).send({ message: 'Failed to fetch articles.' });
//   }
// }));

// // Get Published Articles by Author
// authorApp.get('/published-articles/:username', expressAsyncHandler(async (req, res) => {
//   const { username } = req.params;

//   try {
//     const articles = await Articlescollection.find({ 
//       username,
//       status: true 
//     }).toArray();
//     res.send({ articles });
//   } catch (error) {
//     console.error('Error fetching published articles:', error);
//     res.status(500).send({ message: 'Failed to fetch articles.' });
//   }
// }));

// // Get Drafts by Author (Protected route)
// authorApp.get('/drafts/:username', verifyToken, expressAsyncHandler(async (req, res) => {
//   const { username } = req.params;
//   const tokenUsername = req.user.username;
  
//   // Only allow authors to see their own drafts
//   if (username !== tokenUsername) {
//     return res.status(403).send({ message: "Access denied" });
//   }
  
//   try {
//     const drafts = await Articlescollection.find({ 
//       username, 
//       status: false 
//     }).toArray();
    
//     res.send({ drafts });
//   } catch (error) {
//     console.error('Error fetching drafts:', error);
//     res.status(500).send({ message: 'Failed to fetch drafts.' });
//   }
// }));

// // Get Article by articleId
// authorApp.get('/article/:articleId', expressAsyncHandler(async (req, res) => {
//   const { articleId } = req.params;

//   try {
//     // Query by articleId
//     const article = await Articlescollection.findOne({ articleId });

//     if (!article) {
//       return res.status(404).send({ message: "Article not found" });
//     }

//     res.send({ article });
//   } catch (error) {
//     console.error('Error fetching article:', error);
//     res.status(500).send({ message: 'Failed to fetch article.' });
//   }
// }));

// // Modify Article
// authorApp.put('/article', verifyToken, exp.json(), expressAsyncHandler(async (req, res) => {
//   const modifiedArticle = req.body;
//   const { username } = req.user; // From verifyToken middleware

//   try {
//     // Check if article exists and belongs to this user
//     const existingArticle = await Articlescollection.findOne({ 
//       articleId: modifiedArticle.articleId 
//     });

//     if (!existingArticle) {
//       return res.status(404).send({ message: "Article not found" });
//     }

//     if (existingArticle.username !== username) {
//       return res.status(403).send({ message: "Not authorized to modify this article" });
//     }

//     const result = await Articlescollection.updateOne(
//       { articleId: modifiedArticle.articleId },
//       { $set: { ...modifiedArticle } }
//     );

//     res.send({ message: "Article modified", article: modifiedArticle });
//   } catch (error) {
//     console.error('Error modifying article:', error);
//     res.status(500).send({ message: 'Failed to modify article.' });
//   }
// }));

// //Soft delete an article by article ID
// authorApp.put('/article/:articleId',verifyToken,expressAsyncHandler(async(req,res)=>{
//   //get articleId from url
//   const artileIdFromUrl=(+req.params.articleId);
//   //get article 
//   const articleToDelete=req.body;

//   if(articleToDelete.status===true){
//      let modifiedArt= await Articlescollection.findOneAndUpdate({articleId:artileIdFromUrl},{$set:{...articleToDelete,status:false}},{returnDocument:"after"})
//      res.send({message:"article deleted",payload:modifiedArt.status})
//   }
//   if(articleToDelete.status===false){
//       let modifiedArt= await Articlescollection.findOneAndUpdate({articleId:artileIdFromUrl},{$set:{...articleToDelete,status:true}},{returnDocument:"after"})
//       res.send({message:"article restored",payload:modifiedArt.status})
//   }
 
 
// }))
   
// // Permanently delete an article
// authorApp.delete('/article/:articleId', verifyToken, expressAsyncHandler(async (req, res) => {
//   // Get articleId from url
//   const articleId = req.params.articleId;
//   const { username } = req.user; // From verifyToken middleware

//   try {
//     // Check if article exists and belongs to this user
//     const existingArticle = await Articlescollection.findOne({ articleId });

//     if (!existingArticle) {
//       return res.status(404).send({ message: "Article not found" });
//     }

//     if (existingArticle.username !== username) {
//       return res.status(403).send({ message: "Not authorized to delete this article" });
//     }

//     // Permanently delete the article from the database
//     const result = await Articlescollection.deleteOne({ articleId });
    
//     if (result.deletedCount === 0) {
//       return res.status(404).send({ message: "Article not found or already deleted" });
//     }
    
//     res.send({ message: "Article permanently deleted", success: true });
//   } catch (error) {
//     console.error('Error permanently deleting article:', error);
//     res.status(500).send({ message: 'Failed to permanently delete article.' });
//   }
// }));
   
 



// // Toggle article status (draft <-> published)
// authorApp.put('/article/toggle-status/:articleId', verifyToken, expressAsyncHandler(async (req, res) => {
//   const { articleId } = req.params;
//   const { username } = req.user;
  
//   try {
//     const article = await Articlescollection.findOne({ articleId });
    
//     if (!article) {
//       return res.status(404).send({ message: "Article not found" });
//     }
    
//     if (article.username !== username) {
//       return res.status(403).send({ message: "Not authorized to modify this article" });
//     }
    
//     // Toggle the status
//     const newStatus = !article.status;
    
//     const result = await Articlescollection.updateOne(
//       { articleId },
//       { $set: { status: newStatus } }
//     );
    
//     const message = newStatus ? "Article published" : "Article moved to drafts";
    
//     res.send({ 
//       message,
//       status: newStatus
//     });
//   } catch (error) {
//     console.error('Error toggling article status:', error);
//     res.status(500).send({ message: 'Failed to update article.' });
//   }
// }));

// // Get author stats
// authorApp.get('/stats/:username', verifyToken, expressAsyncHandler(async (req, res) => {
//   try {
//     const { username } = req.params;
//     const tokenUsername = req.user.username;
    
//     // Check if the user is requesting their own stats
//     if (username !== tokenUsername) {
//       return res.status(403).json({ message: 'Access denied' });
//     }
    
//     // Verify the user exists
//     const user = await Authorcollection.findOne({ username });
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }
    
//     // Count published articles (status = true)
//     const totalArticles = await Articlescollection.countDocuments({ 
//       username,
//       status: true
//     });
    
//     // Count drafts (status = false)
//     const totalDrafts = await Articlescollection.countDocuments({ 
//       username,
//       status: false
//     });
    
//     // Calculate total views (sum of views across all articles)
//     const articles = await Articlescollection.find({ username }).toArray();
//     const totalViews = articles.reduce((sum, article) => sum + (article.views || 0), 0);
    
//     // Count total comments
//     const totalComments = articles.reduce((sum, article) => sum + (article.comments?.length || 0), 0);
    
//     // Return the stats
//     return res.status(200).json({
//       totalArticles,
//       totalDrafts,
//       totalViews,
//       totalComments
//     });
//   } catch (error) {
//     console.error('Error fetching stats:', error);
//     return res.status(500).json({ message: 'Server error' });
//   }
// }));




// authorApp.put("/author-api/article/:articleId", async (req, res) => {
//   const { articleId } = req.params;
//   const { status } = req.body;

//   try {
//       const updatedArticle = await Article.findOneAndUpdate(
//           { articleId },
//           { status: status },
//           { new: true } // Return updated article
//       );

//       if (!updatedArticle) {
//           return res.status(404).json({ message: "Article not found." });
//       }

//       res.json({ message: "Article restored successfully!", article: updatedArticle });
//   } catch (error) {
//       res.status(500).json({ message: "Server error, please try again." });
//   }
// });


// // Export the router
// module.exports = authorApp;






















// const exp = require('express');
// const authorApp = exp.Router();
// const bcryptjs = require('bcryptjs');
// const JWT = require("jsonwebtoken");
// const expressAsyncHandler = require('express-async-handler');
// const verifyToken = require('../Middleware/verifyToken');

// let Authorcollection;
// let Articlescollection;

// // Middleware to get collections
// authorApp.use((req, res, next) => {
//   Authorcollection = req.app.get("Authorscollection");
//   Articlescollection = req.app.get("Articlescollection");
//   next();
// });

// // Author Registration
// authorApp.post('/user', exp.json(), expressAsyncHandler(async (req, res) => {
//   const newAuthor = req.body;

//   if (newAuthor.email === newAuthor.password) {
//     return res.status(400).send({ message: "Password and email cannot be the same." });
//   }

//   try {
//     const dbauthorByUsername = await Authorcollection.findOne({ username: newAuthor.username });
//     const dbauthorByEmail = await Authorcollection.findOne({ email: newAuthor.email });

//     if (dbauthorByUsername !== null) {
//       return res.status(400).send({ message: "Username already exists." });
//     }
//     if (dbauthorByEmail !== null) {
//       return res.status(400).send({ message: "Email already exists." });
//     }

//     const hashedPassword = await bcryptjs.hash(newAuthor.password, 7);
//     newAuthor.password = hashedPassword;

//     await Authorcollection.insertOne(newAuthor);
//     res.send({ message: "Author Registration Success" });
//   } catch (error) {
//     console.error("Error during author registration:", error);
//     res.status(500).send({ message: "Internal Server Error. Please try again later." });
//   }
// }));

// // Author Login
// authorApp.post('/login', exp.json(), expressAsyncHandler(async (req, res) => {
//   const credentialObj = req.body;

//   const dbauthor = await Authorcollection.findOne({ username: credentialObj.username });
//   if (!dbauthor) {
//     return res.status(400).send({ message: "Invalid username" });
//   }

//   const isPasswordValid = await bcryptjs.compare(credentialObj.password, dbauthor.password);
//   if (!isPasswordValid) {
//     return res.status(400).send({ message: "Invalid password" });
//   }

//   const signedToken = JWT.sign(
//     { username: dbauthor.username },
//     process.env.KEY,
//     { expiresIn: '1d' }
//   );

//   return res.status(200).send({
//     message: "Author login success",
//     token: signedToken,
//     author: dbauthor,
//   });
// }));

// // Add Article
// authorApp.post('/add-article', verifyToken, expressAsyncHandler(async (req, res) => {
//   const newArticle = req.body;
//   newArticle.status = true;
//   newArticle.username = req.user.username;
  
//   try {
//     const result = await Articlescollection.insertOne(newArticle);
//     res.send({ message: 'New article published', articleId: newArticle.articleId });
//   } catch (error) {
//     console.error('Error inserting article:', error);
//     res.status(500).send({ message: 'Internal server error' });
//   }
// }));

// // Get Article by articleId
// authorApp.get('/article/:articleId', expressAsyncHandler(async (req, res) => {
//   const { articleId } = req.params;

//   try {
//     const article = await Articlescollection.findOne({ articleId });

//     if (!article) {
//       return res.status(404).send({ message: "Article not found" });
//     }

//     res.send({ article });
//   } catch (error) {
//     console.error('Error fetching article:', error);
//     res.status(500).send({ message: 'Failed to fetch article.' });
//   }
// }));

// // Modify Article
// authorApp.put('/article', verifyToken, exp.json(), expressAsyncHandler(async (req, res) => {
//   const modifiedArticle = req.body;
//   const { username } = req.user;

//   try {
//     const existingArticle = await Articlescollection.findOne({ 
//       articleId: modifiedArticle.articleId 
//     });

//     if (!existingArticle) {
//       return res.status(404).send({ message: "Article not found" });
//     }

//     if (existingArticle.username !== username) {
//       return res.status(403).send({ message: "Not authorized to modify this article" });
//     }

//     const result = await Articlescollection.updateOne(
//       { articleId: modifiedArticle.articleId },
//       { $set: { ...modifiedArticle } }
//     );

//     res.send({ message: "Article modified", article: modifiedArticle });
//   } catch (error) {
//     console.error('Error modifying article:', error);
//     res.status(500).send({ message: 'Failed to modify article.' });
//   }
// }));

// // Soft delete/restore an article
// authorApp.put('/article/:articleId',verifyToken,expressAsyncHandler(async(req,res)=>{
//   //get articleId from url
//   const artileIdFromUrl=(+req.params.articleId);
//   //get article 
//   const articleToDelete=req.body;

//   if(articleToDelete.status===true){
//      let modifiedArt= await Articlescollection.findOneAndUpdate({articleId:artileIdFromUrl},{$set:{...articleToDelete,status:false}},{returnDocument:"after"})
//      res.send({message:"article deleted",payload:modifiedArt.status})
//   }
//   if(articleToDelete.status===false){
//       let modifiedArt= await Articlescollection.findOneAndUpdate({articleId:artileIdFromUrl},{$set:{...articleToDelete,status:true}},{returnDocument:"after"})
//       res.send({message:"article restored",payload:modifiedArt.status})
//   }
// }));
// // Get all articles by author
// authorApp.get('/articles-by-author/:username', expressAsyncHandler(async (req, res) => {
//   const { username } = req.params;

//   try {
//     const articles = await Articlescollection.find({ username }).toArray();
//     res.send({ articles });
//   } catch (error) {
//     console.error('Error fetching articles:', error);
//     res.status(500).send({ message: 'Failed to fetch articles.' });
//   }
// }));


              

//       // Get published articles by author
// authorApp.get('/published-articles/:username', expressAsyncHandler(async (req, res) => {
//   const { username } = req.params;

//   try {
//     // Published articles: status = true (active) AND isDraft = false (not a draft)
//     const articles = await Articlescollection.find({ 
//       username,
//       status: true,
//       isDraft: false
//     }).toArray();
//     res.send({ articles });
//   } catch (error) {
//     console.error('Error fetching published articles:', error);
//     res.status(500).send({ message: 'Failed to fetch articles.' });
//   }
// }));

// // Get author stats
// authorApp.get('/stats/:username', verifyToken, expressAsyncHandler(async (req, res) => {
//   try {
//     const { username } = req.params;
//     const tokenUsername = req.user.username;
    
//     // Check if the user is requesting their own stats
//     if (username !== tokenUsername) {
//       return res.status(403).json({ message: 'Access denied' });
//     }
    
//     // Verify the user exists
//     const user = await Authorcollection.findOne({ username });
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }
    
//     // Count published articles (status = true AND isDraft = false)
//     const totalArticles = await Articlescollection.countDocuments({ 
//       username,
//       status: true,
//       isDraft: false
//     });
    
//     // Count drafts (isDraft = true)
//     const totalDrafts = await Articlescollection.countDocuments({ 
//       username,
//       isDraft: true
//     });
    
//     // Count deleted articles (status = false)
//     const totalDeleted = await Articlescollection.countDocuments({
//       username,
//       status: false
//     });
    
//     // Return the stats
//     return res.status(200).json({
//       totalArticles,
//       totalDrafts,
//       totalDeleted
//     });
//   } catch (error) {
//     console.error('Error fetching stats:', error);
//     return res.status(500).json({ message: 'Server error' });
//   }
// }));







// // Export the router
// module.exports = authorApp;









const exp = require('express');
const authorApp = exp.Router();
const bcryptjs = require('bcryptjs');
const JWT = require("jsonwebtoken");
const expressAsyncHandler = require('express-async-handler');
const verifyToken = require('../Middleware/verifyToken');

let Authorcollection;
let Articlescollection;

// Middleware to get collections
authorApp.use((req, res, next) => {
  Authorcollection = req.app.get("Authorscollection");
  Articlescollection = req.app.get("Articlescollection");
  next();
});

// Author Registration
authorApp.post('/user', exp.json(), expressAsyncHandler(async (req, res) => {
  const newAuthor = req.body;

  if (newAuthor.email === newAuthor.password) {
    return res.status(400).send({ message: "Password and email cannot be the same." });
  }

  try {
    const dbauthorByUsername = await Authorcollection.findOne({ username: newAuthor.username });
    const dbauthorByEmail = await Authorcollection.findOne({ email: newAuthor.email });

    if (dbauthorByUsername !== null) {
      return res.status(400).send({ message: "Username already exists." });
    }
    if (dbauthorByEmail !== null) {
      return res.status(400).send({ message: "Email already exists." });
    }

    const hashedPassword = await bcryptjs.hash(newAuthor.password, 7);
    newAuthor.password = hashedPassword;

    await Authorcollection.insertOne(newAuthor);
    res.send({ message: "Author Registration Success" });
  } catch (error) {
    console.error("Error during author registration:", error);
    res.status(500).send({ message: "Internal Server Error. Please try again later." });
  }
}));

// Author Login
authorApp.post('/login', exp.json(), expressAsyncHandler(async (req, res) => {
  const credentialObj = req.body;

  const dbauthor = await Authorcollection.findOne({ username: credentialObj.username });
  if (!dbauthor) {
    return res.status(400).send({ message: "Invalid username" });
  }

  const isPasswordValid = await bcryptjs.compare(credentialObj.password, dbauthor.password);
  if (!isPasswordValid) {
    return res.status(400).send({ message: "Invalid password" });
  }

  const signedToken = JWT.sign(
    { username: dbauthor.username },
    process.env.KEY,
    { expiresIn: '1d' }
  );

  return res.status(200).send({
    message: "Author login success",
    token: signedToken,
    author: dbauthor,
  });
}));

// Add Article
authorApp.post('/add-article', verifyToken, expressAsyncHandler(async (req, res) => {
  const newArticle = req.body;
  newArticle.status = true;
  newArticle.username = req.user.username;
  
  // Set default values for new fields if not provided
  if (!newArticle.publishedAt) {
    newArticle.publishedAt = new Date();
  }
  if (!newArticle.views) {
    newArticle.views = 0;
  }
  if (!newArticle.isDraft) {
    newArticle.isDraft = false;
  }
  
  try {
    const result = await Articlescollection.insertOne(newArticle);
    res.send({ message: 'New article published', articleId: newArticle.articleId });
  } catch (error) {
    console.error('Error inserting article:', error);
    res.status(500).send({ message: 'Internal server error' });
  }
}));

// Get Article by articleId
authorApp.get('/article/:articleId', expressAsyncHandler(async (req, res) => {
  const { articleId } = req.params;

  try {
    const article = await Articlescollection.findOne({ articleId });

    if (!article) {
      return res.status(404).send({ message: "Article not found" });
    }

    res.send({ article });
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).send({ message: 'Failed to fetch article.' });
  }
}));

// Modify Article
authorApp.put('/article', verifyToken, exp.json(), expressAsyncHandler(async (req, res) => {
  const modifiedArticle = req.body;
  const { username } = req.user;

  try {
    const existingArticle = await Articlescollection.findOne({ 
      articleId: modifiedArticle.articleId 
    });

    if (!existingArticle) {
      return res.status(404).send({ message: "Article not found" });
    }

    if (existingArticle.username !== username) {
      return res.status(403).send({ message: "Not authorized to modify this article" });
    }

    const result = await Articlescollection.updateOne(
      { articleId: modifiedArticle.articleId },
      { $set: { ...modifiedArticle } }
    );

    res.send({ message: "Article modified", article: modifiedArticle });
  } catch (error) {
    console.error('Error modifying article:', error);
    res.status(500).send({ message: 'Failed to modify article.' });
  }
}));

// Soft delete/restore an article
authorApp.put('/article/:articleId', verifyToken, expressAsyncHandler(async(req, res) => {
  try {
    // Get articleId from url
    const articleIdFromUrl = (+req.params.articleId);
    
    // Get article from request body
    const articleToUpdate = req.body;
    
    // Check if the article exists
    const existingArticle = await Articlescollection.findOne({ articleId: articleIdFromUrl });
    
    if (!existingArticle) {
      return res.status(404).send({ message: "Article not found" });
    }
    
    // Determine the new status based on current status
    const newStatus = articleToUpdate.status === true ? false : true;
    
    // Update the article
    let modifiedArt = await Articlescollection.findOneAndUpdate(
      { articleId: articleIdFromUrl },
      { $set: { ...articleToUpdate, status: newStatus } },
      { returnDocument: "after" }
    );
    
    if (!modifiedArt) {
      return res.status(404).send({ message: "Failed to update article" });
    }
    
    // Send appropriate message based on the new status
    const message = newStatus === true ? "Article restored" : "Article deleted";
    res.send({ message: message, payload: modifiedArt.status });
  } catch (error) {
    console.error("Error updating article status:", error);
    res.status(500).send({ message: "Internal server error occurred" });
  }
}));





   
 // Permanent delete
authorApp.delete('/article/:articleId', verifyToken, expressAsyncHandler(async (req, res) => {
  // Get articleId from URL
  const articleIdFromUrl = +req.params.articleId;

  // Delete article from collection
  const deletedArticle = await Articlescollection.findOneAndDelete({ articleId: articleIdFromUrl });

  // If article is found and deleted
  if (deletedArticle) {
    res.send({ message: "Article permanently deleted", payload: deletedArticle });
  } else {
    res.status(404).send({ message: "Article not found" });
  }
}));


   

// Get all articles by author
authorApp.get('/articles-by-author/:username', expressAsyncHandler(async (req, res) => {
  const { username } = req.params;

  try {
    const articles = await Articlescollection.find({ username }).toArray();
    res.send({ articles });
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).send({ message: 'Failed to fetch articles.' });
  }
}));

// Get published articles by author
authorApp.get('/published-articles/:username', expressAsyncHandler(async (req, res) => {
  const { username } = req.params;

  try {
    // Published articles: status = true (active) AND isDraft = false (not a draft)
    const articles = await Articlescollection.find({ 
      username,
      status: true,
      isDraft: false
    }).toArray();
    res.send({ articles });
  } catch (error) {
    console.error('Error fetching published articles:', error);
    res.status(500).send({ message: 'Failed to fetch articles.' });
  }
}));

// Get author stats
authorApp.get('/stats/:username', verifyToken, expressAsyncHandler(async (req, res) => {
  try {
    const { username } = req.params;
    const tokenUsername = req.user.username;
    
    // Check if the user is requesting their own stats
    if (username !== tokenUsername) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Verify the user exists
    const user = await Authorcollection.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Count published articles (status = true AND isDraft = false)
    const totalArticles = await Articlescollection.countDocuments({ 
      username,
      status: true,
      isDraft: false
    });
    
    // Count drafts (isDraft = true)
    const totalDrafts = await Articlescollection.countDocuments({ 
      username,
      isDraft: true
    });
    
    // Count deleted articles (status = false)
    const totalDeleted = await Articlescollection.countDocuments({
      username,
      status: false
    });
    
    // Return the stats
    return res.status(200).json({
      totalArticles,
      totalDrafts,
      totalDeleted
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}));

// NEW ENDPOINT: Get advanced author stats
authorApp.get('/advanced-stats/:username', verifyToken, expressAsyncHandler(async (req, res) => {
  try {
    const { username } = req.params;
    const { timeFilter } = req.query;
    const tokenUsername = req.user.username;
    
    // Check if the user is requesting their own stats
    if (username !== tokenUsername) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Verify the user exists
    const user = await Authorcollection.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Date filter logic
    let dateFilter = {};
    const now = new Date();
    if (timeFilter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = { publishedAt: { $gte: weekAgo } };
    } else if (timeFilter === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateFilter = { publishedAt: { $gte: monthAgo } };
    } else if (timeFilter === 'year') {
      const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      dateFilter = { publishedAt: { $gte: yearAgo } };
    }
    
    // Count published articles (status = true AND isDraft = false)
    const totalArticles = await Articlescollection.countDocuments({ 
      username,
      status: true,
      isDraft: false,
      ...dateFilter
    });
    
    // Get popular articles based on views
    const popularArticles = await Articlescollection.find({
      username,
      status: true,
      isDraft: false,
      ...dateFilter
    })
    .sort({ views: -1 })
    .limit(5)
    .toArray();
    
    // Get views per article
    const viewsPerArticle = await Articlescollection.find({
      username,
      status: true,
      isDraft: false,
      ...dateFilter
    })
    .project({ title: 1, articleId: 1, views: 1 })
    .toArray();
    
    // Generate trend data
    // This will create a month-by-month breakdown of article counts
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const articleTrend = [];
    
    // Last 6 months of article counts
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now);
      date.setMonth(now.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const count = await Articlescollection.countDocuments({
        username,
        status: true,
        isDraft: false,
        publishedAt: { $gte: monthStart, $lte: monthEnd }
      });
      
      articleTrend.push({
        date: months[date.getMonth()],
        count: count
      });
    }
    
    // Return the advanced stats
    return res.status(200).json({
      totalArticles,
      popularArticles,
      viewsPerArticle,
      articleTrend
    });
  } catch (error) {
    console.error('Error fetching advanced stats:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}));

// Increment article views
authorApp.put('/increment-view/:articleId', expressAsyncHandler(async (req, res) => {
  const { articleId } = req.params;
  
  try {
    const result = await Articlescollection.updateOne(
      { articleId },
      { $inc: { views: 1 } }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).send({ message: "Article not found" });
    }
    
    res.send({ message: "View count incremented" });
  } catch (error) {
    console.error('Error incrementing views:', error);
    res.status(500).send({ message: 'Failed to increment view count.' });
  }
}));


 // Profile page

authorApp.get("/profile/:username", async (req, res) => {
  try {
      const username = req.params.username;
      const Authorscollection = req.app.get("Authorscollection");

      const authorProfile = await Authorscollection.findOne({ username: username });

      if (!authorProfile) {
          return res.status(404).json({ message: "Author not found" });
      }

      res.json(authorProfile);
  } catch (error) {
      console.error("Error fetching author profile:", error);
      res.status(500).json({ message: "Internal server error" });
  }
});

   
authorApp.put("/profile/:username", verifyToken, async (req, res) => {
  try {
    const { username } = req.params;
    const { 
      bio, 
      birthday, 
      location, 
      website, 
      twitter, 
      facebook, 
      instagram, 
      skills 
    } = req.body;
    
    const Authorscollection = req.app.get("Authorscollection");
    
    const updatedAuthor = await Authorscollection.findOneAndUpdate(
      { username },
      { 
        $set: { 
          bio, 
          birthday, 
          location, 
          website, 
          twitter, 
          facebook, 
          instagram, 
          skills 
        } 
      },
      { returnDocument: "after" }
    );
    
    if (!updatedAuthor) {
      return res.status(404).json({ message: "Author not found" });
    }
    
    res.json({ 
      message: "Profile updated successfully", 
      profile: updatedAuthor 
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ 
      message: "Server error while updating profile" 
    });
  }
});

  


// Export the router
module.exports = authorApp;