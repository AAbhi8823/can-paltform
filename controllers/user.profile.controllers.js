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

/**
 * add user profile/role  api
 * This api will add the user profile/role like "Veteran", "Caregiver", afetr signup the user not Fighter
 * This api will run after signup as Fighter no 2nd profile can be added as Fighter it will be added as root user
 * This api will add Caregive and Veteran profile only
 *
 * */

exports.add_user_profile = [
  login_validator,
  upload.single("profile_image"),
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
      // Check if the user exists
      const user_found = await user_model.findOne({
        phone_number: req.user.user.phone_number,
      });
      console.log("line 150", user_found);
      //Now because of the root user is already added so we can add the other user profile
      if (user_found.user_profile.length >= 3) {
        return apiResponse.validationErrorWithData(
          res,
          "You can not create more than 3 profiles. Please take our premium plan to create more profiles"
        );
      }
      //check if the user profile is already added or not
      if (
       ( user_found.user_profile == "Fighter" || user_found.user_profile=="Caregiver")&&
        user_found._id == req.user.user._id
      ) {
        if (
          req.body.profile_role == "Veteran" ||
          req.body.profile_role == "Caregiver"
        ) {
          /**
           * Now take the user details full_name,gender,_date_of_birth and save then procceed further for profile_image and pin
           */
          if (!req.body.full_name) {
            return apiResponse.validationErrorWithData(
              res,
              "Provide full name"
            );
          }
          if (!req.body.gender) {
            return apiResponse.validationErrorWithData(res, "Provide gender");
          }
          if (!req.body.date_of_birth) {
            return apiResponse.validationErrorWithData(
              res,
              "Provide date of birth"
            );
          }
          //now save the details in user_profile array
          const user_profile = {
            full_name: req.body.full_name,
            profile_role: req.body.profile_role,
            gender: req.body.gender,
            date_of_birth: req.body.date_of_birth,
          };
          // now save the user profile in user_profile array and save the user
          // user_found.user_profile.unshift(user_profile);
          // const user_found_updated = await user_found.save();

          if (!req.file) {
            const profile_image_url = null;
          } else {
            var profile_image_url = await aws.single_file_upload(
              req.file.buffer,
              req.file.originalname
            );
          }

          //check for pin validation
          if (!validator.validatePin(req.body.pin)) {
            return apiResponse.validationErrorWithData(
              res,
              "Provide 4 digit number for profile access pin"
            );
          }
          if (!validator.validatePin(req.body.confirm_pin)) {
            return apiResponse.validationErrorWithData(
              res,
              "Provide valid confirm pin "
            );
          }
          if (req.body.pin !== req.body.confirm_pin) {
            return apiResponse.validationErrorWithData(
              res,
              "Pin and confirm pin does not match"
            );
          }
          const hashed_pin = await bcrypt.hash(req.body.pin, 10);
          //upload the profile image to s3 bucket
          //if image is not uploaded then store null in profile image

          console.log("line 64", profile_image_url);
          //update the root user profile and pin and save it
          user_found.user_profile.unshift({
            full_name: req.body.full_name,
            profile_role: req.body.profile_role,
            pin: hashed_pin,
            profile_image: profile_image_url,
            //mobile: req.body.mobile,
            date_of_birth: req.body.date_of_birth,
          });
          const saved_user_profile_profile = await user_found.save();
          saved_user_profile_profile.user_profile[0].pin = undefined;
          return apiResponse.successResponseWithData(
            res,
            "User profile added successfully",
            saved_user_profile_profile.user_profile[0]
          );
        }

        //   if (!req.body.profile_role) {
        //     return apiResponse.validationErrorWithData(
        //       res,
        //       "Provide profile role"
        //     );
        //   }
        //   if (req.body.profile_role == "Fighter") {
        //     return apiResponse.validationErrorWithData(
        //       res,
        //       "You can not create fighter profile again"
        //     );
        //   }
        //   if (!validator.validatePin(req.body.pin)) {
        //     return apiResponse.validationErrorWithData(
        //       res,
        //       "Provide 4 digit number for profile access pin"
        //     );
        //   }
        //   if (!validator.validatePin(req.body.confirm_pin)) {
        //     return apiResponse.validationErrorWithData(
        //       res,
        //       "Provide valid confirm pin "
        //     );
        //   }
        //   if (req.body.pin !== req.body.confirm_pin) {
        //     return apiResponse.validationErrorWithData(
        //       res,
        //       "Pin and re-entered pin does not match"
        //     );
        //   }
        //   //upload the profile image to s3 bucket
        //   //if image is not uploaded then store null in profile image
        //   if (!req.file) {
        //     const profile_image_url = null;
        //   } else {
        //     const profile_image_url = await aws.single_file_upload(
        //       req.file.buffer,
        //       req.file.originalname
        //     );
        //   }
        //   console.log("line 64", profile_image_url);
        //   //update the root user profile and pin and save it
        //   user_found.user_profile.unshift({
        //     full_name: req.body.full_name,
        //     profile_role: req.body.profile_role,
        //     pin: hashed_pin,
        //     profile_image: profile_image_url,
        //     //mobile: req.body.mobile,
        //     date_of_birth: req.body.date_of_birth,
        //   });
        //   const saved_user_profile_profile = await user_found.save();
        //   saved_user_profile_profile.password = undefined;
        //   console.log("line 73", saved_user_profile_profile);
        //   return apiResponse.successResponseWithData(
        //     res,
        //     "User profile added successfully",
        //     saved_user_profile_profile.user_profile[0]
        //   );
        // } else {
        //   return apiResponse.validationErrorWithData(
        //     res,
        //     "Create  user profile as Fighter first"
        //   );
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
console.log("line 189", user_found);  
      if (!user_found) {
        return apiResponse.validationErrorWithData(res, "User not found");
      }

      // Check if the user profile exists
      // if (user_found.user_profile.length === 0) {
      //   return apiResponse.validationErrorWithData(
      //     res,
      //     "User profile not found"
      //   );
      // }
      console.log("line 201", user_found);
      //pin login for root user profile and then return the user profile login successfully
      if (
        user_found.user_profile == "Fighter" &&
        user_found._id == req.body.profile_id
      ) {
        if (!req.body.pin) {
          return apiResponse.validationErrorWithData(
            res,
            "Provide 4 digit number for profile access pin"
          );
        } else if (req.body.pin) {
          const valid_pin = await bcrypt.compare(req.body.pin, user_found.pin);
          if (valid_pin) {
            user_found.password = undefined;
            user_found.pin = undefined;
            user_found.user_profile = undefined;
            return apiResponse.successResponseWithData(
              res,
              "User Logged in Successfully.",
              user_found
            );
          }else{
            return apiResponse.validationErrorWithData(res, "Invalid pin");
          }
        }
      } else {
        const user_profile_found = user_found.user_profile.find(
          (profile) => profile._id == req.body.profile_id
        );
        // console.log("line 201", user_profile_found);
        // console.log("line 201", user_profile_found.pin, req.body.pin);
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
      }
      // Find the user profile with the provided PIN
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
