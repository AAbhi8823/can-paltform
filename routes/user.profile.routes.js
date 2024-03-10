const router=require("express").Router()

const userprofile_controller=require("../controllers/user.profile.controllers")

//USER PROFILE ROUTES
router.post("/add-user-profile",userprofile_controller.add_user_profile)
//router.get("/get-user-profile",userprofile_controller.get_user_profile)
router.get("/get-user-profile-list",userprofile_controller.get_user_profile_list)
router.post("/user-profile-login",userprofile_controller.user_profile_login)
router.post("/user-profile-login-pin",userprofile_controller.user_profile_login_pin)
router.put("/update-user-profile",userprofile_controller.update_user_profile)



module.exports=router

