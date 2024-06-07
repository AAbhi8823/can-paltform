const router = require('express').Router();

const subscription_plan_controller=require("../controllers/subscriptionplan.controllers")

//Routes
router.post("/add-subscription-plan",subscription_plan_controller.add_subscription_plan);
router.get("/get-subscription-plan-list",subscription_plan_controller.get_all_subscription_plans);
router.get("/get-subscription-plan/:subscription_id",subscription_plan_controller.get_subscription_plan_by_id);
router.put("/update-subscription-plan/:subscription_id",subscription_plan_controller.update_subscription_plan);
router.delete("/delete-subscription-plan/:subscription_id",subscription_plan_controller.delete_subscription_plan);

  
module.exports = router;
