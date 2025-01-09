  // create the user  Api App
       const exp=require('express')
       const userApp=exp.Router()
      const bcryptjs=require('bcryptjs')
      const expressAsyncHandler=require('express-async-handler')
      const JWT=require('jsonwebtoken')
      const verifyToken=require('../Middleware/verifyToken')

               let usercollection;
               let Articlescollection
                // get usercollection app
                    userApp.use((req,res,next)=>{
                           usercollection=req.app.get('userscollection')
                           Articlescollection=req.app.get('Articlescollection')
                            next();
                    })

                      // routes of a userApp
                   
                      // registration process

                     
                       
                      userApp.post(
                        "/user",
                        expressAsyncHandler(async (req, res) => {
                          //get user resource from client
                          const newUser = req.body;
                          //check for duplicate user based on username
                          const dbuser = await usercollection.findOne({ username: newUser.username });
                          //if user found in db
                          if (dbuser !== null) {
                            res.send({ message: "User existed" });
                          } else {
                            //hash the password
                            const hashedPassword = await bcryptjs.hash(newUser.password, 6);
                            //replace plain pw with hashed pw
                            newUser.password = hashedPassword;
                            //create user
                            await usercollection.insertOne(newUser);
                            //send res
                            res.send({ message: "User Registration Success" });
                          }
                        })
                      );
             
                      // User login route
                      userApp.post("/login", expressAsyncHandler(async (req, res) => {
                        const userCred = req.body; // Get credentials from client
                        console.log("User Credentials:", userCred);
                      
                        // Check if username exists
                        const dbuser = await usercollection.findOne({ username: userCred.username });
                        console.log("Database User:", dbuser);
                      
                        if (!dbuser) {
                          return res.status(400).send({ message: "Invalid username" });
                        }
                      
                        // Check if password is correct
                        const isPasswordValid = await bcryptjs.compare(userCred.password, dbuser.password);
                        console.log("Password Valid:", isPasswordValid);
                      
                        if (!isPasswordValid) {
                          return res.status(400).send({ message: "Invalid password" });
                        }
                      
                        // Create JWT token
                        const signedToken = JWT.sign(
                          { username: dbuser.username },
                          process.env.KEY,
                          { expiresIn: '1d' } // Token expiration in 1 day
                        );
                      
                        return res.status(200).send({
                          message: "User login success",
                          token: signedToken,
                          user: dbuser,
                        });
                      }));
                      
                
                
                
                
                
                
            
                             //get articles of all authors
                              userApp.get(
                                          "/articles", verifyToken, 
                            expressAsyncHandler(async (req, res) => {
                  //get articlescollection from express app
                  const R=Articlescollection = req.app.get("Articlescollection");
    //get all articles
    let articlesList = await Articlescollection
      .find({ status: true })
      .toArray();
    //send res
    res.send({ message: "articles", payload: articlesList });
  })
                                    );


                     // write the comments on articles
                              userApp.post(
                                "/comment/:articleId", verifyToken,
                                expressAsyncHandler(async (req, res) => {
                                  //get user comment obj
                                  const userComment = req.body;
                                  const articleIdFromUrl=req.params.articleId;
                                  //insert userComment object to comments array of article by id
                                  let result = await Articlescollection.updateOne(
                                    { articleId: articleIdFromUrl},
                                    { $addToSet: { comments: userComment } }
                                  );
                                  console.log(result);
                                  res.send({ message: "Comment posted" });
                                })
                              );
                          
                            
       //export userApp
         
         module.exports=userApp