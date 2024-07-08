const express=require("express")
const app=express()

//Import Routes
const userRoutes=require("./user.routes")
const healthrecordsRoutes=require("./healthrecords.routes")
const userprofileRoutes=require("./user.profile.routes")
const appointmentsRoutes=require("./appointments.routes")
const medicineRoutes=require("./medicine.routes")
const healthcardRoutes=require("./healthcard.routes")
const subscriptionplanRoutes=require("./subscription.plan.routes")
const profileListRoutes=require("./mster.profile.list.routes")
const mystoryRoutes=require("./mystory.routes")
const meetingRoutes=require("./zoom.live.meeting.management.routes")
const commentsRoutes=require("./comment.routes")
//const saveMystoryroutes=require("./saved.routes")
const feedbackRoutes=require("./feedback.routes")  
const ticketRoutes=require("./ticket.management.routes") 
const pollRoutes=require("./poll.management.routes")
const invoiceRoutes=require("./invoice.routes")


//Middlewares
app.use("/user",userRoutes)
app.use("/userprofile",userprofileRoutes)
app.use("/healthrecord",healthrecordsRoutes)
app.use("/appointment",appointmentsRoutes)
app.use("/medicine",medicineRoutes)
app.use("/healthcard",healthcardRoutes)
app.use("/subscriptionplan",subscriptionplanRoutes)
app.use("/profilelist",profileListRoutes)   
app.use("/mystory",mystoryRoutes)
app.use("/meeting",meetingRoutes)
app.use("/comments",commentsRoutes)
//app.use("/savedstory",saveMystoryroutes)
app.use("/feedback",feedbackRoutes)

app.use("/ticket",ticketRoutes)
app.use("/poll",pollRoutes)

//app.use("/invoice",invoiceRoutes)


module.exports=app