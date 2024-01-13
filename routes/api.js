const express=require("express")
const app=express()

//Import Routes
const userRoutes=require("./user.routes")
const healthrecordsRoutes=require("./healthrecords.routes")
const userprofileRoutes=require("./user.profile.routes")



//Middlewares
app.use("/user",userRoutes)
app.use("/userprofile",userprofileRoutes)
app.use("/healthrecords",healthrecordsRoutes)



module.exports=app