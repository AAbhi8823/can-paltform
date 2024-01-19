const router=require("express") .Router()

const appointment_controller=require("../controllers/appointment.controllers")

//APPOINTMENT ROUTES
router.post("/add-appointment",appointment_controller.add_appointment)



module.exports=router
