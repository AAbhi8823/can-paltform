const router=require("express").Router()

const comment_controllers=require("../controllers/comment.controllers")

//Routes for comments
router.post("/add-comment",comment_controllers.add_comment)
router.post("/get-comments",comment_controllers.get_comments)

module.exports=router

