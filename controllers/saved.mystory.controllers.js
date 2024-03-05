/**
 * This controller is used to handle the saved mystory related operations
 *
 */
const apiResponse = require("../helpers/apiResponse");
const { validationResult } = require("express-validator");
const saved_story_model = require("../models/saved.mystory.model");
const mystory_model = require("../models/mystory.model");
const user_model = require("../models/user.model");
// const mongoose = require("mongoose");
// const ObjectId = mongoose.Types.ObjectId;

// Save the mystory
exports.save_mystory = [
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
      const { mystory_id } = req.body;
      const user_id = req.user.user._id;
      const mystory = await mystory_model.findById(mystory_id);
      if (!mystory) {
        return apiResponse.notFoundResponse(res, "Mystory not found");
      }
      //check if the mystory is already saved
      const user = await user_model.findById(user_id);
      if (!user) {
        return apiResponse.notFoundResponse(res, "User not found");
      }
      const saved_mystory = new saved_story_model({
        mystory_id: mystory_id,
        user_id: user_id,
      });
      const saved = await saved_mystory.save();
      return apiResponse.successResponseWithData(res, "Mystory Saved", saved);
    } catch (err) {
      return apiResponse.serverErrorResponse(
        res,
        "Server Error...!",
        err.message
      );
    }
  },
];
