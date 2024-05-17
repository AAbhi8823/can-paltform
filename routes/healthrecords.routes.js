const router=require("express").Router()

const healtherecods_controllers=require("../controllers/healthrecords.controllers")

//Routes
router.post("/add-health-record",healtherecods_controllers.add_health_record)
router.get("/get-health-record",healtherecods_controllers.get_health_records)
router.delete("/delete-health-record/:healthrecord_id",healtherecods_controllers.delete_health_record)
router.put("/update-health-record",healtherecods_controllers.update_health_record)



module.exports=router
