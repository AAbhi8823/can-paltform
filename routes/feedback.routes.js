const router=require("express").Router()

const feedback_controller=require("../controllers/feedback.controllers")

//FEEDBACK ROUTES
router.post("/add-feedback",feedback_controller.add_feedback)
router.get("/get-feedback-by-user",feedback_controller.get_feedback_by_user_id)


module.exports=router