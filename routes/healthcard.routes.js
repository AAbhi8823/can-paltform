const router=require("express").Router()

const healthcard_model=require("../controllers/healthcard.controllers")

//Routes
router.post("/add-health-card",healthcard_model.add_healthcard)

router.get("/get-health-card",healthcard_model.get_healthcard)

router.put("/update-health-card",healthcard_model.update_healthcard)


module.exports=router
