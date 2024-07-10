/**
 * User conrollers
 * There are 3type of user in this project 
 * 1,veteran, 2.caregiver 3.fighter
 * 
 * Sign up --------------
 * ● In order to create a account user will enter the
following details
○ Full Name
○ Phone no
○ Email Address
○ Gender
○ Date of Birth
● After filling above details, users are required to check
the Terms and Conditions (T&C) box and proceed by
clicking on the "Continue" (CTA). Subsequently, users
will receive an OTP via Phone no, which they must
enter for verification.
● After successfully submitting the OTP, users proceed
to create and confirm their password, finalizing the
account setup process.
● Upon successful sign-up, users are prompted to
create a profile by selecting their role as a veteran,
caregiver, or fighter. Following this selection, users
can proceed by clicking on the "Continue"
call-to-action (CTA).
● Once on the next screen, users are prompted to
upload an image for their profile, with the option to
skip this step using the provided skip button.
Subsequently, users are required to create a
personal identification number (PIN), concluding the
profile creation process.
● Note: You can create 3 profile for free and other
profile for addon Price (Admin wants to flexibility to
provide flexibility to change the access for no of
profile free 

login ● ---------------
To log in, USer is suppose to feed the credentials to
login then users must select the profiles they have
created and enter the corresponding PINs. This step
ensures secure access to the platform.
● Once the PIN is entered, users are seamlessly
redirected to the community web app, enhancing
the login experience for effortless engagement.

 * 
 */
const user_model = require("../models/user.model");

const { express_validators } = require("express-validator");
const { validationResult } = require("express-validator");
const apiResponse = require("../response/apiResponse");
const sendMobile_OTP = require("../helpers/helpers").sendOTP;
const validator = require("../validators/validator");
const login_validator =
  require("../middlewares/jwt.auth.middleware").authentication;
const otp_generator = require("../helpers/helpers").generateOTP;
const admin_validator =
  require("../middlewares/admin.auth.middleware").adminAuthenticate;

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const config = require("../config/config");
const dotenv = require("dotenv");
const { generateOTP } = require("../helpers/helpers");
dotenv.config();
const multer = require("multer");
const aws = require("../helpers/aws.s3");
const { use, report } = require("../routes/user.routes");
const helpers = require("../helpers/helpers");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const subscription_plan_model = require("../models/subcription.plan.model");
const reported_story_model = require("../models/reported.users.models");
const mystory_model = require("../models/mystory.model");
const upload = multer({ storage: multer.memoryStorage() });
/**
 *  Create/ Register User API
 *  
/
/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */

exports.add_user = [
  upload.single("profile_image"),
  async (req, res) => {
    try {
      // Express validator
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      // End Express validator

      // Destructuring request body
      const {
        full_name,
        phone_number,
        email,
        gender,
        date_of_birth,
        agreed_To_Terms,
        otp,
        // password,
        // confirm_password,
        user_profile,
      } = req.body;
      console.log("line 97", full_name, phone_number, gender);
      console.log("line 109", req.body.otp);
      // validation for empty body
      if (!otp) {
        if (!full_name) {
          return res
            .status(400)
            .json({ status: false, msg: "Full name is required" });
        }
        if (!email) {
          return res
            .status(400)
            .json({ status: false, msg: "Email is required" });
        }
        if (!phone_number) {
          return res.status(400).json({
            status: false,
            msg: "Phone is required for registration",
          });
        }

        if (!gender) {
          return res
            .status(400)
            .json({ status: false, message: " Gender is required" });
        }
        if (!date_of_birth) {
          return res
            .status(400)
            .json({ status: false, message: " Date of birth is required" });
        }
        if (!agreed_To_Terms) {
          return res.status(400).json({
            status: false,
            message: " Please Agreed to terms and condition before proceed! ",
          });
        }

        // Validation of fields
        if (
          !validator.validatePhoneNumber(phone_number) &&
          !validator.validateEmail(email)
        ) {
          return apiResponse.validationErrorWithData(
            res,
            "Invalid email or mobile"
          );
        }
        // if (!validator.validateEmail(email)) {
        //   return apiResponse.validationErrorWithData(res, "Invalid email");
        // }

        // Check if user already exists

        const user_found = await user_model.findOne({
          $or: [
            {
              phone_number: phone_number,
            },
            {
              email: email,
            },
          ],
        });

        // console.log("line 172", user_found.phone_number,phone_number);
        // console.log("line 178", user_found.phone_number == phone_number);
        if (user_found) {
          if (user_found.phone_number == phone_number) {
            return res.status(409).json({
              status: false,
              message: `User already exists with phone number: ${phone_number}`,
            });
          }

          if (user_found.email == email) {
            return res.status(409).json({
              status: false,
              message: `User already exists with email: ${email}}`,
            });
          }
        }
        console.log("line 154", user_found);
        if (user_found && user_found.isOTPVerified == false) {
          //if user is not verified then send the otp again
          const verification_otp = await generateOTP(phone_number);
          await sendMobile_OTP(phone_number, verification_otp);
          user_found.otp = verification_otp;
          await user_found.save();
          console.log("line 161", verification_otp);

          return res.status(400).json({
            status: false,
            msg: "You are all ready registerd verify yourself to continue. OTP sent on registered mobile number",
          });
        }
        //console.log("line 153", user_found);
        //if user  not found then create the user
        if (user_found == null) {
          const verification_otp = await generateOTP(phone_number);
          await sendMobile_OTP(phone_number, verification_otp);
          console.log("line 161", verification_otp);
          //Password hashing
          // const salt = await bcrypt.genSalt(10);
          // const hashed_password = await bcrypt.hash(password, salt);

          const new_user = new user_model({
            full_name,
            phone_number,
            email,
            gender,
            date_of_birth,
            agreed_To_Terms,
            otp: verification_otp,

            // password: hashed_password,
            //user_profile,
          });

          // Save user
          const user_created = await new_user.save();
          user_created.password = undefined;

          return res.status(200).json({
            status: true,
            message: `Successfully,verification OTP sent on mobile number: ${phone_number}.`,
            //data: user_created,
          });
        }

        if (user_found.isOTPVerified == false) {
          return res.status(400).json({
            status: false,
            msg: "You are all ready registerd verify yourself to continue.",
          });
        }

        // Send the response
      } else if (otp) {
        console.log("line 211", phone_number, email, otp);
        var user_found = await user_model.findOne({
          $and: [
            {
              phone_number: phone_number,
            },
            {
              email: email,
            },
          ],
        });
        if (
          user_found &&
          user_found.isOTPVerified == true &&
          user_found.user_profile
        ) {
          return res.status(409).json({
            status: false,
            msg: "User Already created!.",
            // data: user_updated_profile,
          });
        }
        //check email

        console.log("line 229", user_found);
        //validate the otp
        if (!user_found) {
          return res.status(400).json({ status: false, msg: "User not found" });
        }
        if (user_found.otp !== otp) {
          return res.status(400).json({ status: false, msg: "Invalid OTP" });
        }
        //check expiary otp
        if (user_found.otpExpiary > Date.now()) {
          return res.status(400).json({ status: false, msg: "OTP expired" });
        }
        // if otp is correct
        user_found.isOTPVerified = true;
        await user_found.save();

        //now add password
        if (user_found.isOTPVerified == true) {
          if (!req.body.password) {
            return res.status(200).json({
              status: true,
              msg: "Please provide the password.",
            });
          }
          if (!req.body.confirm_password) {
            return res.status(200).json({
              status: true,
              msg: "Please provide the confirm password.",
            });
          }
          if (req.body.password != req.body.confirm_password) {
            return res.status(400).json({
              status: false,
              msg: "Password and confirm password does not match",
            });
          }
          //Password hashing
          const salt = await bcrypt.genSalt(10);
          const hashed_password = await bcrypt.hash(req.body.password, salt);
          console.log("line 265", user_found, hashed_password);
          // update password
          user_found.password = hashed_password;
          console.log("line 265", user_found);
          const user_updated_password = await user_found.save();

          //now add profile
          if (user_updated_password.password) {
            if (!req.body.user_profile) {
              return res.status(400).json({
                status: false,
                msg: "Please provide the profile role.",
              });
            }
            console.log("line 282", req.body.user_profile);
            if (
              req.body.user_profile != "Fighter" &&
              req.body.user_profile != "Caregiver" &&
              req.body.user_profile != "Veteran"
            ) {
              return res.status(400).json({
                status: false,
                msg: "Please provide the valid profile role.",
              });
            }
            user_found.user_profile = req.body.user_profile;
            const user_updated_profile = await user_found.save();

            //now add the profile image to the user if it null then save the default image to the user
            if (!req.file) {
              user_found.profile_image = null;
              // "https://canplatform.s3.ap-south-1.amazonaws.com/canplatform/default.png";
              const user_updated = await user_found.save();
            }
            //upload profile images to s3
            else {
              const profile_image_url = await aws.single_file_upload(
                req.file.buffer,
                req.file.originalname
              );
              user_found.profile_image = profile_image_url;
              await user_found.save();
            }
            user_updated_profile.password = undefined;
            user_updated_profile.otp = undefined;

            if (user_updated_profile) {
              return res.status(200).json({
                status: true,
                message: "Successfully, account created ...",
                data: user_updated_profile,
              });
            }
          }
        }
      }

      // if otp is not empty
    } catch (err) {
      console.log(err);
      if (err.code === 11000) {
        // Duplicate key error
        return res
          .status(400)
          .json({ error: "Mobile number already registered" });
      }

      return apiResponse.serverErrorResponse(
        res,
        "Server Error...!",
        err.message
      );
    }
  },
];

