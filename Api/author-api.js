   // create the author Api
        const exp=require('express')
        const authorApp=exp.Router()
       const  bcryptjs=require('bcryptjs')
       const JWT=require("jsonwebtoken")
        const expressAsyncHandler=require('express-async-handler')
        const verifyToken=require('../Middleware/verifyToken')

              let Authorcollection ;
              let Articlescollection;
                // get Authorcollection App
                   
                    authorApp.use((req, res, next) => {
                     Authorcollection = req.app.get("Authorscollection");
                     Articlescollection = req.app.get("Articlescollection");
                     next();
                 });
                                   


// create the author registration 
   
authorApp.post('/user',exp.json(),expressAsyncHandler(async (req, res) => {
     // Get the new author details from the request body
     const newAuthor = req.body;
 
     // Check if the email and password are the same
     if (newAuthor.email === newAuthor.password) {
       return res.status(400).send({ message: "Password and email cannot be the same." });
     }
 
     try {
       // Check if the username already exists in the database
       const dbauthorByUsername = await Authorcollection.findOne({ username: newAuthor.username });
       
       // Check if the email already exists in the database
       const dbauthorByEmail = await Authorcollection.findOne({ email: newAuthor.email });
 
       // If either the username or email already exists, return an error
       if (dbauthorByUsername !== null) {
         return res.status(400).send({ message: "Username already exists." });
       }
       if (dbauthorByEmail !== null) {
         return res.status(400).send({ message: "Email already exists." });
       }
 
       // Hash the password using bcryptjs
       const hashedPassword = await bcryptjs.hash(newAuthor.password, 7);
       // Replace the plain text password with the hashed password
       newAuthor.password = hashedPassword;
 
       // Insert the new author into the database
       await Authorcollection.insertOne(newAuthor);
 
       // Send a success response
       res.send({ message: "Author Registration Success" });
     } catch (error) {
       console.error("Error during author registration:", error);
       res.status(500).send({ message: "Internal Server Error. Please try again later." });
     }
   })
 );
 




 // Author login route
authorApp.post('/login', expressAsyncHandler(async (req, res) => {
  const credentialObj = req.body; // Get credentials from client

  // Check if username exists
  const dbauthor = await Authorcollection.findOne({ username: credentialObj.username });
  
  if (!dbauthor) {
    return res.status(400).send({ message: "Invalid username" });
  }

  // Check if password is correct
  const isPasswordValid = await bcryptjs.compare(credentialObj.password, dbauthor.password);
  
  if (!isPasswordValid) {
    return res.status(400).send({ message: "Invalid password" });
  }

  // Create JWT token
  const signedToken = JWT.sign(
    { username: dbauthor.username },
    process.env.KEY,
    { expiresIn: '1d' } // Token expiration in 1 day
  );

  return res.status(200).send({
    message: "Author login success",
    token: signedToken,
    author: dbauthor,
  });
}));




//adding new article by author
authorApp.post('/add-article',verifyToken,expressAsyncHandler(async(req,res)=>{
   //get new article from client
   const newArticle=req.body;
    console.log(newArticle)
   //post to artciles collection
   await Articlescollection.insertOne(newArticle)
   //send res
   res.send({message:"New article created"})
}))
 
            
            // get modified aritcle from client
                   authorApp.put('/article',verifyToken,expressAsyncHandler(async(req,res)=>{
                          // get req from client
                           const modifiedAritcle=req.body
                        // updated from client aritcle
                 let result= await Articlescollection.updateOne({articleId:modifiedAritcle.articleId},{$set:{...modifiedAritcle}})  
                        // send res
                          res.send({message:"Aritcle Modified"})
                   }))

   
         //  // soft delete the article
         //        authorApp.put('/article/:articleId',expressAsyncHandler(async(req,res)=>{
         //                  //get req from client
         //                   const aritcleIdFromUrl=req.params.articleId
                                  
         //                   // get article 
         //                     const  aritcleDeleteUrl=req.body
         //                   // soft delete 
         //                   await Articlescollection.updateOne({articleId:aritcleIdFromUrl},{$set:{...aritcleDeleteUrl,status:false}})
         //                   // send res
         //                    res.send({message:"article remove from a softly"})
         //        }))      
               
                

                            //  delete an article by article ID
authorApp.put('/article/:articleId',verifyToken,expressAsyncHandler(async(req,res)=>{
  //get articleId from url
  const artileIdFromUrl=req.params.articleId;
  //get article 
  const articleToDelete=req.body;
  //update status of article to false
  await Articlescollection.updateOne({articleId:artileIdFromUrl},{$set:{...articleToDelete,status:false}})
  res.send({message:"Article removed"})
}))

        // exports the authorApp
         
          module.exports=authorApp;