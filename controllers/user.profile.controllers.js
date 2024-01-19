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
const validator = require("../validators/validator");

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
//
     
      if (req.body.profile_role=="Veteran" || req.body.profile_role== "Caregiver" || req.body.profile_role=="Fighter") {
        if (!validator.validatePin(req.body.pin)) {
          return apiResponse.validationErrorWithData(res, "Provide 4 digit number for profile access pin");
        }
        if(!validator.validatePin(req.body.re_enter_pin)){
          return apiResponse.validationErrorWithData(res, "Provide valid re-enter pin ");
        }
        if (req.body.pin !== req.body.re_enter_pin) {
          return apiResponse.validationErrorWithData(
            res,
            "Pin and re-entered pin does not match"
          );
        }
        
      }else{
        return apiResponse.validationErrorWithData(res, "Invalid profile role");
      }

     
      
      //

      // Check if the user exists
      const user_found = await user_model.findOne({
        phone_number: req.body.phone_number,
      });

      console.log("line 55", user_found);

      if (user_found.user_profile.length == 0) {
        // take the user profile deatail from the teh verified user or root user to create user profile and save it and send the response

        // Save the health record
        user_found.user_profile.unshift({
          profile_name: user_found.full_name,
          profile_role: req.body.profile_role,
          pin: req.body.pin,
          profile_image: req.body.profile_image,
          phone_number: user_found.phone_number,
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

// get user profile list
exports.get_user_profile_list = [
  login_validator,
  async (req, res) => {
    try {
      // Check if the user exists
      const user_found = await user_model.findOne({
        phone_number: req.user.phone_number,
      });
      console.log("line 142", user_found);

      if (user_found.user_profile.length == 0) {
        return apiResponse.validationErrorWithData(
          res,
          "User profile not found"
        );
      }

      return apiResponse.successResponseWithData(
        res,
        "User profile list",
        user_found.user_profile
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

/** User profile login API
 * After successfully loggeding using credintials like email/phone number user
 * login to their created user profinles like "Veteran", "Caregiver", "Fighter" using 4 digit pin
 */

exports.user_profile_login = [
  login_validator,
  async (req, res) => {
    try {
      // Check if the user exists
      const user_found = await user_model.findOne({
        phone_number: req.user.phone_number,
      });
      console.log("line 142", user_found);

      if (user_found.user_profile.length == 0) {
        return apiResponse.validationErrorWithData(
          res,
          "User profile not found"
        );
      }
      // Check if the user profile exists
      const user_profile_found = user_found.user_profile.find(
        (profile) => profile.pin == req.body.pin
      );
      console.log("line 142", user_profile_found);

      if (!user_profile_found) {
        return apiResponse.validationErrorWithData(
          res,
          "User profile not found"
        );
      }

      return apiResponse.successResponseWithData(
        res,
        "User Loggedin Successfully.",
        user_profile_found
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
