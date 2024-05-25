const router=require("express").Router()

const user_controllers=require("../controllers/user.controllers")



//USER ROUTES
router.post("/user-register",user_controllers.add_user)
router.post("/verify-user",user_controllers.verify_user)
router.post("/user-login",user_controllers.login_user)
router.get("/get-user-profile",user_controllers.get_user_profile)
router.patch("/update-user-profile",user_controllers.update_user_profile)

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



module.exports=router