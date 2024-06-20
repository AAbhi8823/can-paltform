const router=require("express").Router()

const medicine_controller=require("../controllers/medicine.controllers")

//MEDICINE ROUTES
router.post("/add-medicine",medicine_controller.add_medicine)
router.put("/update-medicine",medicine_controller.update_medicine)
router.get("/get-medicine-list",medicine_controller.get_medicine_list)
router.get('/get-medicine-by-date/:medicine_date',medicine_controller.get_medicine_details_month_wise)
router.get("/get-medicine-bank/",medicine_controller.get_medicine_bank_details_month_wise)
router.delete("/delete-medicine/:medicine_id",medicine_controller.delete_medicine)

router.get("/get-medicine-by-id/:medicine_id",medicine_controller.get_medicine_details_by_id)
router.get("/get-medicine-next-seven-days",medicine_controller.get_medicine_for_next_7_days)


module.exports=router