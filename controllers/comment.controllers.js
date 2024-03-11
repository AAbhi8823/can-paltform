/**
 * Comment controlers
 */
const comment_model = require("../models/comments.model");
const user_model = require("../models/user.model");
const mystory_model = require("../models/mystory.model");
const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const login_validator =
  require("../middlewares/jwt.auth.middleware").authentication;

  exports.add_comment = [
    login_validator,
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      try {
        const { comment, story_id } = req.body;
        const user_id = req.user.user._id;
        const CANID = req.user.user.CANID;
        const story = await mystory_model.findById(story_id);
        if (!story) {
          return res.status(404).json({ msg: "Story not found" });
        }
        const new_comment = new comment_model({
          comment,
          user_id,
          CANID,
          story_id,
        });
        await new_comment.save();
        story.comments.unshift(new_comment);
        const comment_saved = await story.save();


        // Send response to the client
        return res
          .status(201)
          .json({
            status: true,
            message: "Comment added successfully",
            data: comment_saved.comments,
          });
      } catch (err) {
        console.error(err.message);
        res
          .status(500)
          .json({ status: false, msg: "Server error", error: err.message });
      }
    },
  ];
  
//Get Comments list API

exports.get_comments = [
  // login_validator,
  async (req, res) => {
    try {
      const story_id = req.body.story_id;
      const story = await mystory_model.findById(story_id);
      if (!story) {
        return res.status(404).json({ msg: "Story not found" });
      }
      const comments = await comment_model.find({ story_id: story_id });
      res
        .status(200)
        .json({ status: true, message: "Comments list", data: comments });
    } catch (err) {
      console.error(err.message);

      res.status(500).json({ msg: "Server error" });
    }
  },
];