/**
 * Google user registration API
 * In this api user will be able to register using google account and the user will be able to login using google account
 *
 */
exports.google_user_registration = [
  async (req, res) => {
    try {
      // Express validator
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      }
      // End Express validator

      // Destructuring request body
      const { full_name, email, google_id, profile_image } = req.body;

      // Check if user already exists
      const user_found = await user_model.findOne({ email: email });
      if (user_found) {
        return apiResponse.validationErrorWithData(res, "User already exists");
      }

      // Create new user
      const new_user = new user_model({
        full_name,
        email,
        google_id,
        profile_image,
      });

      // Save user
      const user_created = await new_user.save();

      // Send the response
      return apiResponse.successResponseWithData(
        res,
        "Successfully registered",
        user_created
      );
    } catch (err) {
      console.log(err);
      // Handle the error and send an appropriate response
      return apiResponse.serverErrorResponse(
        res,
        "Server Error...!",
        err.message
      );
    }
  },
];

/**
 * Create password for user account API

/**
 * Create password for user account API
 * After otp verification user will be redirect o cfeate password
 * create password page will have form to take two paramenters one password  and second is
 * confirm_password and it will be inserted int already verified user
 */

// exports.create_password = [
//   async (req, res) => {
//     try {
//       // Express validator
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return res.status(400).json({ errors: errors.array() });
//       }
//       // End Express validator

//       // Destructuring request body
//       const { phone_number, password, confirm_password } = req.body;

//       // Check if user exists
//       const user_found = await user_model.findOne({
//         phone_number: phone_number,
//       });
//       if (!user_found) {
//         return apiResponse.notFoundResponse(res, "User not found");
//       }

//       // Check if user is already verified
//       if (user_found.isOTPVerified) {
//         return apiResponse.validationErrorWithData(
//           res,
//           "User already verified"
//         );
//       }

//       // Check if password is correct
//       if (password !== confirm_password) {
//         return res.status(400).json({
//           status: false,
//           msg: "Password and confirm password does not match",
//         });
//       }

//       //Password hashing
//       const salt = await bcrypt.genSalt(10);
//       const hashed_password = await bcrypt.hash(password, salt);

//       // If otp is correct
//       user_found.isOTPVerified = true;
//       user_found.otp = undefined;
//       user_found.otpExpiary = undefined;
//       user_found.password = hashed_password;
//       const user_updated = await user_found.save();

//       // Send the response
//       return apiResponse.successResponseWithData(
//         res,
//         "Successfully verified",
//         user_updated
//       );
//     } catch (err) {
//       console.log(err);
//       // Handle the error and send an appropriate response
//       return apiResponse.serverErrorResponse(
//         res,
//         "Server Error...!",
//         err.message
//       );
//     }
//   },
// ];

/**
 * Verify user using mobile otp
 */
exports.verify_user = [
  async (req, res) => {
    try {
      // Express validator
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      }
      // End Express validator

      // Destructuring request body
      const { phone_number, otp } = req.body;

      // Check if user exists
      const user_found = await user_model.findOne({
        phone_number: phone_number,
      });
      if (!user_found) {
        return apiResponse.notFoundResponse(res, "User not found");
      }

      // Check if user is already verified
      if (user_found.isOTPVerified) {
        return apiResponse.validationErrorWithData(
          res,
          "User already verified"
        );
      }
      if (!otp) {
        const verification_otp = await generateOTP(phone_number);
        await sendMobile_OTP(phone_number, verification_otp);
        user_found.otp = verification_otp;
        await user_found.save();
        return apiResponse.successResponseWithData(
          res,
          "OTP sent successfully"
          //verification_otp
        );
      }

      // Check if otp is correct
      if (user_found.otp !== otp) {
        return apiResponse.validationErrorWithData(res, "Invalid OTP");
      }

      // Check if otp is expired
      if (user_found.otpExpiary > Date.now()) {
        return apiResponse.validationErrorWithData(res, "OTP expired");
      }

      // If otp is correct
      user_found.isOTPVerified = true;
      user_found.otp = undefined;
      user_found.otpExpiary = undefined;
      const user_updated = await user_found.save();
      user_updated.password = undefined;
      user_updated.jwtTokenBlockedList = undefined;

      // Send the response
      return apiResponse.successResponseWithData(
        res,
        "Successfully verified",
        user_updated
      );
    } catch (err) {
      console.log(err);
      // Handle the error and send an appropriate response
      return apiResponse.serverErrorResponse(
        res,
        "Server Error...!",
        err.message
      );
    }
  },
];

