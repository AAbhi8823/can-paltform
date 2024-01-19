const router=require("express").Router()

const healtherecods_controllers=require("../controllers/healthrecords.controllers")

//Routes
router.post("/add-health-record",healtherecods_controllers.add_health_record)
router.get("/get-health-record",healtherecods_controllers.get_health_records)


module.exports=router
