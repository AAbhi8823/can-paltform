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
const { use } = require("../routes/user.routes");
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
          $and: [
            {
              phone_number: phone_number,
            },
            {
              email: email,
            },
          ],
        });
      
        console.log("line 172",user_found)
        if (user_found) {
          return res
            .status(400)
            .json({
              status: false,
              msg: ` ${phone_number} This phone number is already registerd`,
            });
        }
        // if(user_found.email){
        //   return res.status(409).json({
        //     status:false,
        //     message:`${user_found.email} is already registered.`

        //   })
       // }
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
            msg: "You are all ready registerd verify yourself to continue",
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
        if(user_found && user_found.isOTPVerified==true && user_found.user_profile) {
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
        
            if(user_updated_profile){
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

// exports.add_user = [
//   upload.single("profile_image"),
//   async (req, res) => {
//     try {
//       // Express validator
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return res.status(400).json({ errors: errors.array() });
//       }
//       // End Express validator

//       // Destructuring request body
//       const {
//         full_name,
//         phone_number,
//         email,
//         gender,
//         date_of_birth,
//         agreed_To_Terms,
//         otp,
//         // password,
//         // confirm_password,
//         user_profile,
//       } = req.body;
//       console.log("line 97", full_name, phone_number, gender);
//       // validation for empty body
//       if (!otp) {
//         if (!full_name) {
//           return res
//             .status(400)
//             .json({ status: false, msg: "Full name is required" });
//         }
//         if (!phone_number) {
//           return res.status(400).json({
//             status: false,
//             msg: "Phone is required for registration",
//           });
//         }

//         if (!gender) {
//           return res
//             .status(400)
//             .json({ status: false, message: " Gender is required" });
//         }
//         if (!date_of_birth) {
//           return res
//             .status(400)
//             .json({ status: false, message: " Date of birth is required" });
//         }
//         if (!agreed_To_Terms) {
//           return res.status(400).json({
//             status: false,
//             message: " Please Agreed to terms and condition before proceed! ",
//           });
//         }

//         // Validation of fields
//         if (
//           !validator.validatePhoneNumber(phone_number) &&
//           !validator.validateEmail(email)
//         ) {
//           return apiResponse.validationErrorWithData(
//             res,
//             "Invalid email or mobile"
//           );
//         }
//         // if (!validator.validateEmail(email)) {
//         //   return apiResponse.validationErrorWithData(res, "Invalid email");
//         // }

//         // Check if user already exists

//         const user_found = await user_model.findOne({
//           $and: [
//             {
//               phone_number: phone_number,
//             },
//             {
//               email: email,
//             },
//           ],
//         });
//         console.log("line 154", user_found);
//         if (user_found && user_found.isOTPVerified == false) {
//           return res.status(400).json({
//             status: false,
//             msg: "You are all ready registerd verify yourself to continue",
//           });
//         }
//         console.log("line 153", user_found);
//         //if user  not found then create the user
//         if (user_found == null) {
//           const verification_otp = await generateOTP(phone_number);
//           await sendMobile_OTP(phone_number, verification_otp);
//           console.log("line 161", verification_otp);
//           //Password hashing
//           // const salt = await bcrypt.genSalt(10);
//           // const hashed_password = await bcrypt.hash(password, salt);

//           const new_user = new user_model({
//             full_name,
//             phone_number,
//             email,
//             gender,
//             date_of_birth,
//             agreed_To_Terms,
//             otp: verification_otp,
//             // password: hashed_password,
//             user_profile,
//           });

//           // Save user
//           const user_created = await new_user.save();
//           user_created.password = undefined;

//           return res.status(200).json({
//             status: true,
//             message: `Successfully,verification OTP sent on mobile number: ${phone_number}.`,
//             //data: user_created,
//           });
//         }

//         if (user_found.isOTPVerified == false) {
//           return res.status(400).json({
//             status: false,
//             msg: "You are all ready registerd verify yourself to continue",
//           });
//         }

//         // Send the response
//       } else if (otp) {
//         console.log("line 211", phone_number, email, otp);
//         const user_found = await user_model.findOne({
//           $and: [
//             {
//               phone_number: phone_number,
//             },
//             {
//               email: email,
//             },
//           ],
//         });
//         console.log("line 229", user_found);

//         if (!user_found) {
//           return res.status(400).json({ status: false, msg: "User not found" });
//         }
//         if (user_found.isOTPVerified == true) {
//           if (!user_found.password) {
//             //if user is verified but password is not there then proceed to create the password

//             if (!req.body.password) {
//               return res.status(400).json({
//                 status: false,
//                 msg: "Please provide the password.",
//               });
//             }
//             if (!req.body.confirm_password) {
//               return res.status(400).json({
//                 status: false,
//                 msg: "Please provide the confirm password.",
//               });
//             }
//             if (req.body.password != req.body.confirm_password) {
//               return res.status(400).json({
//                 status: false,
//                 msg: "Password and confirm password does not match",
//               });
//             }
//             //Password hashing
//             const salt = await bcrypt.genSalt(10);
//             const hashed_password = await bcrypt.hash(req.body.password, salt);
//             console.log("line 265", user_found, hashed_password);
//             // update password
//             user_found.password = hashed_password;
//             console.log("line 265", user_found);
//             const user_updated_password = await user_found.save();

//             console.log("line 273",user_found.password && user_found.user_profile == null)

//             return res.status(200).json({
//               status: true,
//               message: "Successfully, account created add profile to proceed",
//               //  data: user_updated,
//             });
//           }
//         }

//         //now create profile
//         if (user_found.password && user_found.user_profile == null) {
//           if (req.body.user_role == "Fighter") {
//             user_found.user_profile = req.body.user_role;
//             console.log("line 292", user_found);
//          const user_found_updated=   await user_found.save();

//             //if req.file is empty then save the default image
//             if (!req.file) {
//               user_found.profile_image = null;
//               // "https://canplatform.s3.ap-south-1.amazonaws.com/canplatform/default.png";
//               const user_updated = await user_found.save();
//             } else {
//               //upload profile images to s3
//               const profile_image_url = await aws.single_file_upload(
//                 req.file.buffer,
//                 req.file.originalname
//               );
//               user_found.profile_image = profile_image_url;
//               const user_updated = await user_found.save();
//             }

//             if (!req.body.pin) {
//               return res.status(400).json({
//                 status: false,
//                 msg: "Please provide the pin.",
//               });
//             }
//             if (req.body.pin.length < 4) {
//               return res.status(400).json({
//                 status: false,
//                 msg: "Pin must be 4 digit long.",
//               });
//             }
//             if (req.body.pin != req.body.confirm_pin) {
//               return res.status(400).json({
//                 status: false,
//                 msg: "Pin and confirm pin does not match.",
//               });
//             }

//             // user_found.pin = req.body.pin;
//             // console.log("line 292", user_found);
//             // const user_updated = await user_found.save();
//             // user_updated.password = undefined;
//             console.log("line 329", user_found);
//             const pin_salt = await bcrypt.genSalt(10);
//             const hashed_pin = await bcrypt.hash(req.body.pin, pin_salt);
//             user_found.pin = hashed_pin;
//             const user_updated = await user_found.save();
//           } else {
//             return res.status(400).json({
//               status: false,
//               msg: "First user role should be Fighter",
//             });
//           }
//           //upload profile images to s3

//           //now add pin

//           //hash the pin
//         }
//         // console.log("line 278", user_found);
//         // console.log("line 279", user_found.otp, otp);

//         if (user_found.otp !== otp) {
//           return res.status(400).json({ status: false, msg: "Invalid OTP" });
//         }
//         //check expiary otp
//         if (user_found.otpExpiary > Date.now()) {
//           return res.status(400).json({ status: false, msg: "OTP expired" });
//         }
//         // if otp is correct
//         user_found.isOTPVerified = true;
//         // user_found.otp = undefined;
//         // user_found.otpExpiary = undefined;
//         const user_updated_saved = await user_found.save();
//         // user_updated.password = undefined;

//         // Send the response
//         return res.status(200).json({
//           status: true,
//           message:
//             "Successfully, account verified create password to proceed.....!",
//           //  data: user_updated_saved,
//         });
//       }

//       // if otp verified true the procced to create password for account setup process

//       // if otp is not empty
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
      //console.log("line 536",user_found.user_profile)
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
            CANID:user_found.CANID,
            phone_number: user_found.phone_number,
            user_profile: user_found.user_profile,
          },
        };
        // Create and assign token
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
          expiresIn: "1d",
        });

        // Send the response

        // If otp is correct
        // user_found.otp = undefined;
        // user_found.otpExpiary = undefined;
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

