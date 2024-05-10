/**
 * Health Card controllers
 */

const healthcard_model = require("../models/healthcard.model");
const user_model = require("../models/user.model");
const login_validator =
  require("../middlewares/jwt.auth.middleware").authentication;
const { validationResult } = require("express-validator");
const { single_file_upload } = require("../helpers/aws.s3");
const awsS3 = require("../helpers/aws.s3");

const apiResponse = require("../response/apiResponse");

const dotenv = require("dotenv");
dotenv.config();

// const storage = multer.memoryStorage({
//     destination: function (req, file, callback) {
//       callback(null, "");
//     },
//   });

//   const upload = multer({ storage }).single("file");

/**
 * Add healthcard api
 */

const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
exports.add_healthcard = [
  login_validator,
  upload.fields([{ name: "document_attached", maxCount: 10 }]),

  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({
          errors: errors.array(),
        });
      }
      console.log("line 45", req.body);
      const {
        name,
        gender,
        date_of_birth,
        blood_group,
        height,
        weight,
        cancer_type,
        cancer_stage,
        current_treatment,
        presiding_doctor,
        hospital_details_primary,
        hospital_details,
        emergency_conatct,
        document_attached,
      } = req.body;

      // Uncomment the following lines if you have user authentication and want to get user_id
      const user_id = req.user.user._id;
      const user = await user_model.findOne({ _id: user_id });
      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }
      //uploading files to s3 bucket and getting the url of the file and storing it in the database
      let files = req.files;
     
      if (!files || files.length == 0) {
        return res.status(400).send({ status: false, msg: "No filse found" });
      }
      let documents_attached = files.document_attached.map((file) => ({
        originalname: file.originalname,
        buffer: file.buffer,
      }));
     console.log("line 32", documents_attached);

      const documents_attached_url = await awsS3.multiple_file_upload(
        documents_attached
      );

      // Create health card
      const healthcard = new healthcard_model({
        // user_id,
        // CANID: req.user.CANID,
        name,
        gender,
        date_of_birth,
        blood_group,
        height,
        weight,
        cancer_type,
        cancer_stage,
        current_treatment,
        presiding_doctor,
        hospital_details_primary,
        hospital_details,
        emergency_conatct,
        document_attached: {
            document_name: documents_attached.map((file) => file.originalname),
            document_url: documents_attached_url,
        }
      
      });

      const healthcard_saved = await healthcard.save();
      return apiResponse.successResponseWithData(
        res,
        "Successfully,Healthcard added",
        healthcard_saved
      );
    } catch (err) {
      return res.status(500).json({
        message: err.message,
      });
    }
  },
];

/**
 * Get healthcard api
 */

exports.get_healthcard = [
  login_validator,
  async (req, res) => {
    try {
      const user_id = req.user._id;
      const healthcard = await healthcard_model.findOne({ user_id: user_id });
      if (!healthcard) {
        return res.status(404).json({
          message: "Healthcard not found",
        });
      }
      return apiResponse.successResponseWithData(
        res,
        "Successfully,Healthcard fetched",
        healthcard
      );
    } catch (err) {
      return apiResponse.serverErrorResponse(res, "Server error", err.message);
    }
  },
];
