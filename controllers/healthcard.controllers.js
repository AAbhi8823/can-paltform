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
const validator = require("../validators/validator");

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
const { prototype } = require("aws-sdk/clients/acm");
const upload = multer({ storage: multer.memoryStorage() });
exports.add_healthcard = [
  login_validator,
  upload.fields([
    { name: "adhaar_card", maxCount: 1 },
    { name: "fit_to_fly_certificate", maxCount: 1 },
    { name: "biopsy_certificate", maxCount: 1 },
  ]),

  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({
          errors: errors.array(),
        });
      }
      console.log("line 45", req.body);
      let {
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
        emergency_contact,
        adhaar_card,
        fit_to_fly_certificate,
        biopsy_certificate,
      } = req.body;

      const user_id = req.user.user._id;
      if (emergency_contact) {
        //parse emergency_contact
        emergency_contact = JSON.parse(emergency_contact);
        // Uncomment the following lines if you have user authentication and want to get user_id

        console.log("line 58", user_id);
        const user = await user_model.findOne({ _id: user_id });
        if (!user) {
          return res.status(404).json({
            message: "User not found",
          });
        }
        //validate the phone number of emergency contact which in an arra
        for (let i = 0; i < emergency_contact.length; i++) {
          if (!validator.validatePhoneNumber(emergency_contact[i].phone)) {
            return res.status(400).json({
              message: "Invalid phone number",
            });
          }
        }
      }

      //uploading files to s3 bucket and getting the url of the file and storing it in the database
      let files = req.files;

      if (!files || files.length == 0) {
        return res.status(400).send({ status: false, msg: "No files found" });
      }
      if (files.adhaar_card) {
        let adhaar_card = files.adhaar_card.map((file) => ({
          originalname: file.originalname,
          buffer: file.buffer,
        }));
        console.log("line 86", adhaar_card);

        var adhaar_card_url = await awsS3.single_file_upload(adhaar_card);
        // console.log("line 89", adhaar_card_url);
      }
      if (files.fit_to_fly_certificate) {
        let fit_to_fly_certificate = files.fit_to_fly_certificate.map(
          (file) => ({
            originalname: file.originalname,
            buffer: file.buffer,
          })
        );
        // console.log("line 96", fit_to_fly_certificate);

        var fit_to_fly_certificate_url = await awsS3.single_file_upload(
          fit_to_fly_certificate
        );
        // console.log("line 101", fit_to_fly_certificate_url);
      }
      if (files.biopsy_certificate) {
        let biopsy_certificate = files.biopsy_certificate.map((file) => ({
          originalname: file.originalname,
          buffer: file.buffer,
        }));
        // console.log("line 110", biopsy_certificate);

        var biopsy_certificate_url = await awsS3.single_file_upload(
          biopsy_certificate
        );
        // console.log("line 115", biopsy_certificate_url);
      }

      //  let parsedEmergencyContact ;
      //       if (typeof emergency_contact === 'string') {
      //         try {
      //             parsedEmergencyContact = JSON.parse(emergency_contact);
      //             console.log("line 125",typeof parsedEmergencyContact);
      //         } catch (e) {
      //             console.log("line 125", e);
      //         }
      //     }

      // Create health card
      const healthcard = new healthcard_model({
        user_id,
        CANID: req.user.user.CANID,
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
        emergency_contact: emergency_contact, // No need to parse emergency_contact as JSON
        adhaar_card: adhaar_card_url,
        fit_to_fly_certificate: fit_to_fly_certificate_url,
        biopsy_certificate: biopsy_certificate_url,
      });

      const healthcard_saved = await healthcard.save();
      return apiResponse.successResponseWithData(
        res,
        "Successfully,Healthcard added",
        healthcard_saved
      );
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server error...",
        error: err.message,
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
      const user_id = req.user.user._id;
      console.log("line 45", user_id);
      const healthcard = await healthcard_model.find({ user_id: user_id });
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

/**
 * Update healthcard api
 */

exports.update_healthcard = [
  login_validator,
  upload.single("document_attached"), // Use single instead of fields
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({
          errors: errors.array(),
        });
      }

      // Extract uploaded file details
      const file = req.file;
      if (!file) {
        // If no file is uploaded, proceed with updating other fields
        return updateHealthCard(req, res, null);
      }

      // Upload the single file
      const document_attached_url = await awsS3.single_file_upload({
        originalname: file.originalname,
        buffer: file.buffer,
      });

      // Proceed with updating health card with the file URL
      return updateHealthCard(req, res, document_attached_url);
    } catch (err) {
      return res.status(500).json({
        message: err.message,
      });
    }
  },
];

async function updateHealthCard(req, res, document_attached_url) {
  try {
    // Construct update object for health card
    const updateObject = {
      name: req.body.name,
      gender: req.body.gender,
      date_of_birth: req.body.date_of_birth,
      blood_group: req.body.blood_group,
      height: req.body.height,
      weight: req.body.weight,
      cancer_type: req.body.cancer_type,
      cancer_stage: req.body.cancer_stage,
      current_treatment: req.body.current_treatment,
      presiding_doctor: req.body.presiding_doctor,
      hospital_details_primary: req.body.hospital_details_primary,
      hospital_details: req.body.hospital_details,
    };

    // Update document fields if file URL is provided
    if (document_attached_url) {
      updateObject.document_attached = {
        document_name: req.file.originalname,
        document_url: document_attached_url,
      };
    }
    if (!req.body.healthcard_id) {
      return res.status(400).json({
        message: "Health card ID is required",
      });
    }

    // Update health card
    const updatedHealthCard = await healthcard_model.findOneAndUpdate(
      { user_id: req.user.user._id, _id: req.body.healthcard_id },
      { $set: updateObject },
      { new: true } // Return the updated document
    );

    if (!updatedHealthCard) {
      return res.status(404).json({
        message: "Health card not found",
      });
    }

    return apiResponse.successResponseWithData(
      res,
      "Successfully updated health card",
      updatedHealthCard
    );
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
}
