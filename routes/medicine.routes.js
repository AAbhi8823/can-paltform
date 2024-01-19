const router=require("express").Router()

const medicine_controller=require("../controllers/medicine.controllers")

//MEDICINE ROUTES
router.post("/add-medicine",medicine_controller.add_medicine)
router.put("/update-medicine",medicine_controller.update_medicine)
router.get("/get-medicine-list",medicine_controller.get_medicine_list)


module.exports=router