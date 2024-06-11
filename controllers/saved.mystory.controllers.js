/**
 * This controller is used to handle the saved mystory related operations
 *
 */
const apiResponse = require("../response/apiResponse");
const { validationResult } = require("express-validator");
const saved_story_model = require("../models/saved.mystory.model");
const mystory_model = require("../models/mystory.model");
const login_validator =
  require("../middlewares/jwt.auth.middleware").authentication;
const user_model = require("../models/user.model");
const { path } = require("../routes/api");
// const mongoose = require("mongoose");
// const ObjectId = mongoose.Types.ObjectId;

// Save the mystory
exports.save_mystory = [
  login_validator,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      }
      const story_id = req.body.story_id;
      console.log("line 28", story_id);
      const user_id = req.user.user._id;
      const mystory = await mystory_model.findById(story_id);
      if (!mystory) {
        return apiResponse.notFoundResponse(res, "Story not found");
      }
      //check if the mystory is already saved
      const user = await user_model.findById(user_id);
      if (!user) {
        return apiResponse.notFoundResponse(res, "User not found");
      }
      const saved_mystory = new saved_story_model({
        story_id: story_id,
        user_id: user_id,
      });

      //Now chek the saved mystory is already saved then remove it if not then save it
      const saved_found = await saved_story_model.findOne({
        story_id: story_id,
        user_id: user_id,
      });
      if (saved_found) {
        const deleted = await saved_story_model.findOneAndDelete({
          story_id: story_id,
          user_id: user_id,
        });
        return apiResponse.successResponseWithData(
          res,
          "Mystory Unsaved",
         // deleted
        );
      }

      const saved_new_story = await saved_mystory.save();
      return apiResponse.successResponseWithData(
        res,
        "Mystory Saved",
        saved_new_story
      );
    } catch (err) {
      return apiResponse.serverErrorResponse(
        res,
        "Server Error...!",
        err.message
      );
    }
  },
];

// // Unsave the mystory
// exports.unsave_mystory = [
//   async (req, res) => {
//     try {
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return apiResponse.validationErrorWithData(
//           res,
//           "Validation Error.",
//           errors.array()
//         );
//       }
//       const { mystory_id } = req.body;
//       const user_id = req.user.user._id;
//       const mystory = await mystory_model.findById(mystory_id);
//       if (!mystory) {
//         return apiResponse.notFoundResponse(res, "Mystory not found");
//       }
//       //check if the mystory is already saved
//       const user = await user_model.findById(user_id);
//       if (!user) {
//         return apiResponse.notFoundResponse(res, "User not found");
//       }
//       const saved = await saved_story_model.findOneAndDelete({
//         mystory_id: mystory_id,
//         user_id: user_id,
//       });
//       if (!saved) {
//         return apiResponse.notFoundResponse(res, "Mystory not saved");
//       }
//       return apiResponse.successResponseWithData(res, "Mystory Unsaved", saved);
//     } catch (err) {
//       return apiResponse.serverErrorResponse(
//         res,
//         "Server Error...!",
//         err.message
//       );
//     }
//   },
// ];

// Get the saved mystories
exports.get_saved_mystories = [
  login_validator,
  async (req, res) => {
    try {
      const user_id = req.user.user._id;
      const user = await user_model.findById(user_id);
      console.log("line 28", user);
      if (!user) {
        return apiResponse.notFoundResponse(res, "User not found");
      }
      const saved_mystories = await saved_story_model
        .find({
          user_id: user_id,
        })
        .populate("story_id");
      if (!saved_mystories) {
        return apiResponse.notFoundResponse(res, "No saved mystories found");
      }
      return apiResponse.successResponseWithData(
        res,
        "Saved Mystories",
        saved_mystories
      );
    } catch (err) {
      // return apiResponse.serverErrorResponse(
      //   res,
      //   "Server Error...!",
      //   err.message
      // );
      return res.status(500).json({
        status: false,
        message: "Server error",
        error: err.message,
        path: path,
      });
    }
  },
];

/**
 * Get the saved mystory by id
 */

exports.get_saved_mystory_by_id = [
  login_validator,
  async (req, res) => {
    try {
      const { saved_story_id } = req.params;
      console.log("line 28", saved_story_id);
      const user_id = req.user.user._id;
      const user = await user_model.findById(user_id);
      if (!user) {
        return apiResponse.notFoundResponse(res, "User not found");
      }
      const saved_story = await saved_story_model
        .findOne({
          story_id: saved_story_id,
          user_id: user_id,
        })
        .populate("story_id");
      if (!saved_story) {
        return apiResponse.notFoundResponse(res, "No saved mystory found");
      }
      return apiResponse.successResponseWithData(
        res,
        "Saved Mystory",
        saved_story
      );
    } catch (err) {
      return apiResponse.serverErrorResponse(
        res,
        "Server Error...!",
        err.message
      );
    }
  },
];
