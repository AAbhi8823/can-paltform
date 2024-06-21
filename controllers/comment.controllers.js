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
      var story = await mystory_model.findById(story_id)//.populate("user_id");
      const user_found= await user_model.findOne({_id:user_id});
      console.log("line 25",user_id, user_found);
      if (!story) {
        return res.status(404).json({ msg: "Story not found" });
      }
      console.log("line 27", user_found.profile_image);
      const new_comment = new comment_model({
      
        name: req.user.user.full_name,
        user_profile: req.user.user.user_profile,
        profile_image:user_found.profile_image,
        comment,
        user_id,
        CANID,
        story_id,
      });
      await new_comment.save();
      // Add comment to story comments array
      
      story.comments.unshift(new_comment);
      const comment_saved = await story.save();

      // Send response to the client
      return res.status(201).json({
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

/**
 * Delete comment API
 * In this API user can delete his/her comment
 */

exports.delete_comment = [
  login_validator,
  async (req, res) => {
    try {
      const { comment_id } = req.params;
      const comment = await comment_model.findById(comment_id);
      if (!comment) {
        return res.status(404).json({ 
          status: false,
          message: "Comment not found",
         });
      }
      if (comment.user_id.toString() !== req.user.user._id.toString()) {
        return res.status(401).json({
          status: false,
          message: "User not authorized",
        });
      }
      await comment.remove();
      //delete comment from story comments array also
      const story = await mystory_model.comments.find({_id:comment.story_id});
      story.comments = story.comments.filter(
        (comment) => comment._id.toString() !== comment_id
      );
      await story.save();

      res.status(200).json({ 
        status: true,
        message: "Comment deleted successfully",
       // data: story.comments,
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({
        status: false,
        message: "Server error",
        error: err.message,
      });
    }
  },
];

/**
 * Update comment API
 * In this API user can update his/her comment
 */

exports.update_comment = [
  login_validator,
  async (req, res) => {
    try {
      const { comment_id } = req.params;
      const { comment } = req.body;
      const comment_found = await comment_model.findById(comment_id);
      if (!comment_found) {
        return res.status(404).json({
          status: false,
          message: "Comment not found",
        
        });
      }
      if (comment_found.user_id.toString() !== req.user.user._id.toString()) {
        return res.status(401).json({
          status: false,
          message: "User not authorized",
        });
      }
      comment_found.comment = comment;
      await comment_found.save();
      res.status(200).json({
        status: true,
        message: "Comment updated successfully",
        data: comment_found,
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({
        status: false,
        message: "Server error",
        error: err.message,
      });
    }
  },
];
