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
        { user_id: req.user.user._id, _id: req.body.appointment_id },
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
      //check user authorization to delete the appointment
     // console.log("line 150", req.user.user._id,req.params.appointment_id);
      const appointment = await appointment_model.findOne({
        user_id: req.user.user._id,
        _id: req.params.appointment_id,
      });
      if (!appointment) {
        return apiResponse.notFoundResponse(res, "Appointment not found");
      }

      const appointment_deleted = await appointment_model.findByIdAndDelete(
        req.params.appointment_id
      );
      return apiResponse.successResponseWithData(
        res,
        "Appointment deleted successfully",
       // appointment
      );
    } catch (err) {
      console.log("line 152", err);
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

//upcoming appointment
exports.upcoming_appointment = [
  login_validator,
  async (req, res) => {
    try {
      const currentDate = new Date();

      const upcomingAppointments = await appointment_model.find({
        user_id: req.user.user._id,
        appointment_date: { $gte: currentDate }, // Filter appointments with appointment_date greater than or equal to current date
      });

      return apiResponse.successResponseWithData(
        res,
        "Upcoming appointments",
        upcomingAppointments
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

/**
 * Todays appointment list API
 */
exports.todays_appointment = [
  login_validator,
  async (req, res) => {
    try {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0); // Set time to start of the day

      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999); // Set time to end of the day

      const todaysAppointments = await appointment_model.find({
        user_id: req.user.user._id,
        appointment_date: {
          $gte: startOfToday,
          $lte: endOfToday,
        },
      });

      return apiResponse.successResponseWithData(
        res,
        "Todays appointments",
        todaysAppointments
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

/**
 * Get appointment by date API
 */
exports.get_appointment_by_date = [
  login_validator,
  async (req, res) => {
    try {
      const  appointment_date  = req.params.appointment_date;
      console.log("line 238", appointment_date);
      const appointments = await appointment_model.find({
        user_id: req.user.user._id,
        appointment_date: appointment_date,
      });
      return apiResponse.successResponseWithData(
        res,
       `Appointments on ${appointment_date}`,
        appointments
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

/**
 *Get Appointment list for the next 7 days and every time when hit the api it
  * will return the appointments for the next 7 days from the current date
 */

 exports.get_appointment_for_next_7_days = [
  login_validator,
  async (req, res) => {
    try {
      // Get current date and set time to start of the day
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      // Get date for the next 7 days and set time to end of the day
      const nextWeek = new Date();
      nextWeek.setDate(currentDate.getDate() + 7);
      nextWeek.setHours(23, 59, 59, 999);

      // Fetch appointments within the next 7 days
      const appointments = await appointment_model.find({
        user_id: req.user.user._id,
        appointment_date: {
          $gte: currentDate,
          $lte: nextWeek,
        },
      }).sort({ appointment_date: 1 });

      return apiResponse.successResponseWithData(
        res,
        "Appointments for the next 7 days",
        appointments
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



