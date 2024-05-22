/**
 * Medicine Controller
 */
const medicine_model = require("../models/medicines.models");
const apiResponse = require("../response/apiResponse");
const login_validator =
  require("../middlewares/jwt.auth.middleware").authentication;
const { check, validationResult } = require("express-validator");

//add medicine

exports.add_medicine = [
  login_validator,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error",
          errors.array()
        );
      }
      const {
        medicine_name,
        medicine_type,
        medicine_dosage,
        meal,
        medicine_start_date,
        medicine_stop_date,
        time_for_reminder,

        isReminderSet,
        add_note,
      } = req.body;
      console.log("line 36", medicine_name, req.body);
      // if (!medicine_name) {
      //   return apiResponse.validationErrorWithData(
      //     res,
      //     "Medicine name is required"
      //   );
      // }
      // if (!medicine_type) {
      //   return apiResponse.validationErrorWithData(
      //     res,
      //     "Medicine type is required"
      //   );
      // }
      // if (!medicine_dosage) {
      //   return apiResponse.validationErrorWithData(
      //     res,
      //     "Medicine dosage is required"
      //   );
      // }

      // if (!medicine_start_date) {
      //   return apiResponse.validationErrorWithData(
      //     res,
      //     "Medicine start date is required"
      //   );
      // }
      // if (!medicine_stop_date) {
      //   return apiResponse.validationErrorWithData(
      //     res,
      //     "Medicine end date is required"
      //   );
      //}
      // if(!remarks){
      //     return apiResponse.validationErrorWithData(res,"Remarks is required")
      // }
      const { medicines } = req.body;

      const user_id = req.user.user._id;
      const CANID = req.user.user.CANID;

      // Check if the user already has a medicine record
      let medicine_found = await medicine_model.findOne({ user_id });

      if (!medicine_found) {
        // Create a new medicine record if it doesn't exist
        medicine_found = new medicine_model({ user_id, medicines: [] });
      }

      // Append the new medicines to the existing list
      medicines.forEach((medicine) => {
        medicine_found.medicines.push({
          CANID,
          ...medicine,
        });
      });
      // save the record
      let medicine_saved = await medicine_found.save();
      return apiResponse.successResponseWithData(
        res,
        "Medicine added successfully",
        medicine_saved
      );
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
 * Update Medicine API
 * This api will be update the fields provided by user
 */

exports.update_medicine = [
  login_validator,
  // check("medicine_name").notEmpty().withMessage("Medicine name can not be empty"),
  // check("medicine_type").notEmpty().withMessage("Medicine type can not be empty"),
  // check("medicine_dosage")
  //   .notEmpty()
  //   .withMessage("Medicine dosage  can not be empty"),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error",
          errors.array()
        );
      }
      const {
        medicine_name,
        medicine_type,
        medicine_dosage,
        meal,
        medicine_start_date,
        medicine_stop_date,
        time_for_reminder,
        isReminderSet,
        add_note,
      } = req.body;

      const medicine = await medicine_controller.findOneAndUpdate(
        { _id: req.body.medicine_id, user_id: req.user.user._id },
        {
          $set: {
            user_id: req.user.user._id,
            CANID: req.user.user.CANID,
            medicine_name,
            medicine_type,
            medicine_dosage,

            meal,
            time_for_reminder,
            medicine_start_date,
            medicine_stop_date,
            isReminderSet,
            add_note,
          },
        },
        { new: true }
      );
      if (!medicine) {
        return apiResponse.validationErrorWithData(res, "Medicine not found");
      }
      return apiResponse.successResponseWithData(
        res,
        "Medicine updated successfully",
        medicine
      );
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
 * Delete Medicine API
 * This api will be delete the medicine
 */

exports.delete_medicine = [
  login_validator,
  check("medicine_id").notEmpty().withMessage("Medicine id can not be empty"),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error",
          errors.array()
        );
      }

      const medicine = await medicine_controller.findOneAndDelete({
        _id: req.body.medicine_id,
      });
      if (!medicine) {
        return apiResponse.validationErrorWithData(res, "Medicine not found");
      }
      return apiResponse.successResponseWithData(
        res,
        "Medicine deleted successfully",
        medicine
      );
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
 * Get Medicine List API
 * This api will be get the medicine list
 */

exports.get_medicine_list = [
  login_validator,
  async (req, res) => {
    try {
      const medicine = await medicine_controller.find({
        user_id: req.user.user._id,
      });
      if (!medicine) {
        return apiResponse.validationErrorWithData(res, "Medicine not found");
      }
      return apiResponse.successResponseWithData(
        res,
        "Medicine list",
        medicine
      );
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
 * Get Medicine Details API
 * This api will be get the medicine details
 */

exports.get_medicine_details = [
  login_validator,
  check("medicine_id").notEmpty().withMessage("Medicine id can not be empty"),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error",
          errors.array()
        );
      }

      const medicine = await medicine_controller.findOne({
        _id: req.body.medicine_id,
      });
      if (!medicine) {
        return apiResponse.validationErrorWithData(res, "Medicine not found");
      }
      return apiResponse.successResponseWithData(
        res,
        "Medicine details",
        medicine
      );
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

//Get Medicine list

exports.get_medicine_list = [
  login_validator,
  async (req, res) => {
    try {
      const medicine = await medicine_controller.find({
        user_id: req.user.user._id,
      });
      if (!medicine) {
        return apiResponse.validationErrorWithData(res, "Medicine not found");
      }
      return apiResponse.successResponseWithData(
        res,
        "Medicine list",
        medicine
      );
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
