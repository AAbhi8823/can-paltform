/**
 * Helath Records Controllers
 * In this the document will be uploaded to the s3 bucket and store the document url in db
 */

const healthrecords_model = require("../models/healthrecords.models");
const user_model = require("../models/user.model");
const aws = require("../helpers/aws.s3");

const apiResponse = require("../response/apiResponse");
const { validationResult } = require("express-validator");

const multer = require("multer");
//multer storage
const upload = multer({ storage: multer.memoryStorage() });

//===========================ADD HEALTH RECORD API===================================================//

exports.add_health_record = [
  upload.single("document"),
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
      if (!req.body.CANID) {
        return apiResponse.validationErrorWithData(res, "CANID is required!");
      }
      if (!req.body.document_name) {
        return apiResponse.validationErrorWithData(
          res,
          "Document name is required"
        );
      }

      // Check if the user exists
      const user_found = await user_model.findOne({
        CANID: req.body.CANID,
      });

      if (!user_found) {
        return apiResponse.validationErrorWithData(res, "User not found");
      }

      // Upload document to S3 bucket
      const document_url = await aws.single_file_upload(
        req.file.buffer,
        req.file.originalname
      );
      console.log("line 64", document_url);
      // Create new health record
      const health_record = new healthrecords_model({
        CANID: user_found.CANID,
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
