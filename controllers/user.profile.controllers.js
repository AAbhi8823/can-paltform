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
      //check user_profile is epmty or not if empty then add root_user and if root_user is already added then add other user profile in user_profile array

      const root_user_found = await user_model.findOne({
        phone_number: req.user.user.phone_number,
      });
      if (root_user_found.root_user == null) {
        //save the root user profile is Fighter
        const root_user_role = req.body.profile_role;
        if (root_user_role == "Fighter") {
          // Save the health record
          //check for pin validation
          if (!validator.validatePin(req.body.pin)) {
            return apiResponse.validationErrorWithData(
              res,
              "Provide 4 digit number for profile access pin"
            );
          }
          if (!validator.validatePin(req.body.re_enter_pin)) {
            return apiResponse.validationErrorWithData(
              res,
              "Provide valid re-enter pin "
            );
          }
          if (req.body.pin !== req.body.re_enter_pin) {
            return apiResponse.validationErrorWithData(
              res,
              "Pin and re-entered pin does not match"
            );
          }
          const hashed_pin = await bcrypt.hash(req.body.pin, 10);
          //upload the profile image to s3 bucket
          const profile_image_url = await aws.single_file_upload(
            req.file.buffer,
            req.file.originalname
          );
          console.log("line 64", profile_image_url);

          //update the root user profile and pin and save it
          root_user_found.root_user = req.body.profile_role;
          root_user_found.pin = hashed_pin;
          root_user_found.profile_image = profile_image_url;
          const saved_root_user_profile = await root_user_found.save();
          saved_root_user_profile.password = undefined;
          saved_root_user_profile.pin = undefined;
          return apiResponse.successResponseWithData(
            res,
            "User profile added successfully",
            saved_root_user_profile
          );
        } else {
          return apiResponse.validationErrorWithData(
            res,
            "Create  user profile as Fighter first"
          );
        }
      } else {
        //save the other user profile
        // Upload document to S3 bucket
        const profile_image_url = await aws.single_file_upload(
          req.file.buffer,
          req.file.originalname
        );
        console.log("line 64", profile_image_url);
        //hash the pin and insert
        if (!validator.validatePin(req.body.pin)) {
          return apiResponse.validationErrorWithData(
            res,
            "Provide 4 digit number for profile access pin"
          );
        }
        if (!validator.validatePin(req.body.re_enter_pin)) {
          return apiResponse.validationErrorWithData(
            res,
            "Provide valid re-enter pin "
          );
        }
        if (req.body.pin !== req.body.re_enter_pin) {
          return apiResponse.validationErrorWithData(
            res,
            "Pin and re-entered pin does not match"
          );
        }
        //check role can not be fighter again in user_profile array

        if (req.body.profile_role == "Fighter") {
          return apiResponse.validationErrorWithData(
            res,
            "You can not create fighter profile again"
          );
        }
        //check if profile size in user_profile array is greater than 3 then redirect to upgrade the premium plan
        if (root_user_found.user_profile.length >= 3) {
          return apiResponse.validationErrorWithData(
            res,
            "You can not create more than 3 profiles. Please take our premium plan to create more profiles"
          );
        }
        //hash the pin and insert

        const hashed_pin = await bcrypt.hash(req.body.pin, 10);
        //if user is available  then push user profile in user_profile array and save the user_found
        root_user_found.user_profile.unshift({
          profile_name: req.body.profile_name,
          profile_role: req.body.profile_role,
          pin: hashed_pin,
          profile_image: profile_image_url,
          //mobile: req.body.mobile,
          date_of_birth: req.body.date_of_birth,
        });
        // Save the health record
        const saved_user_profile = await root_user_found.save();
        console.log("line 73", saved_user_profile);
        saved_user_profile.password = undefined;
        saved_user_profile.user_profile[0].pin = undefined;

        return apiResponse.successResponseWithData(
          res,
          "User profile added successfully",
          saved_user_profile.user_profile[0]
        );
      }
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
      console.log("line 146", req.user.user.phone_number);

      // Check if the user exists
      const user_found = await user_model
        .findOne({
          phone_number: req.user.user.phone_number,
        })
        .select("-user_profile.pin");
      console.log("line 150", user_found);

      // if (user_found.user_profile.length == 0) {
      //   return apiResponse.validationErrorWithData(
      //     res,
      //     "User profile not found"
      //   );
      // }

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
      //console.log("line 1185", req.user.user.phone_number);
      const user_found = await user_model.findOne({
        phone_number: req.user.user.phone_number,
      });
      console.log("line 189", user_found);
      //get all canid
      let can_ids = user_found.user_profile.map((ele) => ele.CANID);
      console.log("line 194", can_ids);

      if (user_found.user_profile.length == 0) {
        return apiResponse.validationErrorWithData(
          res,
          "User profile not found"
        );
      }
      //fetc the user's profiles list
      // const user_profile=await user_model.findOne({

      // })

      // Check if the user profile exists
      // const user_profile_found = user_found.user_profile.find(
      //   (profile) => profile.pin == req.body.pin
      // );
      //console.log("line 201", user_profile_found);

      // if (!user_profile_found) {
      //   return apiResponse.validationErrorWithData(
      //     res,
      //     "User profile not found"
      //   );
      // }

      return apiResponse.successResponseWithData(
        res,
        "User Loggedin Successfully.",
        user_found
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

//user profile login usin 4 digit pin
exports.user_profile_login_pin = [
  login_validator,
  async (req, res) => {
    try {
      // Check if the user exists
      const user_found = await user_model.findOne({
        phone_number: req.user.user.phone_number,
      });

      if (!user_found) {
        return apiResponse.validationErrorWithData(res, "User not found");
      }

      // Check if the user profile exists
      if (user_found.user_profile.length === 0) {
        return apiResponse.validationErrorWithData(
          res,
          "User profile not found"
        );
      }
      console.log("line 201", user_found.pin);

      // Find the user profile with the provided PIN
      const user_profile_found = user_found.user_profile.find(
        (profile) => profile._id == req.body.profile_id
      );
      console.log("line 201", user_profile_found);
      console.log("line 201", user_profile_found.pin, req.body.pin);
      if (user_profile_found._id == req.body.profile_id) {
        if (!req.body.pin) {
          return apiResponse.validationErrorWithData(
            res,
            "Provide 4 digit number for profile access pin"
          );
        } else if (req.body.pin) {
          const valid_pin = await bcrypt.compare(
            req.body.pin,
            user_profile_found.pin
          );
          if (valid_pin) {
            // user_found.password = undefined;
            user_found.user_profile[0].pin = undefined;

            return apiResponse.successResponseWithData(
              res,
              "User Logged in Successfully.",
              user_profile_found
            );
          } else {
            return apiResponse.validationErrorWithData(res, "Invalid pin");
          }
        } else {
          return apiResponse.validationErrorWithData(res, "Invalid pin");
        }
      }

      //now compare the pin and check if it is valid or not and then return the user profile login successfully

      // User logged in successfully
    } catch (err) {
      console.log("Error:", err);
      return apiResponse.serverErrorResponse(res, "Server Error", err.message);
    }
  },
];

//update user profile

exports.update_user_profile = [
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

      // Check if the user exists
      const user_found = await user_model.findOne({
        phone_number: req.user.user.phone_number,
      });

      if (user_found.user_profile.length == 0) {
        return apiResponse.validationErrorWithData(
          res,
          "User profile not found"
        );
      }

      // Upload document to S3 bucket
      const profile_image_url = await aws.single_file_upload(
        req.file.buffer,
        req.file.originalname
      );
      console.log("line 64", profile_image_url);

      //if user is available  then push user profile in user_profile array and save the user_found
      user_found.user_profile.unshift({
        profile_name: req.body.profile_name,
        profile_role: req.body.profile_role,
        pin: req.body.pin,
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
