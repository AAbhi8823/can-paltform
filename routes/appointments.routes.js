const router=require("express") .Router()

const appointment_controller=require("../controllers/appointment.controllers")

//APPOINTMENT ROUTES
router.post("/add-appointment",appointment_controller.add_appointment)
router.get("/get-appointments-list",appointment_controller.get_appointment_list)
router.put("/update-appointment",appointment_controller.update_appointment)
router.delete("/delete-appointment/:id",appointment_controller.delete_appointment)

router.get("/upcoming-appointments",appointment_controller.upcoming_appointment)



module.exports=router
