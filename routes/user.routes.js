const router=require("express").Router()

const user_controllers=require("../controllers/user.controllers")



//USER ROUTES
router.post("/user-register",user_controllers.add_user)
router.post("/verify-user",user_controllers.verify_user)
router.post("/user-login",user_controllers.login_user)



module.exports=router