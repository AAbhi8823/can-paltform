/**
 * This is the user profile controllers
 * There are three profiles for the user 1. veteran,
2.caregiver, or 3.fighter. after signup the user
 */

const user_model = require("../models/user.model");
const apiResponse = require("../response/apiResponse");
const { validationResult } = require("express-validator");
const userprofile_model = require("../models/user.profile.models");
const aws = require("../helpers/aws.s3");
const multer = require("multer");

//multer storage
const upload = multer({ storage: multer.memoryStorage() });

// add user profile/role

exports.add_user_profile = [
  upload.single("profile_image"),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!req.file || !req.file.buffer || !req.file.originalname) {
        return apiResponse.validationErrorWithData(
          res,
          "Invalid file format or missing file"
        );
      }
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      }
      if (!req.body.CANID) {
        return apiResponse.validationErrorWithData(res, "CANID is required!");
      }
      if (!req.body.profile_name) {
        return apiResponse.validationErrorWithData(
          res,
          "Profile name is required"
        );
      }

      // Check if the user exists
      const user_found = await user_model.findOne({
        CANID: req.body.CANID,
      });

      if (!user_found) {
        return apiResponse.validationErrorWithData(res, "User not found");
      }

      // Upload document to S3 bucket
      const profile_image_url = await aws.single_file_upload(
        req.file.buffer,
        req.file.originalname
      );
      console.log("line 64", profile_image_url);
      // Create new health record
      const user_profile = new userprofile_model({
        CANID: req.body.CANID,
        profile_name: req.body.profile_name,
        profile_image_url: profile_image_url,
      });
      

      // Save the health record
      const saved_user_profile = await user_profile.save();
      console.log("line 73", saved_user_profile);

      return apiResponse.successResponseWithData(
        res,
        "User profile added successfully",
        saved_user_profile
      );
    } catch (err) {
      console.log("line 80", err);
      return apiResponse.ErrorResponse(res, err);
    }
  },
];
