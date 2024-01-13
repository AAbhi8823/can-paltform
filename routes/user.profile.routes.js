const router=require("express").Router()

const userprofile_controller=require("../controllers/user.profile.controllers")

//USER PROFILE ROUTES
router.post("/add-user-profile",userprofile_controller.add_user_profile)



module.exports=router

