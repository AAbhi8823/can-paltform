const router=require("express").Router()

const healtherecods_controllers=require("../controllers/healthrecords.controllers")

//Routes
router.post("/add-health-record",healtherecods_controllers.add_health_record)
router.get("/get-health-record/:doc_id",healtherecods_controllers.get_health_records_list_by_user)
router.delete("/delete-health-record/:healthrecord_id/:doc_id",healtherecods_controllers.delete_health_record)
router.put("/update-health-record",healtherecods_controllers.update_health_record)

// //Health Records Folders Routes
// router.post("/add-health-record-folder",healtherecods_controllers.add_health_record_folder)
// router.get("/get-health-record-folder-list",healtherecods_controllers.get_health_record_folders_list)



module.exports=router
