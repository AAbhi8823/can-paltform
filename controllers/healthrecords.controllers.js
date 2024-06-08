/**
 * Helath Records Controllers
 * In this the document will be uploaded to the s3 bucket and store the document url in db
 */

const healthrecords_model= require("../models/healthrecords.models");
//const health_record_folder_model = require("../models/healthrecords.models");
const user_model = require("../models/user.model");
const aws = require("../helpers/aws.s3");

const apiResponse = require("../response/apiResponse");
const { validationResult } = require("express-validator");
const login_validator =
  require("../middlewares/jwt.auth.middleware").authentication;
const multer = require("multer");
const { Health } = require("aws-sdk");
//multer storage
const upload = multer({ storage: multer.memoryStorage() });

//===========================ADD HEALTH RECORD API===================================================//

exports.add_health_record = [
  login_validator,
  upload.single("document"),
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
      if (!req.file || !req.file.buffer || !req.file.originalname) {
        return apiResponse.validationErrorWithData(
          res,
          "Invalid file format or missing file"
        );
      }
      // if (!req.body.CANID) {
      //   return apiResponse.validationErrorWithData(res, "CANID is required!");
      // }
      if (!req.body.document_name) {
        return apiResponse.validationErrorWithData(
          res,
          "Document name is required"
        );
      }
      let user_id = req.user.user._id;
      console.log(" line 47 user_id", user_id);
      // Check if the user exists
      const user_found = await user_model.findOne({
        _id: user_id,
      });

      if (!user_found) {
        return apiResponse.validationErrorWithData(res, "User not found");
      }

      //check the size of the file and type of the file and store the file in s3 bucket
      if (req.file.size > 500000) {
        return apiResponse.validationErrorWithData(
          res,
          "File size should not exceed 5MB"
        );
      }

     // console.log("line 63", req.file);


      // Upload document to S3 bucket
      const document_url = await aws.single_file_upload(
        req.file.buffer,
        req.file.originalname
      );
      //console.log("line 64", document_url);
      // Create new health record
      const health_record = new healthrecords_model({
        user_id: user_found._id,
        doc_id: req.body.doc_id,
        CANID: user_found.CANID,
        document_type: req.file.mimetype,
        document_size: req.file.size,
        document_name: req.body.document_name,
        document_url: document_url,
        document_description: req.body.document_description,
      });

      // Save health record
      const health_record_saved = await health_record.save();

      // Return success response
      return apiResponse.successResponseWithData(
        res,
        "Health record added successfully",
        health_record_saved
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

//===========================GET HEALTH RECORDS API===================================================//

// Get Health records by user
exports.get_health_records_list_by_user = [
  login_validator,
  async (req, res) => {
    try {
      // Check if the user exists
      const user_found = await user_model.findOne({
        _id: req.user.user._id,
      });

      if (!user_found) {
        return apiResponse.validationErrorWithData(res, "User not found");
      }

      // Get health records
      const health_records = await healthrecords_model.find({
       $and: [{ user_id: user_found._id }, { doc_id: req.params.doc_id }],

      });

      // Return success response
      return apiResponse.successResponseWithData(
        res,
        "Health records fetched successfully",
        health_records
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

//===========================DELETE HEALTH RECORD API===================================================//

exports.delete_health_record = [
  login_validator,
  async (req, res) => {
    try {
      // Check if the user exists
      const user_found = await user_model.findOne({
        _id: req.user.user._id,
      });

      if (!user_found) {
        return apiResponse.validationErrorWithData(res, "User not found");
      }

      // Check if the health record exists
      const health_record = await healthrecords_model.findOneAndDelete({
        _id: req.params.healthrecord_id,
        user_id: req.user.user._id,
        doc_id: req.params.doc_id,
      });

      if (!health_record) {
        return apiResponse.validationErrorWithData(
          res,
          "Health record not found"
        );
      }

      // Return success response
      return apiResponse.successResponseWithData(
        res,
        "Health record deleted successfully",
        health_record
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

//===========================UPDATE HEALTH RECORD API===================================================//

exports.update_health_record = [
  login_validator,
  upload.single("document"),
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
        _id: req.user.user._id,
      });
      if (!user_found) {
        return apiResponse.validationErrorWithData(res, "User not found");
      }

      // Check if the health record exists
      const health_record = await healthrecords_model.findOne({
        _id: req.body.healthrecord_id,
        user_id: req.user.user._id,
      });
      if (!health_record) {
        return apiResponse.validationErrorWithData(
          res,
          "Health record not found"
        );
      }
      console.log("line 186", req.file);
      // Check if a new document file is uploaded

      // Upload document to S3 bucket
      if (req.file) {
        const document_url = await aws.single_file_upload(
          req.file.buffer,
          req.file.originalname
        );
        health_record.document_name =
          req.body.document_name || health_record.document_name;
        health_record.document_description =
          req.body.document_description || health_record.document_description;
        health_record.document_url = document_url || health_record.document_url;
        health_record.document_type =
          req.body.document_type || health_record.document_type;
        health_record.document_date =
          req.body.document_date || health_record.document_date;
      }

      // Update health record fields (excluding document file)
      health_record.document_name =
        req.body.document_name || health_record.document_name;
      health_record.document_description =
        req.body.document_description || health_record.document_description;

      health_record.document_type =
        req.body.document_type || health_record.document_type;
      health_record.document_date =
        req.body.document_date || health_record.document_date;

      // Save updated health record
      const updated_health_record = await health_record.save();

      // Return success response
      return apiResponse.successResponseWithData(
        res,
        "Health record updated successfully",
        updated_health_record
      );
    } catch (err) {
      // Handle errors
      return apiResponse.serverErrorResponse(
        res,
        "Server Error...!",
        err.message
      );
    }
  },
];

/**
 * Create a folder for health records and add documents to the folder
 * 
//  */

// exports.add_health_record_folder= [
//   login_validator,
//   async (req, res) => {
//     try {
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return apiResponse.validationErrorWithData(
//           res,
//           "Validation Error.",
//           errors.array()
//         );
//       }

//       // Check if the user exists
//       const user_found = await user_model.findOne({
//         _id: req.user.user._id,
//       });
//       if (!user_found) {
//         return apiResponse.validationErrorWithData(res, "User not found");
//       }

//       // Create new health record folder
//       const health_record_folder = new healthrecords_model.HealthRecordFolder({
//         user_id: req.user.user._id,
//         CANID: req.user.user.CANID,
//         folder_name: req.body.folder_name,
//         folder_description: req.body.folder_description,
//         documents: req.body.documents,
//       });


//       // Save health record folder
//       const health_record_folder_saved = await health_record_folder.save();

//       // Return success response
//       return apiResponse.successResponseWithData(
//         res,
//         "Health record folder created successfully",
//         health_record_folder_saved
//       );
//     } catch (err) {
//       return apiResponse.serverErrorResponse(
//         res,
//         "Server Error...!",
//         err.message
//       );
//     }
//   },
// ];

/**
 * Get health record folders by user
 * 
 */

// exports.get_health_record_folders_list = [
//   login_validator,
//   async (req, res) => {
//     try {
//       // Check if the user exists
//       const user_found = await user_model.findOne({
//         _id: req.user.user._id,
//       });

//       if (!user_found) {
//         return apiResponse.validationErrorWithData(res, "User not found");
//       }

//       // Get health record folders
//       const health_record_folders = await healthrecords_model.HealthRecordFolder.find({
//         user_id: user_found._id,
//       });

//       // Return success response
//       return apiResponse.successResponseWithData(
//         res,
//         "Health record folders fetched successfully",
//         health_record_folders
//       );
//     } catch (err) {
//       return apiResponse.serverErrorResponse(
//         res,
//         "Server Error...!",
//         err.message
//       );
//     }
//   },
// ];

