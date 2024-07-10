const router=require("express").Router()

const user_controllers=require("../controllers/user.controllers")



//USER ROUTES
router.post("/user-register",user_controllers.add_user)
router.post("/verify-user",user_controllers.verify_user)
router.post("/user-login",user_controllers.login_user)
router.post("/user-logout",user_controllers.logout_user)
router.get("/get-user-profile",user_controllers.get_user_profile)
router.put("/update-user-profile",user_controllers.update_user_profile)
router.get("/get-user-by-id/:user_id",user_controllers.get_user_by_id)
router.put("/change-password",user_controllers.change_password)
router.get("/get-blocked-users",user_controllers.get_blocked_users)
router.get("/get-users-list-by-admin",user_controllers.get_users_list_by_admin)

//User Details Raoutes For Admin Dashboard
router.get("/get-total-users",user_controllers.get_total_users_by_admin)
router.get("/get-total-active-users",user_controllers.get_total_active_users_by_admin)
//router.get("/get-total-inactive-users",user_controllers.get_total_inactive_users)
router.get("/get-total-blocked-users",user_controllers.get_total_blocked_users_by_admin)
router.get("/get-total-fighter",user_controllers.get_total_fighters_users_by_admin)
router.get("/get-tolal-caregivers",user_controllers.get_total_caregivers_users_by_admin)
router.get("/get-total-vaterans",user_controllers.get_total_veterans_users_by_admin)

router.get("/get-total-live-users",user_controllers.get_total_live_users_by_admin)
//Admin Routes
router.get("/get-users-percentage",user_controllers.get_perecentage_user_gender_by_admin)



//Password reset
//router.post("/reset-password",user_controllers.reset_password)
//router.post("/user-password-reset-pin",user_controllers.reset_password_pin)
router.post("/admin-block-root-user",user_controllers.block_user_profile_profile )
router.post("/block-user",user_controllers.block_user_profile )

router.post("/user-profile-pin-reset",user_controllers.reset_pin)

//Mobile OTP login routes
router.post("/mobile-otp-login",user_controllers.login_user_with_otp)

router.post("/user-password-reset",user_controllers.user_forgot_password)

//router.post("/rest-password/:id/:token ",user_controllers.reset_password)
router.post("/reset-password",user_controllers.reset_password)

//User Reports API
router.post("/report-user",user_controllers.report_user)
router.get("/get-reported-users-list",user_controllers.get_reported_users_list_by_admin)
router.post("/block-story/:story_id",user_controllers.block_reported_story_by_admin)
router.delete("/delete-story/:story_id",user_controllers.delete_reported_story_by_admin)
router.get("/get-single-reported-story/:story_id",user_controllers.get_reported_story_by_admin)





module.exports=router