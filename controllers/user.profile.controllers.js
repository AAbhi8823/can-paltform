/**
 * This is the user profile controllers
 * There are three profiles for the user 1. veteran,
2.caregiver, or 3.fighter. after signup the user
 */

const user_model = require("../models/user.model");
const apiResponse = require("../response/apiResponse");
const { validationResult } = require("express-validator");
const userprofile_model = require("../models/user.model");
const bcrypt = require("bcrypt");
const login_validator =
  require("../middlewares/jwt.auth.middleware").authentication;
const aws = require("../helpers/aws.s3");
const multer = require("multer");

//multer storage
const upload = multer({ storage: multer.memoryStorage() });

// add user profile/role

exports.add_user_profile = [
  login_validator,
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
      if (!req.user.CANID) {
        return apiResponse.validationErrorWithData(res, "CANID is required!");
      }
      if (!req.user.profile_name) {
        return apiResponse.validationErrorWithData(
          res,
          "Profile name is required"
        );
      }

      // Check if the user exists
      const user_found = await user_model.findOne({
        CANID: req.body.CANID,
      });

      console.log("line 55", user_found.user_profile.length);

      if (user_found.user_profile.length == 0) {
        // take the user profile deatail from the teh verified user or root user to create user profile and save it and send the response
        
        // Save the health record
        user_found.user_profile.unshift({
          profile_name: user_found.full_name,
          profile_role: req.body.profile_role,
          pin: req.body.pin,
          profile_image: req.body.profile_image,
          mobile: user_found.phone_number,
          date_of_birth: user_found.date_of_birth,
        });
        const saved_user_profile = await user_found.save();
        console.log("line 73", saved_user_profile);
        saved_user_profile.password = undefined;
        saved_user_profile.user_profile[0].pin = undefined;

        return apiResponse.successResponseWithData(
          res,
          "User profile added successfully",
          saved_user_profile.user_profile[0]
        );
        
      }

      // Upload document to S3 bucket
      const profile_image_url = await aws.single_file_upload(
        req.file.buffer,
        req.file.originalname
      );
      console.log("line 64", profile_image_url);
      //hash the pin and insert
      const hashed_pin = await bcrypt.hash(req.body.pin, 10);

      //if user is available  then push user profile in user_profile array and save the user_found
      user_found.user_profile.unshift({
        profile_name: req.body.profile_name,
        profile_role: req.body.profile_role,
        pin: hashed_pin,
        profile_image: profile_image_url,
        mobile: req.body.mobile,
        date_of_birth: req.body.date_of_birth,
      });

      // Save the health record
      const saved_user_profile = await user_found.save();
      console.log("line 73", saved_user_profile);
      saved_user_profile.password = undefined;
      saved_user_profile.user_profile[0].pin = undefined;

      return apiResponse.successResponseWithData(
        res,
        "User profile added successfully",
        saved_user_profile.user_profile[0]
      );
    } catch (err) {
      console.log("line 80", err);
      return apiResponse.serverErrorResponse(
        res,
        "Server Error...!",
        err.message
      );
    }
  },
];
