/**
 * Appointments Controllers
 */
const appointment_model = require("../models/appointments.model");
const apiResponse = require("../response/apiResponse");
const { validationResult } = require("express-validator");
const login_validator =
  require("../middlewares/jwt.auth.middleware").authentication;
const validator = require("../validators/validator");

//add appointment
exports.add_appointment = [
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
        appointment_name,
        doctor_name,
        hospital_name,
        hospital_address,
        appointment_date,
        appointment_day,
        appointment_time,
        remarks,
        add_note,
      } = req.body;

      //   console.log(
      //     "line 34",
      //     !validator.validateDateTime(req.body.appointment_date)
      //   );

      // if (!validator.validateDateTime(req.body.appointment_date)) {
      //     return apiResponse.validationErrorWithData(
      //     res,
      //     "Invalid appointment date"
      //     );
      // }
      // if (!validator.validateDateTime(req.body.appointment_time)) {
      //     return apiResponse.validationErrorWithData(
      //     res,
      //     "Invalid appointment time"
      //     );

      // }
      if (!appointment_name) {
        return apiResponse.validationErrorWithData(
          res,
          "Appointment name is required"
        );
      }
      if (!doctor_name) {
        return apiResponse.validationErrorWithData(
          res,
          "Doctor name is required"
        );
      }
      if (!hospital_name) {
        return apiResponse.validationErrorWithData(
          res,
          "Hospital name is required"
        );
      }
      if (!hospital_address) {
        return apiResponse.validationErrorWithData(
          res,
          "Hospital address is required"
        );
      }
      if (!appointment_date) {
        return apiResponse.validationErrorWithData(
          res,
          "Appointment date is required"
        );
      }
      if (!appointment_time) {
        return apiResponse.validationErrorWithData(
          res,
          "Appointment time is required"
        );
      }
      console.log("line 89", req.user.user._id);
      const new_appointment = new appointment_model({
        user_id: req.user.user._id,
        CANID: req.user.user.CANID,
        appointment_name,
        doctor_name,
        hospital_name,
        hospital_address,
        appointment_date: appointment_date,
        appointment_day,
        appointment_time,
        add_note,
      });

      const appointment = await new_appointment.save();
      return apiResponse.successResponseWithData(
        res,
        "Appointment added successfully",
        appointment
      );
    } catch (error) {
      console.log("line 104", error);
      return apiResponse.serverErrorResponse(
        res,
        "Server Error...!",
        error.messsage
      );
    }
  },
];

//update appointment api
exports.update_appointment = [
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
      console.log("line 123", req.body);  
      
      const appointment = await appointment_model.findByIdAndUpdate(
        {  user_id: req.user.user._id ,  _id: req.body.appointment_id  },
        req.body, // Ensure req.body only contains fields you want to update
        { new: true } // Return the updated document
      );
      console.log("line 130", appointment);
      return apiResponse.successResponseWithData(
        res,
        "Appointment updated successfully",
        appointment
      );
    } catch (err) {
    
      return apiResponse.serverErrorResponse(
        res,
        "Server Error...!",
        err.messsage
      );
    }
  },
];

//delete appointment api
exports.delete_appointment = [
  login_validator,
  async (req, res) => {
    try {
      const appointment = await appointment_controllers.findByIdAndDelete(
        req.params.id
      );
      return apiResponse.successResponseWithData(
        res,
        "Appointment deleted successfully",
        appointment
      );
    } catch (err) {
      return apiResponse.serverErrorResponse(
        res,
        "Server Error...!",
        err.messsage
      );
    }
  },
];

//get appointment list
exports.get_appointment_list = [
  login_validator,
  async (req, res) => {
    try {
      console.log("line 166", req.user.user._id);
      const appointment = await appointment_model.find({
        user_id: req.user.user._id,
      });
      console.log("line 169", appointment);
      return apiResponse.successResponseWithData(
        res,
        "Appointment list",
        appointment
      );
    } catch (err) {
      console.log("line 177", err.messsage);
      return apiResponse.serverErrorResponse(
        res,
        "Server Error...!",
        err.messsage
      );
    }
  },
];
