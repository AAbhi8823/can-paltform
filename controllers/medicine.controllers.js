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
  // Uncomment the validation lines as needed
  // check("medicine_name").notEmpty().withMessage("Medicine name cannot be empty"),
  // check("medicine_type").notEmpty().withMessage("Medicine type cannot be empty"),
  // check("medicine_dosage").notEmpty().withMessage("Medicine dosage cannot be empty"),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(res, "Validation Error", errors.array());
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
        add_note
      } = req.body;

      const user_id = req.user.user._id;
      const medicine_id = req.body.medicine_id;

      console.log("line 36", medicine_id, user_id);

      const medicine = await medicine_model.findOneAndUpdate(
        { user_id: user_id, "medicines._id": medicine_id },
        {
          $set: {
            "medicines.$.CANID": req.user.user.CANID,
            "medicines.$.medicine_name": medicine_name,
            "medicines.$.medicine_type": medicine_type,
            "medicines.$.medicine_dosage": medicine_dosage,
            "medicines.$.meal": meal,
            "medicines.$.time_for_reminder": time_for_reminder,
            "medicines.$.medicine_start_date": medicine_start_date,
            "medicines.$.medicine_stop_date": medicine_stop_date,
            "medicines.$.isReminderSet": isReminderSet,
            "medicines.$.add_note": add_note
          }
        },
        { new: true }
      );

      if (!medicine) {
        return apiResponse.validationErrorWithData(res, "Medicine not found");
      }

      return apiResponse.successResponseWithData(res, "Medicine updated successfully", medicine);
    } catch (err) {
      console.log(err);
      return apiResponse.serverErrorResponse(res, "Server Error...!", err.message);
    }
  }
];


/**
 * Delete Medicine API
 * This api will be delete the medicine
 */

exports.delete_medicine = [
  login_validator,
  check("medicine_id").notEmpty().withMessage("Medicine id cannot be empty"),
  async (req, res) => {
    try {
      // Validate the request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error",
          errors.array()
        );
      }

      // Find and update the user's medicines by removing the specified medicine
      const userId = req.user.user._id;
      const medicineId = req.params.medicine_id;
      console.log("line 36", userId, medicineId);

      const medicine = await medicine_model.findOneAndUpdate(
        { user_id: userId },
        {
          $pull: {
            medicines: { _id: medicineId }
          }
        },
        { new: true } // Return the modified document
      );

      // Check if the medicine was found and deleted
      if (!medicine) {
        return apiResponse.validationErrorWithData(res, "Medicine not found");
      }

      // Check if the medicine array was modified
      const isMedicineDeleted = !medicine.medicines.some(med => med._id == medicineId);
      if (!isMedicineDeleted) {
        return apiResponse.validationErrorWithData(res, "Medicine not deleted");
      }

      // Respond with success
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
      const medicine = await medicine_model.find({
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

exports.get_medicine_details_by_id = [
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

      const medicine = await medicine_model.findOne({
       user_id: req.user.user._id,
        "medicines._id": req.params.medicine_id
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

/**
 * Get Medicine Details API
 * in this api we will get the medicine details by date user will send the date and we will get the medicine details of that date
 * 
 */

exports.get_medicine_details_month_wise= [
  login_validator,
  check("medicine_date").notEmpty().withMessage("Date cannot be empty"),
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

      const medicineDate = new Date(req.params.medicine_date);
      if (isNaN(medicineDate)) {
        return apiResponse.validationErrorWithData(res, "Invalid date format");
      }

      const medicines = await medicine_model.find({
        user_id: req.user.user._id,
        "medicines": {
          $elemMatch: {
            medicine_start_date: { $lte: medicineDate },
            medicine_stop_date: { $gte: medicineDate }
          }
        }
      });

      const filteredMedicines = medicines.map(med => {
        return {
          ...med._doc,
          medicines: med.medicines.filter(medicine => 
            medicine.medicine_start_date <= medicineDate && medicine.medicine_stop_date >= medicineDate
          )
        };
      }).filter(med => med.medicines.length > 0);

      // if (filteredMedicines.length === 0) {
      //   return apiResponse.notFoundResponse(res, "No medicines found for the given date");
      // }

      return apiResponse.successResponseWithData(res, "Medicine details", filteredMedicines);
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
 * This api will return all expired medicines or tenure completed medicines
 * This api will be get the medicine details month wise in two array of object medicine histroy and ongoing medicine
 * 
 */

exports.get_medicine_bank_details_month_wise = [
  login_validator,
  async (req, res) => {
    try {
      const medicines = await medicine_model.find({
        user_id: req.user.user._id,
      });
      if (!medicines) {
        return apiResponse.validationErrorWithData(res, "Medicine not found");
      }
      const medicine_history = [];
      const ongoing_medicine = [];
      medicines.forEach((medicine) => {
        medicine.medicines.forEach((med) => {
          if (new Date(med.medicine_stop_date) < new Date()) {
            medicine_history.push(med);
          } else {
            ongoing_medicine.push(med);
          }
        });
      });
      return apiResponse.successResponseWithData(
        res,
        "Medicine details",
        { medicine_history, ongoing_medicine }
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
 * Get Medicine Details API for the next 7 days
 * and every time when hit the api it will return the medicines for the next 7 days from the current date
 * 
 */

exports.get_medicine_for_next_7_days = [
  login_validator,
  async (req, res) => {
    try {
      const currentDate = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(currentDate.getDate() + 7);

      const medicines = await medicine_model.find({
        user_id: req.user.user._id,
        "medicines.medicine_start_date": { $lte: nextWeek },
        "medicines.medicine_stop_date": { $gte: currentDate }
      });

      const filteredMedicines = medicines.map(med => {
        return {
          ...med._doc,
          medicines: med.medicines.filter(medicine => 
            medicine.medicine_start_date <= nextWeek && medicine.medicine_stop_date >= currentDate
          )
        };
      }).filter(med => med.medicines.length > 0);

      return apiResponse.successResponseWithData(res, "Medicine details", filteredMedicines);
    } catch (err) {
      console.log(err);
      return apiResponse.serverErrorResponse(res, "Server Error...!", err.message);
    }
  },

];

