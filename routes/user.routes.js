const router=require("express").Router()

const user_controllers=require("../controllers/user.controllers")



//USER ROUTES
router.post("/user-register",user_controllers.add_user)
router.post("/verify-user",user_controllers.verify_user)
router.post("/user-login",user_controllers.login_user)
router.get("/get-root-user",user_controllers.get_root_user_profile)

//Password reset
router.post("/user-password-reset",user_controllers.reset_password)
//router.post("/user-password-reset-pin",user_controllers.reset_password_pin)
router.post("/admin-block-root-user",user_controllers.block_root_user_profile )
router.post("/block-user",user_controllers.block_user_profile )

router.post("/user-profile-pin-reset",user_controllers.reset_pin)



module.exports=router