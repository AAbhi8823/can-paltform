const router=require("express").Router()

const comment_controllers=require("../controllers/comment.controllers")

//Routes for comments
router.post("/add-comment",comment_controllers.add_comment)
router.post("/get-comments",comment_controllers.get_comments)
router.delete("/delete-comment/:comment_id",comment_controllers.delete_comment)
router.patch("/update-comment/:comment_id",comment_controllers.update_comment)

module.exports=router

