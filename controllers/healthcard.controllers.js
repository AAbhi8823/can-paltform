/**
 * Health Card controllers
 */

const healthcard_model = require("../models/healthcard.model");
const user_model = require("../models/user.model");
const login_validator =
  require("../middlewares/jwt.auth.middleware").authentication;
const { validationResult } = require("express-validator");
//const { single_file_upload } = require("../helpers/aws.s3");
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

const upload = multer({ storage: multer.memoryStorage() });

// exports.add_healthcard = [
//   login_validator,
//   upload.fields([
//     { name: "adhaar_card", maxCount: 1 },
//     { name: "fit_to_fly_certificate", maxCount: 1 },
//     { name: "biopsy_certificate", maxCount: 1 },
//   ]),

//   async (req, res) => {
//     try {
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return res.status(422).json({
//           errors: errors.array(),
//         });
//       }

//       let {
//         name,
//         gender,
//         date_of_birth,
//         blood_group,
//         height,
//         weight,
//         cancer_type,
//         cancer_stage,
//         current_treatment,
//         presiding_doctor,
//         hospital_details_primary,
//         hospital_details,
//         emergency_contact,
//       } = req.body;

//       const user_id = req.user.user._id;

//       if (emergency_contact) {
//         emergency_contact = JSON.parse(emergency_contact);

//         const user = await user_model.findOne({ _id: user_id });
//         if (!user) {
//           return res.status(404).json({
//             message: "User not found",
//           });
//         }

//         let files = req.files;

//         const upload_file_to_S3 = async (file) => {
//           return await awsS3.single_file_upload(file.buffer, file.originalname);
//         };

//         var adhaar_card_url = null;
//         var fit_to_fly_certificate_url = null;
//         var biopsy_certificate_url = null;
//         if (files["adhaar_card"]) {
//           adhaar_card_url = await upload_file_to_S3(files["adhaar_card"][0]);
//         }
//         if (files["fit_to_fly_certificate"]) {
//           fit_to_fly_certificate_url = await upload_file_to_S3(files["fit_to_fly_certificate"][0]);
//         }
//         if (files["biopsy_certificate"]) {
//           biopsy_certificate_url = await upload_file_to_S3(files["biopsy_certificate"][0]);
//         }

//         const healthcard = await healthcard_model.findOne({ user_id: user_id });

//         if (healthcard) {
//           let isUpdated = false;

//           // Only update fields if they are different
//           if (name && healthcard.name !== name) {
//             healthcard.name = name;
//             isUpdated = true;
//           }
//           if (gender && healthcard.gender !== gender) {
//             healthcard.gender = gender;
//             isUpdated = true;
//           }
//           if (date_of_birth && healthcard.date_of_birth !== date_of_birth) {
//             healthcard.date_of_birth = date_of_birth;
//             isUpdated = true;
//           }
//           if (blood_group && healthcard.blood_group !== blood_group) {
//             healthcard.blood_group = blood_group;
//             isUpdated = true;
//           }
//           if (height && healthcard.height !== height) {
//             healthcard.height = height;
//             isUpdated = true;
//           }
//           if (weight && healthcard.weight !== weight) {
//             healthcard.weight = weight;
//             isUpdated = true;
//           }
//           if (cancer_type && healthcard.cancer_type !== cancer_type) {
//             healthcard.cancer_type = cancer_type;
//             isUpdated = true;
//           }
//           if (cancer_stage && healthcard.cancer_stage !== cancer_stage) {
//             healthcard.cancer_stage = cancer_stage;
//             isUpdated = true;
//           }
//           if (current_treatment && healthcard.current_treatment !== current_treatment) {
//             healthcard.current_treatment = current_treatment;
//             isUpdated = true;
//           }
//           if (presiding_doctor && healthcard.presiding_doctor !== presiding_doctor) {
//             healthcard.presiding_doctor = presiding_doctor;
//             isUpdated = true;
//           }
//           if (hospital_details_primary && healthcard.hospital_details_primary !== hospital_details_primary) {
//             healthcard.hospital_details_primary = hospital_details_primary;
//             isUpdated = true;
//           }
//           if (hospital_details && healthcard.hospital_details !== hospital_details) {
//             healthcard.hospital_details = hospital_details;
//             isUpdated = true;
//           }
//           if (emergency_contact && JSON.stringify(healthcard.emergency_contact) !== JSON.stringify(emergency_contact)) {
//             healthcard.emergency_contact = emergency_contact;
//             isUpdated = true;
//           }
//           if (adhaar_card_url && healthcard.adhaar_card !== adhaar_card_url) {
//             healthcard.adhaar_card = adhaar_card_url;
//             isUpdated = true;
//           }
//           if (fit_to_fly_certificate_url && healthcard.fit_to_fly_certificate !== fit_to_fly_certificate_url) {
//             healthcard.fit_to_fly_certificate = fit_to_fly_certificate_url;
//             isUpdated = true;
//           }
//           if (biopsy_certificate_url && healthcard.biopsy_certificate !== biopsy_certificate_url) {
//             healthcard.biopsy_certificate = biopsy_certificate_url;
//             isUpdated = true;
//           }

//           if (isUpdated) {
//             const updated_healthcard = await healthcard.save();
//             return res.status(200).json({
//               message: "Health card updated successfully",
//               data: updated_healthcard,
//             });
//           } else {
//             return res.status(200).json({
//               message: "No changes detected in the health card",
//               data: healthcard,
//             });
//           }
//         } else {
//           const new_healthcard = new healthcard_model({
//             user_id,
//             CANID: req.user.user.CANID,
//             name,
//             gender,
//             date_of_birth,
//             blood_group,
//             height,
//             weight,
//             cancer_type,
//             cancer_stage,
//             current_treatment,
//             presiding_doctor,
//             hospital_details_primary,
//             hospital_details,
//             emergency_contact,
//             adhaar_card: adhaar_card_url,
//             fit_to_fly_certificate: fit_to_fly_certificate_url,
//             biopsy_certificate: biopsy_certificate_url,
//           });

//           const healthcard_saved = await new_healthcard.save();
//           return res.status(201).json({
//             message: "Successfully created health card",
//             data: healthcard_saved,
//           });
//         }
//       } else {
//         return res.status(400).json({
//           message: "Emergency contact is required",
//         });
//       }
//     } catch (err) {
//       return res.status(500).json({
//         status: false,
//         message: "Server error...",
//         error: err.message,
//       });
//     }
//   },
// ];

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
      var{
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
      } = req.body;

      const user_id = req.user.user._id;

      if (emergency_contact) {
        // Parse emergency_contact
         emergency_contact = JSON.parse(emergency_contact);
      }

      console.log("line 58", user_id);
      const user = await user_model.findOne({ _id: user_id });
      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      // Extract uploaded file details
      let files = req.files;

      // Upload files to S3 and get their URLs
      const upload_file_to_S3 = async (file) => {
        return await awsS3.single_file_upload(file.buffer, file.originalname);
      };

      var adhaar_card_url = null;
      var fit_to_fly_certificate_url = null;
      var biopsy_certificate_url = null;
      if (files["adhaar_card"]) {
        adhaar_card_url = await upload_file_to_S3(files["adhaar_card"][0]);
      }
      if (files["fit_to_fly_certificate"]) {
        fit_to_fly_certificate_url = await upload_file_to_S3(
          files["fit_to_fly_certificate"][0]
        );
      }
      if (files["biopsy_certificate"]) {
        biopsy_certificate_url = await upload_file_to_S3(
          files["biopsy_certificate"][0]
        );
      }

      // Check if health card already exists for this user
      const healthcard = await healthcard_model.findOne({ user_id: user_id });

      if (healthcard) {
        // Update existing health card
        healthcard.name = name || healthcard.name;
        healthcard.gender = gender || healthcard.gender;
        healthcard.date_of_birth = date_of_birth || healthcard.date_of_birth;
        healthcard.blood_group = blood_group || healthcard.blood_group;
        healthcard.height = height || healthcard.height;
        healthcard.weight = weight || healthcard.weight;
        healthcard.cancer_type = cancer_type || healthcard.cancer_type;
        healthcard.cancer_stage = cancer_stage || healthcard.cancer_stage;
        healthcard.current_treatment =
          current_treatment || healthcard.current_treatment;
        healthcard.presiding_doctor =
          presiding_doctor || healthcard.presiding_doctor;
        healthcard.hospital_details_primary =
          hospital_details_primary || healthcard.hospital_details_primary;
        healthcard.hospital_details =
          hospital_details || healthcard.hospital_details;
        healthcard.emergency_contact =
          emergency_contact || healthcard.emergency_contact;
        healthcard.adhaar_card = adhaar_card_url || healthcard.adhaar_card;
        healthcard.fit_to_fly_certificate =
          fit_to_fly_certificate_url || healthcard.fit_to_fly_certificate;
        healthcard.biopsy_certificate =
          biopsy_certificate_url || healthcard.biopsy_certificate;

        const updated_healthcard = await healthcard.save();
        return res.status(200).json({
          message: "Health card updated successfully",
          data: updated_healthcard,
        });
      } else {
        // Create new health card
        const new_healthcard = new healthcard_model({
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
          emergency_contact, // No need to parse emergency_contact as JSON
          adhaar_card: adhaar_card_url,
          fit_to_fly_certificate: fit_to_fly_certificate_url,
          biopsy_certificate: biopsy_certificate_url,
        });

        const healthcard_saved = await new_healthcard.save();
        return res.status(201).json({
          message: "Successfully created health card",
          data: healthcard_saved,
        });
      }
      // } else {
      //   return res.status(400).json({
      //     message: "Emergency contact is required",
      //   });
      // }
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
  upload.fields([
    { name: "adhaar_card", maxCount: 1 },
    { name: "fit_to_fly_certificate", maxCount: 1 },
    { name: "biopsy_certificate", maxCount: 1 },
  ]), // Use single instead of fields
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({
          errors: errors.array(),
        });
      }

      // Extract uploaded file details
      const file = req.files;
      console.log(
        "line 227",
        file["adhaar_card"][0].buffer,
        file["adhaar_card"][0].originalname
      );

      console.log("line  233", file.buffer, file.originalname);
      let adhaar_card_url = null;
      let fit_to_fly_certificate_url = null;
      let biopsy_certificate_url = null;
      // Upload the adhaar card to S3
      adhaar_card_url = await awsS3.single_file_upload(
        file["adhaar_card"][0].buffer,
        file["adhaar_card"][0].originalname
      );
      console.log("line 239", adhaar_card_url);
      // Upload the fit to fly certificate to S3
      fit_to_fly_certificate_url = await awsS3.single_file_upload(
        file["fit_to_fly_certificate"][0].buffer,
        file["fit_to_fly_certificate"][0].originalname
      );
      // Upload the biopsy certificate to S3
      biopsy_certificate_url = await awsS3.single_file_upload(
        file["biopsy_certificate"][0].buffer,
        file["biopsy_certificate"][0].originalname
      );
      console.log(
        "line 246",
        adhaar_card_url,
        fit_to_fly_certificate_url,
        biopsy_certificate_url
      );
      // Update health card
      return updateHealthCard(
        req,
        res,
        adhaar_card_url,
        fit_to_fly_certificate_url,
        biopsy_certificate_url
      );
    } catch (err) {
      return res.status(500).json({
        message: err.message,
      });
    }
  },
];

// Update health card function
async function updateHealthCard(
  req,
  res,
  adhaar_card_url,
  fit_to_fly_certificate_url,
  biopsy_certificate_url
) {
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
      emergency_contact: req.body.emergency_contact,

      // Update document fields if file URL is provided
      adhaar_card: adhaar_card_url,
      fit_to_fly_certificate: fit_to_fly_certificate_url,
      biopsy_certificate: biopsy_certificate_url,
    };

    // Update document fields if file URL is provided
    // if (document_attached_url) {
    //   updateObject.document_attached = {
    //     document_name: req.file.originalname,
    //     document_url: document_attached_url,
    //   };
    // }
    // if (!req.body.healthcard_id) {
    //   return res.status(400).json({
    //     message: "Health card ID is required",
    //   });
    // }

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
