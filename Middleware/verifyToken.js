  const JWT=require('jsonwebtoken')
   require('dotenv').config()


function verifyToken(req,res,next){
            // get bearer token from headers
            const bearerToken=req.headers.authorization
            // if bearer id not avaliable
              if(!bearerToken){
                 return res.send({message:"unauthorized accessmplease login to continue"})
              }
                 // rextcat token from 
                      bearerToken.split(' ') [1]
                       try{
                            JWT.verify(token,process.env.KEY)
                       } catch(err){
                    next(err)
                       }
                                  

                    }
                    



module.exports=verifyToken