const express=require("express")
const app=express()

//Import Routes
const userRoutes=require("./user.routes")
const healthrecordsRoutes=require("./healthrecords.routes")
const userprofileRoutes=require("./user.profile.routes")
const appointmentsRoutes=require("./appointments.routes")
const medicineRoutes=require("./medicine.routes")
const healthcardRoutes=require("./healthcard.routes")


//Middlewares
app.use("/user",userRoutes)
app.use("/userprofile",userprofileRoutes)
app.use("/healthrecord",healthrecordsRoutes)
app.use("/appointment",appointmentsRoutes)
app.use("/medicine",medicineRoutes)
app.use("/healthcard",healthcardRoutes)



module.exports=app