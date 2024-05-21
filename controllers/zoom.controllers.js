
/**
 * Zoom Controller for Zoom API integration with Node.js and MongoDB
 * @module controllers/zoom.controllers
 * 
 */

const apiResponse = require("../helpers/apiResponse");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const zoom_model = require("../models/zoom.model");
const user_model = require("../models/user.model");
const zoom = require("../helpers/zoom");

/**
 * Create a new Zoom meeting
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */

exports.create_meeting = [
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

      const { topic, type, start_time, duration, timezone, password } = req.body;
      const user_id = req.user.user._id;

      const user = await user_model.findById(user_id);
      if (!user) {
        return apiResponse.notFoundResponse(res, "User not found");
      }

      const payload = {
        topic,
        type,
        start_time,
        duration,
        timezone,
        password,
      };

      const response = await zoom.createMeeting(payload);

      const new_meeting = new zoom_model({
        user_id,
        zoom_meeting_id: response.id,
        topic: response.topic,
        start_time: response.start_time,
        duration: response.duration,
        timezone: response.timezone,
        password: response.password,
        join_url: response.join_url,
        start_url: response.start_url,
      });

      await new_meeting.save();

      return apiResponse.successResponseWithData(
        res,
        "Meeting created successfully",
        response
      );
    } catch (err) {
      console.error(err.message);
      return apiResponse.ErrorResponse(res, "Server error", err.message);
    }
  },
];