/**
 * Login user
 *
 */
exports.login_user = [
  async (req, res) => {
    try {
      // Express validator
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      }
      // End Express validator

      // Destructuring request body
      const { phone_number, email, password } = req.body;
      console.log("line 504", phone_number, email, password);
      /**
       * Now fetch the user from the database using phone number or email
       */
      const user_found = await user_model.findOne({
        $or: [
          {
            phone_number: phone_number,
          },
          {
            email: email,
          },
        ],
      });

      console.log("line 516", user_found);
      //let can_ids = user_found.user_profile.map((ele) => ele.CANID);
      //console.log("line 516", can_ids);
      if (!user_found) {
        return apiResponse.notFoundResponse(res, "User not found");
      }

      // Check if user is verified
      if (!user_found.isOTPVerified) {
        return apiResponse.validationErrorWithData(
          res,
          "Please verify yourself to continue."
        );
      }

      // Check if password is correct
      const validatePassword = await bcrypt.compare(
        password,
        user_found.password
      );
      console.log("line 554", password, user_found.password, validatePassword);
      //console.log("line 554", validatePassword);
      if (!validatePassword) {
        return apiResponse.validationErrorWithData(res, "Incorrect password");
      }

      //console.log("line 536", user_found.user_profile[0].CANID);
      console.log("line 536", user_found.isAdmin, user_found.full_name);
      const payload = {
        user: {
          _id: user_found._id.toString(),

          CANID: user_found.CANID,
          full_name: user_found.full_name,
          isAdmin: user_found.isAdmin,
          phone_number: user_found.phone_number,
          user_profile: user_found.user_profile,
        },
      };
      // Create and assign token
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_TOKEN_EXPIRY,
      });
      /**
       * after login user and verify the user upadte isLive status to true
       * and on logout update the isLive status to false
       */
      user_found.isLive = true;
      await user_found.save();

      //Save the token in the user model first remove the last token from the list then add the new token

      if (user_found.jwtTokenBlockedList.length > 0) {
        user_found.jwtTokenBlockedList.pop();
      }
      user_found.jwtTokenBlockedList.push(token);
      await user_found.save();

      // Send the response
      return apiResponse.successResponseWithData(
        res,
        "Successfully logged in",
        token
      );
    } catch (err) {
      console.log(err);
      // Handle the error and send an appropriate response
      return apiResponse.serverErrorResponse(
        res,
        "Server Error...!",
        err.message
      );
    }
  },
];

//Logout user

exports.logout_user = [
  login_validator,
  async (req, res) => {
    try {
      // Fetch the user
      const user_found = await user_model.findById(req.user.user._id);
      if (!user_found) {
        return apiResponse.notFoundResponse(res, "User not found");
      }

      // Update the user
      user_found.isLive = false;
      await user_found.save();
      //remove the token from the list
      user_found.jwtTokenBlockedList.pop();
      await user_found.save();

      // Send the response
      return apiResponse.successResponse(res, "Successfully logged out");
    } catch (err) {
      console.log(err);
      return apiResponse.serverErrorResponse(
        res,
        "Server Error...!",
        err.message
      );
    }
  },
];

/**
 * Login user with mobile otp
 */
exports.login_user_with_otp = [
  async (req, res) => {
    try {
      // Express validator
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      }
      // End Express validator

      // Destructuring request body
      const { phone_number, otp } = req.body;
      if (phone_number && !otp) {
        if (!validator.validatePhoneNumber(phone_number)) {
          return apiResponse.validationErrorWithData(
            res,
            "Invalid phone number"
          );
        }
        // Check if user exists
        const user_found = await user_model.findOne({
          phone_number: phone_number,
        });
        // console.log("line 598", user_found);
        if (!user_found) {
          return apiResponse.notFoundResponse(res, "User not found");
        }
        // Check if user is verified
        if (!user_found.isOTPVerified) {
          return apiResponse.validationErrorWithData(
            res,
            "Please verify yourself to continue."
          );
        }
        // Generate OTP
        const verification_otp = await generateOTP(phone_number);
        await sendMobile_OTP(phone_number, verification_otp);
        user_found.otp = verification_otp;
        await user_found.save();
        return apiResponse.successResponseWithData(
          res,
          "OTP sent successfully"
          //verification_otp
        );
      } else if (phone_number && otp) {
        // Check if otp is correct
        const user_found = await user_model.findOne({
          phone_number: phone_number,
        });
        if (user_found.otp !== otp) {
          return apiResponse.validationErrorWithData(res, "Invalid OTP");
        }

        // Check if otp is expired
        if (user_found.otpExpiary > Date.now()) {
          return apiResponse.validationErrorWithData(res, "OTP expired");
        }
        /*
      * Now create the jwt token for the user
      AND send the response
      */
        const payload = {
          user: {
            _id: user_found._id.toString(),
            CANID: user_found.CANID,
            phone_number: user_found.phone_number,
            user_profile: user_found.user_profile,
          },
        };
        // Create and assign token
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
          expiresIn: "1d",
        });

        const user_updated = await user_found.save();

        // Send the response
        return apiResponse.successResponseWithData(
          res,
          "Successfully logged in",
          token
        );
      }
    } catch (err) {
      console.log(err);
      // Handle the error and send an appropriate response
      return apiResponse.serverErrorResponse(
        res,
        "Server Error...!",
        err.message
      );
    }
  },
];

