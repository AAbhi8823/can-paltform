const router=require("express").Router()

const healtherecods_controllers=require("../controllers/healthrecords.controllers")

//Routes
router.post("/add-health-record",healtherecods_controllers.add_health_record)


module.exports=router
