    // create the Admin Api app
        const exp= require('express')
        const adminApp=exp.Router()



            adminApp.get('/test-admin',(req,res)=>{
                  res.send({message:"This from admin app"})
            })











        // exports the adminApp
           module.exports=adminApp;