//Get root user profile
exports.get_user_profile_profile = [
  login_validator,
  async (req, res) => {
    try {
      // Fetch the root user
      const user_profile_found = await user_model.findOne({
        phone_number: req.user.user.phone_number,
      });
      // .select(
      //   "full_name CANID phone_number email user_profile profile_image user_profile"
      // );

      // Check if the root user exists
      if (!user_profile_found) {
        return apiResponse.validationErrorWithData(
          res,
          "Root user profile not found"
        );
      }

      console.log("line 598", user_profile_found);

      // Extract root user details
      const rootUserDetails = {
        _id: user_profile_found._id,
        full_name: user_profile_found.full_name,
        phone_number: user_profile_found.phone_number,
        user_profile: user_profile_found.user_profile,
        profile_image: user_profile_found.profile_image,
        date_of_birth: user_profile_found.date_of_birth,
        CANID: user_profile_found.CANID,
      };

      // Extract all user profiles
      const allUserProfiles = user_profile_found.user_profile.map(
        (profile) => ({
          _id: profile._id,
          profile_role: profile.profile_role,
          // pin: profile.pin,
          profile_image: profile.profile_image,
          date_of_birth: profile.date_of_birth,
          isSubscribed: profile.isSubscribed,
          isBlocked: profile.isBlocked,
          status: profile.status,
          CANID: profile.CANID,
          full_name: profile.full_name,
        })
      );

      // Combine root user details with all user profiles
      const userProfileList = [rootUserDetails, ...allUserProfiles];

      return apiResponse.successResponseWithData(
        res,
        "List of user profiles",
        userProfileList
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

/**
 * Now Add Profile API
 * Profile are "Veteran", "Caregiver", and "Fighter"
 *
 */

// exports.add_user_profile = [
//   async (req, res) => {
//     try {
//       // Express validator
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return apiResponse.validationErrorWithData(
//           res,
//           "Validation Error.",
//           errors.array()
//         );
//       }
//       // End Express validator

//       // Destructuring request body
//       const { user_id, user_profile } = req.body;

//       // Check if user exists
//       const user_found = await user_model.findById(user_id);
//       if (!user_found) {
//         return apiResponse.notFoundResponse(res, "User not found");
//       }

//       // Check if user already has a profile
//       if (user_found.user_profile) {
//         return apiResponse.validationErrorWithData(
//           res,
//           "User already has a profile"
//         );
//       }

//       // Update user
//       user_found.user_profile = user_profile;
//       const user_updated = await user_found.save();

//       // Send the response
//       return apiResponse.successResponseWithData(
//         res,
//         "Successfully added profile",
//         user_updated
//       );
//     } catch (err) {
//       console.log(err);
//       // Handle the error and send an appropriate response
//       return apiResponse.serverErrorResponse(
//         res,
//         "Server Error...!",
//         err.message
//       );
//     }
//   },
// ];

/**
 * Reset password api
 * This api will be used to reset the password in whcih user will enter the phone number or  email and get
 * OTP verification code and then user will enter the new password and confirm password
 *
// //  */
// exports.reset_password = [
//   //login_validator,
//   async (req, res) => {
//     try {
//       // Express validator
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return apiResponse.validationErrorWithData(
//           res,
//           "Validation Error.",
//           errors.array()
//         );
//       }
//       // End Express validator

//       // Destructuring request body
//       const { phone_number, email, otp, password, confirm_password } = req.body;

//       // Check if user exists
//       const user_found = await user_model.findOne({
//         $and: [
//           {
//             phone_number:  phone_number,
//           },
//           // {
//           //   email:email,
//           // },
//         ],
//       });
//       if (!user_found) {
//         return apiResponse.notFoundResponse(res, "User not found");
//       }
//       //send otp to user and save in db

//       // Check if user is verified
//       if (user_found.isOTPVerified && user_found.password !== null) {
//         if (req.body.otp) {
//           // const verification_otp = await generateOTP(phone_number);
//           // await sendMobile_OTP(phone_number, verification_otp);
//           // user_found.otp = verification_otp;
//           // user_found.otpExpiary = Date.now() + 600000;
//           // const user_otp_saved = await user_found.save();
//           // // Send the response
//           // console.log("line 146", user_found);
//           // console.log("line 146", user_otp_saved.otp == otp);

//           // fetch the otp from db
//           const user_otp_saved = await user_model.findOne({
//             $and: [
//               {
//                 phone_number:  phone_number,
//               },
//               // {
//               //   email: email,
//               // },
//             ],
//           });
//           //check the phone number and email is matched or not

//           // Check if otp is correct
//           if (user_otp_saved.otp !== otp) {
//             return apiResponse.validationErrorWithData(res, "Invalid OTP");
//           }

//           // Check if otp is expired
//           if (user_otp_saved.otpExpiary > Date.now()) {
//             return apiResponse.validationErrorWithData(res, "OTP expired");
//           }
//           if (!req.body.password) {
//             return apiResponse.validationErrorWithData(
//               res,
//               "Please provide the password"
//             );
//           }
//           if (!req.body.confirm_password) {
//             return apiResponse.validationErrorWithData(
//               res,
//               "Please provide the confirm password"
//             );
//           }

//           // Check if password is correct
//           if (password !== confirm_password) {
//             return apiResponse.validationErrorWithData(
//               res,
//               "Password and confirm password does not match"
//             );
//           }

//           //Password hashing
//           const salt = await bcrypt.genSalt(10);
//           const hashed_password = await bcrypt.hash(password, salt);

//           // If otp is correct
//           user_found.otp = undefined;
//           user_found.otpExpiary = undefined;
//           user_found.password = hashed_password;
//           const user_updated = await user_found.save();

//           // Send the response
//           return apiResponse.successResponseWithData(
//             res,
//             "Successfully reset password"
//             //user_updated
//           );
//         } else {
//           if (
//             user_found.phone_number !== req.body.phone_number &&
//             req.user.user.phone_number !== req.body.phone_number
//           ) {
//             return apiResponse.validationErrorWithData(
//               res,
//               "Phone number is not registered with this account"
//             );
//           }

//           const verification_otp = await generateOTP(phone_number);
//           await sendMobile_OTP(phone_number, verification_otp);
//           user_found.otp = verification_otp;
//           //user_found.otpExpiary = Date.now() + 600000;
//           const user_otp_saved = await user_found.save();
//           return apiResponse.successResponse(
//             res,
//             "OTP sent to your registered  mobile number"
//           );
//         }
//       }
//     } catch (err) {
//       console.log(err);
//       // Handle the error and send an appropriate response
//       return apiResponse.serverErrorResponse(
//         res,
//         "Server Error...!",
//         err.message
//       );
//     }
//   },
// ];

/**
 * User Password Reset API
 * This API will be used to reset the password of user usin email. user enter the email and get password reset link on email
 */

exports.user_forgot_password = [
  async (req, res) => {
    try {
      // Express validator
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      }
      // End Express validator

      // Destructuring request body
      const { email } = req.body;
      // console.log("line 13369",crypto.randomBytes(32).toString("hex"));
      // console.log("line 13370",await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 10));
      // Check if user exists
      const user_found = await user_model.findOne({ email: email });
      if (!user_found) {
        return apiResponse.notFoundResponse(res, "User not found");
      }

      //Genertae the reset token and save in db as well as send to email
      const secret = process.env.JWT_SECRET + user_found.password;
      const payload = {
        email: user_found.email,
        id: user_found._id,
      };
      const jwt_token = jwt.sign(payload, secret, { expiresIn: "1h" });
      //const restcrypto.randomBytes(32).toString("hex");
      const token = await bcrypt.hash(jwt_token, 10);
      console.log("line 1386", token);
      const reset_link = `http://35.154.186.54/api/v1/user/reset-password?token=${token}&id=${user_found._id}`; //`${process.env.CLIENT_URL}/api/v1/reset-password/${user_found._id}/${token}`;

      // Now send the reset link to the email emebeded with the token in html form page for pasword and confirm_password then send to email

      //const reset_token = await helpers.generateResetToken(reset_link);
      ///console.log("line 598", reset_token);

      //now save the reset token in db
      user_found.resetPasswordToken = token.toString();
      user_found.resetPasswordExpire = Date.now() + 3600000;
      console.log("line 1396", user_found);
      await user_found.save();

      console.log("line 1400", user_found.email, reset_link);
      // Send password reset link to email
      let reset_password_url = await helpers.sendResetLink(
        user_found.email,
        reset_link
      );
      console.log("line 1402", reset_password_url);

      // Send the response
      return apiResponse.successResponseWithData(
        res,
        "Password reset link sent to your email",
        reset_password_url
      );
    } catch (err) {
      console.log(err);
      // Handle the error and send an appropriate response
      return apiResponse.serverErrorResponse(
        res,
        "Server Error...!",
        err.message
      );
    }
  },
];

/**
 * Reset password API
 * This API will be used to reset the password of the user using the reset token
 * User will enter the new password and confirm password
 * and then the password will be updated
 *
 * /api/v1/reset-password/:id/:token
 *
 */

exports.reset_password = [
  async (req, res) => {
    try {
      // Destructuring request body
      const { password, confirm_password } = req.body;
      console.log("line 1435", req.body);
      const { id, token } = req.query;

      // Check if user exists
      const user_found = await user_model.findById({ _id: id });
      if (!user_found) {
        return apiResponse.notFoundResponse(res, "User not found");
      }

      // Check if reset token is correct
      // if (user_found.resetPasswordToken !== token) {
      //   return apiResponse.validationErrorWithData(res, "Invalid reset token");
      // }

      // Check if reset token is expired
      if (user_found.resetPasswordExpire < Date.now()) {
        return apiResponse.validationErrorWithData(res, "Reset token expired");
      }
      if (!password) {
        return apiResponse.validationErrorWithData(
          res,
          "Please provide the password"
        );
      }
      if (!confirm_password) {
        return apiResponse.validationErrorWithData(
          res,
          "Please provide the confirm password"
        );
      }

      // Check if password is correct
      if (password !== confirm_password) {
        return apiResponse.validationErrorWithData(
          res,
          "Password and confirm password does not match"
        );
      }
      //const secret = process.env.JWT_SECRET + user_found.password;
      //const verified_token = jwt.verify(token, secret);

      console.log(
        "line 1467",
        token,
        "tokne in db",
        user_found.resetPasswordToken == token
      );
      //now compare the token with the token in db
      const isMatch = bcrypt.compare(token, user_found.resetPasswordToken);
      console.log("line 1467", isMatch);

      if (!isMatch) {
        return apiResponse.validationErrorWithData(res, "Invalid reset token");
      }

      //Password hashing
      const salt = await bcrypt.genSalt(10);
      const hashed_password = await bcrypt.hash(password, salt);

      // If password is correct
      user_found.resetPasswordToken = undefined;
      user_found.resetPasswordExpire = undefined;
      user_found.password = hashed_password;
      const user_updated = await user_found.save();

      // Send the response
      return apiResponse.successResponseWithData(
        res,
        "Successfully reset password"
        // user_updated
      );
    } catch (err) {
      console.log(err);
      // Handle the error and send an appropriate response
      return apiResponse.serverErrorResponse(
        res,
        "Server Error...!",
        err.message
      );
    }
  },
];

/**
 * Change Password API
 * In this api user will be able to change the password when he/she is logged in already
 * user will provide the old password and new password and confirm password
 */

exports.change_password = [
  login_validator,
  async (req, res) => {
    try {
      // Express validator
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      }
      // End Express validator

      // Destructuring request body
      const { old_password, password, confirm_password } = req.body;

      // Check if user exists
      const user_found = await user_model.findById(req.user.user._id);
      if (!user_found) {
        return apiResponse.notFoundResponse(res, "User not found");
      }

      // Check if old password is correct
      const validatePassword = await bcrypt.compare(
        old_password,
        user_found.password
      );
      if (!validatePassword) {
        return apiResponse.validationErrorWithData(res, "Incorrect password");
      }

      // Check if password is correct
      if (password !== confirm_password) {
        return apiResponse.validationErrorWithData(
          res,
          "Password and confirm password does not match"
        );
      }

      //Password hashing
      const salt = await bcrypt.genSalt(10);
      const hashed_password = await bcrypt.hash(password, salt);

      // If old password is correct
      user_found.password = hashed_password;
      const user_updated = await user_found.save();
      user_found.password = undefined;
      user_found.otp = undefined;
      user_found.jwtTokenBlockedList = undefined;

      // Send the response
      return apiResponse.successResponseWithData(
        res,
        "Successfully changed password",
        user_updated
      );
    } catch (err) {
      console.log(err);
      // Handle the error and send an appropriate response
      return apiResponse.serverErrorResponse(
        res,
        "Server Error...!",
        err.message
      );
    }
  },
];

/**
 * Reset pin api
 * This API will be used to reset the pin of the user_profile and users in the user_profile
 * In this api user will enter the phone number or email and get the OTP verification code
 * and then user will enter the new pin and confirm pin
 */

exports.reset_pin = [
  login_validator,
  async (req, res) => {
    try {
      // Express validator
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      }
      // End Express validator

      // Destructuring request body
      const { phone_number, email, otp, pin, confirm_pin } = req.body;

      // Check if user exists
      const user_found = await user_model.findOne({
        $and: [
          {
            phone_number: req.user.user.phone_number,
          },
          {
            email: req.user.user.email,
          },
        ],
      });
      if (!user_found) {
        return apiResponse.notFoundResponse(res, "User not found");
      }

      // Check if user is verified
      if (user_found.isOTPVerified) {
        if (req.body.otp) {
          // fetch the otp from db
          const user_otp_saved = await user_model.findOne({
            $and: [
              {
                phone_number: req.user.user.phone_number,
              },
              {
                email: req.user.user.email,
              },
            ],
          });

          // Check if otp is correct
          if (user_otp_saved.otp !== otp) {
            return apiResponse.validationErrorWithData(res, "Invalid OTP");
          }

          // Check if otp is expired
          if (user_otp_saved.otpExpiary > Date.now()) {
            return apiResponse.validationErrorWithData(res, "OTP expired");
          }
          if (!req.body.pin) {
            return apiResponse.validationErrorWithData(
              res,
              "Please provide the pin"
            );
          }
          if (!req.body.confirm_pin) {
            return apiResponse.validationErrorWithData(
              res,
              "Please provide the confirm pin"
            );
          }

          // Check if pin is correct
          if (pin !== confirm_pin) {
            return apiResponse.validationErrorWithData(
              res,
              "Pin and confirm pin does not match"
            );
          }

          //hash the pin
          const hashed_pin = await bcrypt.hash(pin, 10);

          // If otp is correct
          user_found.otp = undefined;
          user_found.otpExpiary = undefined;
          user_found.pin = hashed_pin;
          const user_updated = await user_found.save();

          // Send the response
          return apiResponse.successResponseWithData(
            res,
            "Successfully reset pin",
            user_updated
          );
        } else {
          if (
            user_found.phone_number !== req.body.phone_number &&
            req.user.user.phone_number !== req.body.phone_number
          ) {
            return apiResponse.validationErrorWithData
              .status(400)
              .json({ status: false, msg: "Phone number is not registered" });
          }
          const verification_otp = await generateOTP(phone_number);
          await sendMobile_OTP(phone_number, verification_otp);
          user_found.otp = verification_otp;
          //user_found.otpExpiary = Date.now() + 600000;
          const user_otp_saved = await user_found.save();
          return apiResponse.successResponse(
            res,
            "OTP sent to your registered mobile number"
          );
        }
      }
    } catch (err) {
      console.log(err);
      // Handle the error and send an appropriate response
      return apiResponse.serverErrorResponse(
        res,
        "Server Error...!",
        err.message
      );
    }
  },
];

/**
 * Block user_profile profile API
 * In this api Admin will be able to block the root user profile
 */

exports.block_user_profile_profile = [
  login_validator,
  admin_validator,
  async (req, res) => {
    try {
      // Fetch the root user
      const user_profile_found = await user_model.findOne({
        _id: req.user.user._id,
      });

      // Check if the root user exists
      if (!user_profile_found) {
        return apiResponse.validationErrorWithData(
          res,
          "Root user profile not found"
        );
      }

      // Block the root user
      user_profile_found.isBlocked = true;
      const user_profile_blocked = await user_profile_found.save();

      return apiResponse.successResponseWithData(
        res,
        "Root user profile blocked",
        user_profile_blocked
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

/**
 * Block user profile API
 * In this api the one user will be able to block tyo other user profile
 */
exports.block_user_profile = [
  login_validator,
  async (req, res) => {
    try {
      // Check if req.user is set
      if (!req.user.user || !req.user.user._id) {
        return apiResponse.validationErrorWithData(
          res,
          "Authentication required"
        );
      }

      // Get the authenticated user ID
      const authenticatedUserId = req.user.user._id.toString();

      // Check if the user is trying to block themselves
      if (authenticatedUserId === req.body.user_id) {
        return apiResponse.validationErrorWithData(
          res,
          "You cannot block yourself"
        );
      }

      // Fetch the user to be blocked/unblocked
      const userToBlock = await user_model.findOne({ _id: req.body.user_id });

      // Check if the user exists
      if (!userToBlock) {
        return apiResponse.validationErrorWithData(res, "User not found");
      }

      // Fetch the authenticated user's profile
      const user_profile = await user_model.findOne({ _id: req.user.user._id });

      // Check if the user's profile exists
      if (!user_profile) {
        return apiResponse.validationErrorWithData(res, "User not found");
      }

      // Initialize blockedTo array if it doesn't exist
      if (!user_profile.blockedTo) {
        user_profile.blockedTo = [];
      }

      // Check if the user_id is already in the blockedTo array
      const blockedIndex = user_profile.blockedTo.findIndex(
        (blockedUser) => blockedUser.user_id.toString() === req.body.user_id
      );

      if (blockedIndex >= 0) {
        // If user_id is found in the blockedTo array, remove it
        user_profile.blockedTo.splice(blockedIndex, 1);
        userToBlock.isBlocked = false;
      } else {
        // If user_id is not found in the blockedTo array, add it
        user_profile.blockedTo.push({ user_id: req.body.user_id });
        userToBlock.isBlocked = true;
      }

      await user_profile.save();
      const updatedUser = await userToBlock.save();

      const userResponse = {
        _id: updatedUser._id,
        profile_image: updatedUser.profile_image,
        full_name: updatedUser.full_name,
        phone_number: updatedUser.phone_number,
        email: updatedUser.email,
        isBlocked: updatedUser.isBlocked,
      };

      const message = updatedUser.isBlocked
        ? "Successfully, User profile blocked"
        : "Successfully, User profile unblocked";

      return apiResponse.successResponseWithData(res, message, userResponse);
    } catch (err) {
      return apiResponse.serverErrorResponse(
        res,
        "Server Error...!",
        err.message
      );
    }
  },
];
/**
 * Get blocked users API for the authenticated user
 */
exports.get_blocked_users = [
  login_validator,
  async (req, res) => {
    try {
      // Check if req.user is set
      if (!req.user.user || !req.user.user._id) {
        return apiResponse.validationErrorWithData(
          res,
          "Authentication required"
        );
      }

      // Get the authenticated user ID
      const authenticatedUserId = req.user.user._id.toString();

      // Fetch the authenticated user's profile
      const user_profile = await user_model.findOne({
        _id: authenticatedUserId,
      });

      // Check if the user's profile exists
      if (!user_profile) {
        return apiResponse.validationErrorWithData(res, "User not found");
      }

      // Initialize blockedTo array if it doesn't exist
      if (!user_profile.blockedTo) {
        user_profile.blockedTo = [];
      }

      // Get the list of blocked users
      const blockedUsers = user_profile.blockedTo.map(
        (blockedUser) => blockedUser.user_id
      );
      console.log("line 80", blockedUsers);

      // Fetch the details of the blocked users
      const blockedUsersDetails = await user_model
        .find({ _id: { $in: blockedUsers } })
        .select("full_name profile_image user_profile");
      // Send the response
      return apiResponse.successResponseWithData(
        res,
        "List of blocked users",
        blockedUsersDetails
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

/**
 * Get user profile API
 * This api will be used to get the user profile
 */

exports.get_user_profile = [
  login_validator,
  async (req, res) => {
    try {
      // Fetch the user from user_profile or from user_profile
      const user_found = await user_model
        .findOne({
          $or: [
            { _id: req.user.user._id },

            // {
            //   "user_profile._id": req.user.user._id,
            // },
          ],
        })
        .select("-password -jwtTokenBlockedList -otp -otpExpiary"); //.select("user_profile

      // Check if the user exists
      if (!user_found) {
        return apiResponse.validationErrorWithData(res, "User not found");
      }

      let user_profile;
      if (user_found._id.toString() === req.user.user._id) {
        user_profile = user_found;
      } else {
        user_profile = user_found.user_profile.find(
          (profile) => profile._id === req.user.user._id
        );
      }

      return apiResponse.successResponseWithData(
        res,
        "User profile",
        user_profile
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

/**
 * User Profile Update API
 * This api will be used to update the user profile
 */

exports.update_user_profile = [
  login_validator,
  upload.single("profile_image"),
  async (req, res) => {
    try {
      // Express validator
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      }
      // End Express validator

      // Fetch the user from user_profile or from user_profile
      const user_found = await user_model.findOne({ _id: req.user.user._id });

      // Check if the user exists
      if (!user_found) {
        return apiResponse.validationErrorWithData(res, "User not found");
      }

      //update the user profile image s3 bucket and save the url in db

      if (req.file) {
        let file = req.file;

        var profile_image_url = await aws.single_file_upload(
          req.file.buffer,
          req.file.originalname
        );
      }
      // console.log("line 80", profile_image_url);

      if (user_found._id.toString() === req.user.user._id) {
        user_found.full_name = req.body.full_name
          ? req.body.full_name
          : user_found.full_name;
        user_found.phone_number = req.body.phone_number
          ? req.body.phone_number
          : user_found.phone_number;
        user_found.email = req.body.email ? req.body.email : user_found.email;
        user_found.profile_image = profile_image_url
          ? profile_image_url
          : user_found.profile_image;

        user_found.date_of_birth = req.body.date_of_birth
          ? req.body.date_of_birth
          : user_found.date_of_birth;
      }

      // Update the user profile

      const user_updated = await user_found.save();
      user_updated.password = undefined;
      user_updated.jwtTokenBlockedList = undefined;

      return apiResponse.successResponseWithData(
        res,
        "User profile updated",
        user_updated
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

// get user  by _id

exports.get_user_by_id = [
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
      // Fetch the user from user_profile or from user_profile
      const user_found = await user_model
        .findOne({ _id: req.params.user_id })
        .select("full_name phone_number email user_profile profile_image");

      // Check if the user exists
      if (!user_found) {
        return apiResponse.validationErrorWithData(res, "User not found");
      }

      return apiResponse.successResponseWithData(
        res,
        "User profile",
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

/**
 * Get users list by admin
 */
exports.get_users_list_by_admin = [
  login_validator,
  admin_validator,
  async (req, res) => {
    try {
      // Fetch the users list
      const users_list = await user_model
        .find()
        .select(
          "full_name phone_number CANID email user_profile profile_image date_of_joining status"
        );

      // Check if the users list exists
      if (!users_list) {
        return apiResponse.validationErrorWithData(res, "Users not found");
      }

      return apiResponse.successResponseWithData(res, "Users list", users_list);
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

/**
 * Get total numbers of users by admin
 */

exports.get_total_users_by_admin = [
  login_validator,
  admin_validator,
  async (req, res) => {
    try {
      // Fetch the users list
      const users_list = await user_model.find().countDocuments();

      // Check if the users list exists
      if (!users_list) {
        return apiResponse.validationErrorWithData(res, "Users not found");
      }

      return apiResponse.successResponseWithData(
        res,
        "Total numbers of users",
        users_list
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

/**
 * Get total numbers of blocked users by admin
 */

exports.get_total_blocked_users_by_admin = [
  login_validator,
  admin_validator,
  async (req, res) => {
    try {
      // Fetch the users list
      const users_list = await user_model
        .find({ isBlocked: true })
        .countDocuments();

      // Check if the users list exists
      if (!users_list) {
        return apiResponse.validationErrorWithData(res, "Users not found");
      }

      return apiResponse.successResponseWithData(
        res,
        "Total numbers of blocked users",
        users_list
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

/**
 * Get total numbers of active users by admin
 */

exports.get_total_active_users_by_admin = [
  login_validator,
  admin_validator,
  async (req, res) => {
    try {
      // Fetch the users list
      const users_list = await user_model
        .find({ isBlocked: false })
        .countDocuments();

      // Check if the users list exists
      if (!users_list) {
        return apiResponse.validationErrorWithData(res, "Users not found");
      }

      return apiResponse.successResponseWithData(
        res,
        "Total numbers of active users",
        users_list
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

/**
 * Get total numbers of fighters users by admin
 */

exports.get_total_fighters_users_by_admin = [
  login_validator,
  admin_validator,
  async (req, res) => {
    try {
      // Fetch the users list
      const users_list = await user_model
        .find({ user_profile: "Fighter" })
        .countDocuments();

      // Check if the users list exists
      if (!users_list) {
        return apiResponse.validationErrorWithData(res, "Users not found");
      }

      return apiResponse.successResponseWithData(
        res,
        "Total numbers of fighters users",
        users_list
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

/**
 * Get total numbers of caregivers users by admin
 */

exports.get_total_caregivers_users_by_admin = [
  login_validator,
  admin_validator,
  async (req, res) => {
    try {
      // Fetch the users list
      const users_list = await user_model
        .find({ user_profile: "Caregiver" })
        .countDocuments();

      // Check if the users list exists
      if (!users_list) {
        return apiResponse.validationErrorWithData(res, "Users not found");
      }

      return apiResponse.successResponseWithData(
        res,
        "Total numbers of caregivers users",
        users_list
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

/**
 * Get total numbers of veterans users by admin
 */

exports.get_total_veterans_users_by_admin = [
  login_validator,
  admin_validator,
  async (req, res) => {
    try {
      // Fetch the users list
      const users_list = await user_model
        .find({ user_profile: "Veteran" })
        .countDocuments();

      // Check if the users list exists
      if (!users_list) {
        return apiResponse.validationErrorWithData(res, "Users not found");
      }

      return apiResponse.successResponseWithData(
        res,
        "Total numbers of veterans users",
        users_list
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

/**
 * Get Total Numbers of Users gender wise in percentage by admin
 * This API will fecth the all the users male and females but in response it will return the percentage
 */

exports.get_perecentage_user_gender_by_admin = [
  login_validator,
  admin_validator,
  async (req, res) => {
    try {
      // Fetch the users list
      const total_male_users = await user_model
        .find({
          gender: "male",
        })
        .countDocuments();
      console.log("line 80", total_male_users);
      const total_female_users = await user_model
        .find({
          gender: "female",
        })
        .countDocuments();
      const total_users = await user_model.find().countDocuments();

      //Now calculate the percentage for each genders
      const male_percentage = Number(
        ((total_male_users / total_users) * 100).toFixed(2)
      );
      const female_percentage = Number(
        ((total_female_users / total_users) * 100).toFixed(2)
      );
      const response = {
        male_percentage: male_percentage,
        female_percentage: female_percentage,
      };

      return apiResponse.successResponseWithData(
        res,
        "Percentage of users fetch sucessfully!",
        response
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

//Get Total live users number by admin

exports.get_total_live_users_by_admin = [
  // login_validator,
  // admin_validator,
  async (req, res) => {
    try {
      // Fetch the users list
      const users_list = await user_model
        .find({ isLive: true })
        .countDocuments();

      // Check if the users list exists
      // if (!users_list) {
      //   return apiResponse.validationErrorWithData(res, "Users not found");
      // }

      return apiResponse.successResponseWithData(
        res,
        "Total numbers of live users",
        users_list
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

//Report user by other user API

exports.report_user = [
  login_validator,
  async (req, res) => {
    try {
      //validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      }
      // fecth story of   to report
      const mystory_found = await mystory_model.findOne({
        _id: req.body.story_id,
      });

      // Check if the user exists
      if (!mystory_found) {
        return apiResponse.validationErrorWithData(res, " Story  not found");
      }

      //now add the report of mystory found

      const story_reported = new reported_story_model({
        user_id: mystory_found.user_id,
        story_id: req.body.story_id,
        report_reason: req.body.report_reason,
        reported_by: req.user.user._id,
      });

      const story_reported_saved = await story_reported.save();

      if (!story_reported_saved) {
        return apiResponse.validationErrorWithData(res, "Story not reported");
      }

      return apiResponse.successResponseWithData(
        res,
        "User reported successfully",
        story_reported_saved
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

//Get reported users list by admin

exports.get_reported_users_list_by_admin = [
  login_validator,
  // admin_validator,
  async (req, res) => {
    try {
      // Fetch the users list
      const users_list = await reported_story_model
        .find({})
        .populate(
          "user_id",
          "full_name phone_number CANID email user_profile profile_image reported_at status"
        );
      // .select(
      //   "full_name phone_number CANID email user_profile  report_reason profile_image date_of_joining status"
      // );
      console.log("line 80", users_list.length);

      // Check if the users list exists
      if (!users_list) {
        return apiResponse.validationErrorWithData(res, "Users not found");
      }

      return apiResponse.successResponseWithData(
        res,
        "Reported users list",
        users_list
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

/**
 * Get the reported story by admin API
 * In this api admin will be able to get the reported story
 * when admin will click api will return the reported story with the user_id and story_id details
 */

exports.get_reported_story_by_admin = [
  login_validator,
  async (req, res) => {
    try {
      // Fetch the reported story
      const reported_story_found = await reported_story_model.findOne({
        story_id: req.params.story_id,
      });

      // Check if the story exists
      if (!reported_story_found) {
        return apiResponse.validationErrorWithData(res, "Story not found");
      }
      //fetch the story from mystory model
      const mystory_found = await mystory_model.findOne({
        _id: reported_story_found.story_id,
      }).populate("user_id", "full_name phone_number CANID   profile_image reported_at status");



      return apiResponse.successResponseWithData(
        res,
        "Reported story",
        mystory_found
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

/**
 * Subscribe  the subscription plan by user api
 * This api will be used to subscribe the subscription plan by user
 * user will select the plan and then subscribe the plan
 * This api will be used middleware to check the user's subscription plan is already active or not
 * If user's subscription plan is already active then it will no need to subscribe the plan if plan is expired then user will be able to subscribe the plan
 *
 * each plan will have the duration of 30 days for all plan if user is used all their meetings allowed in their plan then he/she wiil be able to by the extra meetings
 * by top up the plan as per scheme/model
 */

exports.subscribe_plan = [
  login_validator,
  async (req, res) => {
    try {
      // Fetch the user from user_profile or from user_profile
      const user_found = await user_model
        .findOne({ _id: req.user.user._id })
        .select("subscription");

      // Check if the user exists
      if (!user_found) {
        return apiResponse.validationErrorWithData(res, "User not found");
      }

      // Check if the user's subscription plan is already active
      if (user_found.subscription.isActive) {
        return apiResponse.validationErrorWithData(
          res,
          "User's subscription plan is already active"
        );
      }

      // Check if the user's subscription plan is expired
      if (user_found.subscription.expiryDate < Date.now()) {
        return apiResponse.validationErrorWithData(
          res,
          "User's subscription plan is expired"
        );
      }

      // Subscribe the plan
      user_found.subscription.isActive = true;
      user_found.subscription.expiryDate = Date.now() + 2592000000; // 30 days
      const user_updated = await user_found.save();

      return apiResponse.successResponseWithData(
        res,
        "User subscribed the plan",
        user_updated
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

/**
 * Block the reported story by admin API
 * in this api admin will able to block after inspection of story
 */

exports.block_reported_story_by_admin = [
  login_validator,
  admin_validator,
  async (req, res) => {
    try {
      // Fetch the reported story
      const story_found = await reported_story_model.findOne({
        story_id: req.params.story_id,
      });

      // Check if the story exists

      if (!story_found) {
        return apiResponse.validationErrorWithData(res, "Story not found");
      }
      //now check story in mystory model
      const mystory_found = await mystory_model.findOne({
        _id: story_found.story_id,
      });

      // Block the story
      mystory_found.isBlocked = true;
      const story_blocked = await mystory_found.save();
      story_found.status = "Blocked";
      const story_reported = await story_found.save();

      return apiResponse.successResponseWithData(res, "Story blocked");
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

/**
 * Delete the reported story by admin API
 */

exports.delete_reported_story_by_admin = [
  login_validator,
  admin_validator,
  async (req, res) => {
    try {
      // Fetch the reported story
      const story_found = await reported_story_model.findOne({
        story_id: req.params.story_id,
      });

      // Check if the story exists
      if (!story_found) {
        return apiResponse.validationErrorWithData(res, "Story not found");
      }

      // Delete the story form the mystory model and reported_story model
      const story_deleted = await mystory_model.findOneAndDelete({
        _id: story_found.story_id,
      });
      await reported_story_model.findOneAndDelete({
        story_id: req.params.story_id,
      });

      return apiResponse.successResponseWithData(
        res,
        "Story deleted"
        //story_deleted
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