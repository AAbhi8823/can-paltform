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
const login_validator=require("../middlewares/jwt.auth.middleware")

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

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

      // validation for empty body
      if (!otp) {
        if (!full_name) {
          return res
            .status(400)
            .json({ status: false, msg: "Full name is required" });
        }
        if (!phone_number) {
          return res
            .status(400)
            .json({ status: false, msg: "Phone number is required" });
        }
        if (!email) {
          return res
            .status(400)
            .json({ status: false, msg: "Email is required" });
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
        if (!validator.validatePhoneNumber(phone_number)) {
          return apiResponse.validationErrorWithData(
            res,
            "Invalid mobile number"
          );
        }
        if (!validator.validateEmail(email)) {
          return apiResponse.validationErrorWithData(res, "Invalid email");
        }

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
        console.log("line 153", user_found);
        //if user  not found then create the user
        if (user_found == null) {
          const verification_otp = await sendMobile_OTP(phone_number);

          const new_user = new user_model({
            full_name,
            phone_number,
            email,
            gender,
            date_of_birth,
            agreed_To_Terms,
            otp: verification_otp,
            //  password: hashed_password,
            user_profile,
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
            msg: "You are all ready registerd verify yourself to continue",
          });
        }

        //Password and confirm_password validation
        // if (password !== confirm_password) {
        //   return res.status(400).json({
        //     status: false,
        //     msg: "Password and confirm password does not match",
        //   });
        // }
        //Password hashing
        // const salt = await bcrypt.genSalt(10);
        // const hashed_password = await bcrypt.hash(password, salt);
        // send otp on mobile and save in db as will

        // Create a new user

        // Send the response
      } else if (otp) {
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
        if (!user_found) {
          return res.status(400).json({ status: false, msg: "User not found" });
        }
        if (user_found.isOTPVerified) {
          if (!user_found.password) {
            //if user is verified but password is not there then proceed to create the password
            if(!req.body.password){
              return res.status(400).json({
                status: false,
                msg: "Please provide the password.",
              });
            }
            if(!req.body.confirm_password){
              return res.status(400).json({
                status: false,
                msg: "Please provide the confirm password.",
              });

            } 
            if (req.body.password != req.body.confirm_password) {
              return res
                .status(400)
                .json({
                  status: false,
                  msg: "Password and confirm password does not match",
                });
            }
            //Password hashing
            const salt = await bcrypt.genSalt(10);
            const hashed_password = await bcrypt.hash(req.body.password, salt);
            // update password
            user_found.password = hashed_password;
            const user_updated_password = await user_found.save();
            user_updated_password.password = undefined;
            // send token
            return res.status(200).json(
              {
                status: true,
                message: "Successfully,Signup Completed. Create profile now!",
                //  data: user_updated,
              }
            )


           
            // return res
            //   .status(400)
            //   .json({
            //     status: false,
            //     msg: "Please create password to complete account setup.",
            //   });
          }
          // return res
          //   .status(400)
          //   .json({ status: false, message: "Successfully, account verified create password to proceed" });
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
        user_found.otp = undefined;
        user_found.otpExpiary = undefined;
        const user_updated = await user_found.save();
        // user_updated.password = undefined;

        // if (
        //   password &&
        //   confirm_password &&
        //   user_updated.isOTPVerified == true
        // ) {
        //   //if (user_updated.isOTPVerified) {
        //     if (password != confirm_password) {
        //       return res
        //         .status(400)
        //         .json({
        //           status: false,
        //           msg: "Password and confirm password does not match",
        //         });
        //     }
        //     if (!user_updated.password) {
        //       return res
        //         .status(400)
        //         .json({
        //           status: false,
        //           msg: "Please create password to complete account setup.",
        //         });
        //    }
        //Password hashing
        // const salt = await bcrypt.genSalt(10);
        // const hashed_password = await bcrypt.hash(password, salt);
        // // update password
        // user_updated.password = hashed_password;
        // const user_updated_password = await user_updated.save();
        // user_updated_password.password = undefined;
        // // send token
        //  }

        // Send the response
        return res.status(200).json({
          status: true,
          message: "Successfully, account verified create password to proceed.",
          //  data: user_updated,
        });
      }

      // if otp verified true the procced to create password for account setup process

      // if otp is not empty
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
      const { phone_number,email, password } = req.body;
      console.log("line 504",phone_number,email, password)

      // Check if user exists
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
      console.log("line 516",user_found)
      if (!user_found) {
        return apiResponse.notFoundResponse(res, "User not found");
      }

      // Check if user is verified
      if (!user_found.isOTPVerified) {
        return apiResponse.validationErrorWithData(res, "Please verify yourself to continue.");
      }

      // Check if password is correct
      const validatePassword = await bcrypt.compare(
        password,
        user_found.password
      );
      if (!validatePassword) {
        return apiResponse.validationErrorWithData(res, "Incorrect password");
      }

      console.log("line 536",user_found.user_profile
      )
      const payload = {
        user: {
          _id: user_found._id.toString(),
          CANID: user_found.CANID,
          phone_number:user_found.phone_number,
          //user_profile:user_found.user_profile.user_role
        },
      };
      // Create and assign token
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

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

/**
 * Now Add Profile API
 * Profile are "Veteran", "Caregiver", and "Fighter"
 *
 */

exports.add_user_profile = [
  
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
      const { user_id, user_profile } = req.body;

      // Check if user exists
      const user_found = await user_model.findById(user_id);
      if (!user_found) {
        return apiResponse.notFoundResponse(res, "User not found");
      }

      // Check if user already has a profile
      if (user_found.user_profile) {
        return apiResponse.validationErrorWithData(
          res,
          "User already has a profile"
        );
      }

      // Update user
      user_found.user_profile = user_profile;
      const user_updated = await user_found.save();

      // Send the response
      return apiResponse.successResponseWithData(
        res,
        "Successfully added profile",
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
