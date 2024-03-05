const router=require("express") .Router()

const appointment_controller=require("../controllers/appointment.controllers")

//APPOINTMENT ROUTES
router.post("/add-appointment",appointment_controller.add_appointment)
router.get("/get-appointments-list",appointment_controller.get_appointment_list)



module.exports=router
