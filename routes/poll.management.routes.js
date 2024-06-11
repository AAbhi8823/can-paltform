const router=require("express").Router()

const poll_management_controller=require("../controllers/poll.management.controllers")  

//Routes
router.post("/add-poll",poll_management_controller.create_poll)
router.get("/get-poll-list",poll_management_controller.get_poll_list )
router.get("/get-poll-by-id/:poll_id",poll_management_controller.get_poll_by_id)
router.put("/update-poll/:poll_id",poll_management_controller.update_poll)
router.delete("/delete-poll/:poll_id",poll_management_controller.delete_poll_by_id)


//Votes Routes
router.post("/add-vote",poll_management_controller.vote_poll_option)
router.get("/get-votes-list/:poll_id",poll_management_controller.get_poll_results)




module.exports=router
