const express=require("express")
const app=express()

//Import Routes
const userRoutes=require("./user.routes")
const healthrecordsRoutes=require("./healthrecords.routes")



//Middlewares
app.use("/user",userRoutes)
app.use("/healthrecords",healthrecordsRoutes)



module.exports=app