/**
 * Reset password api
 * This api will be used to reset the password in whcih user will enter the phone number or  email and get
 * OTP verification code and then user will enter the new password and confirm password
 *
 */
exports.reset_password = [
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
      const { phone_number, email, otp, password, confirm_password } = req.body;

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
      //send otp to user and save in db

      // Check if user is verified
      if (user_found.isOTPVerified && user_found.password !== null) {
        if (req.body.otp) {
          // const verification_otp = await generateOTP(phone_number);
          // await sendMobile_OTP(phone_number, verification_otp);
          // user_found.otp = verification_otp;
          // user_found.otpExpiary = Date.now() + 600000;
          // const user_otp_saved = await user_found.save();
          // // Send the response
          // console.log("line 146", user_found);
          // console.log("line 146", user_otp_saved.otp == otp);

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
          //check the phone number and email is matched or not

          // Check if otp is correct
          if (user_otp_saved.otp !== otp) {
            return apiResponse.validationErrorWithData(res, "Invalid OTP");
          }

          // Check if otp is expired
          if (user_otp_saved.otpExpiary > Date.now()) {
            return apiResponse.validationErrorWithData(res, "OTP expired");
          }
          if (!req.body.password) {
            return apiResponse.validationErrorWithData(
              res,
              "Please provide the password"
            );
          }
          if (!req.body.confirm_password) {
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

          //Password hashing
          const salt = await bcrypt.genSalt(10);
          const hashed_password = await bcrypt.hash(password, salt);

          // If otp is correct
          user_found.otp = undefined;
          user_found.otpExpiary = undefined;
          user_found.password = hashed_password;
          const user_updated = await user_found.save();

          // Send the response
          return apiResponse.successResponseWithData(
            res,
            "Successfully reset password"
            //user_updated
          );
        } else {
          if (
            user_found.phone_number !== req.body.phone_number &&
            req.user.user.phone_number !== req.body.phone_number
          ) {
            return apiResponse.validationErrorWithData(
              res,
              "Phone number is not registered with this account"
            );
          }

          const verification_otp = await generateOTP(phone_number);
          await sendMobile_OTP(phone_number, verification_otp);
          user_found.otp = verification_otp;
          //user_found.otpExpiary = Date.now() + 600000;
          const user_otp_saved = await user_found.save();
          return apiResponse.successResponse(
            res,
            "OTP sent to your registered  mobile number"
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
        phone_number: req.user.user.phone_number,
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
      // Fetch the user from user_profile or from user_profile
      const user_found = await user_model.findOne({
        $or: [
          { _id: req.body.user_id },

          {
            "user_profile._id": req.body.user_id,
          },
        ],
      }); //.select("user_profile");
      console.log("line 80", user_found);

      // Check if the user exists
      if (!user_found) {
        return apiResponse.validationErrorWithData(res, "User not found");
      }

      let userToUpdate;
      if (user_found._id.toString() === req.body.user_id) {
        userToUpdate = user_found;
      } else {
        userToUpdate = user_found.user_profile.find(
          (profile) => profile._id === req.body.user_id
        );
      }

      // Toggle the isBlocked status
      userToUpdate.isBlocked = !userToUpdate.isBlocked;

      if (user_found.isBlocked) {
        user_found.isBlocked = false;
        const user_blocked = await user_found.save();
        const blocked_user_response = {
          _id: user_blocked._id,
          profile_image: user_blocked.profile_image,
          full_name: user_blocked.full_name,
          phone_number: user_blocked.phone_number,
          email: user_blocked.email,
          isBlocked: user_blocked.isBlocked,
        };
        return apiResponse.successResponseWithData(
          res,
          "Successfully, User profile unblocked",
          blocked_user_response //user_blocked
        );
      }
      // Block the user
      user_found.isBlocked = true;
      const user_blocked = await user_found.save();
      const blocked_user_response = {
        _id: user_blocked._id,
        profile_image: user_blocked.profile_image,
        full_name: user_blocked.full_name,
        phone_number: user_blocked.phone_number,
        email: user_blocked.email,
        isBlocked: user_blocked.isBlocked,
      };

      return apiResponse.successResponseWithData(
        res,
        "Successfully, User profile blocked",
        blocked_user_response // user_blocked
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
