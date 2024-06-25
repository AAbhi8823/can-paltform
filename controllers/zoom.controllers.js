/**
 * Zoom Controller for Zoom API integration with Node.js and MongoDB
 * @module controllers/zoom.controllers
 *
 */

const apiResponse = require("../response/apiResponse");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const zoom_model = require("../models/zoom.live.meeting.management.model");
const user_model = require("../models/user.model");
const zoom = require("../helpers/zoom.integration");
const login_validator =
  require("../middlewares/jwt.auth.middleware").authentication;
const admin_validator =
  require("../middlewares/admin.auth.middleware").adminAuthenticate;

//const zoom_meeting = require("../models/zoom.live.meeting.management.model");

const qs = require("qs");

/**
 * Create a new Zoom meeting
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */

// //const axios = require("axios");

// const getAccessToken = async () => {
//   let token = await zoom_model.AccessToken.findOne();

//   // If the token is expired, refresh it
//   if (!token || new Date() >= token.expires_at) {
//     const response = await axios.post("https://zoom.us/oauth/token", null, {
//       params: {
//         grant_type: "refresh_token",
//         refresh_token: token.refresh_token,
//       },
//       auth: {
//         username: process.env.CLIENT_ID,
//         password: process.env.CLIENT_SECRET,
//       },
//     });

//     const { access_token, refresh_token, expires_in, token_type, scope } =
//       response.data;

//     // Update token in the database
//     token.access_token = access_token;
//     token.refresh_token = refresh_token;
//     token.expires_at = new Date(Date.now() + expires_in * 1000);
//     token.token_type = token_type;
//     token.scope = scope;

//     await token.save();
//   }

//   return token.access_token;
// };
const api_base_url = "https://api.zoom.us/v2";
const auth_token_url = "https://zoom.us/oauth/token";

var zoom_credentials = {
  account_id: "Jz6LCqrwQha_IQ1_KXdoAQ",
  client_id: "JU1b0CDWRq2_pQIJqq0LNw",
  client_secret: "CPb5LC1pR7juuPtXdO3bZZAtvy694k9L",
};
exports.create_meeting = [
  login_validator,
  // Assuming login_validator is defined somewhere
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

      const { topic, type, start_time, duration, timezone, password } =
        req.body;
      const user_id = req.user.user._id;

      const user = await user_model.findById(user_id);
      if (!user) {
        return res
          .status(404)
          .json({ status: false, message: "User not found" });
      }

      const payload = { topic, type, start_time, duration, timezone, password };

      const response = await createMeeting(payload);
      console.log("Response line 96", response);
      if (!response) {
        return res
          .status(400)
          .json({ status: false, message: "Unable to create meeting...1" });
      }

      const new_meeting = new zoom_model({
        user_id,
        zoom_meeting_id: response.data.id,
        topic: response.data.topic,
        start_time: response.data.start_time,
        duration: response.data.duration,
        timezone: response.data.timezone,
        password: response.data.password,
        join_url: response.data.join_url,
        start_url: response.data.start_url,
      });

      await new_meeting.save();

      return res.status(201).json({
        status: true,
        message: "Meeting created successfully",
        data: new_meeting,
      });
    } catch (err) {
      console.error(err);
      return apiResponse.serverErrorResponse(
        res,
        "Server Error...!",
        err.message
      );
    }
  },
];

// // Helper function to create a Zoom meeting

async function createMeeting({
  topic,
  type,
  start_time,
  duration,
  timezone,
  password,
}) {
  const auth_token_url = "https://zoom.us/oauth/token"; // Update this if your auth token URL is different
  const api_base_url = "https://api.zoom.us/v2";

  // const zoom_credentials = {
  //   account_id: 'your_account_id',
  //   client_id: 'your_client_id',
  //   client_secret: 'your_client_secret'
  // };

  try {
    // Generate access token
    const authResponse = await axios.post(
      auth_token_url,
      `grant_type=account_credentials&account_id=${zoom_credentials.account_id}`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${zoom_credentials.client_id}:${zoom_credentials.client_secret}`
          ).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    //console.log("Auth Response", authResponse);

    if (authResponse.status !== 200) {
      console.error("Unable to get access token", authResponse.data);
      return { status: false, message: "Unable to get access token" };
    }

    const access_token = authResponse.data.access_token;
    console.log("Access Token line 165", access_token);

    const headers = {
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
    };

    const payload = { topic, type, start_time, duration, timezone, password };
    console.log("Payload being sent:", JSON.stringify(payload, null, 2));

    const meetingResponse = await axios.post(
      `${api_base_url}/users/me/meetings`,
      payload,
      { headers }
    );
    console.log("Meeting Response", typeof meetingResponse.status, typeof 201);

    if (meetingResponse.status !== 201) {
      console.error("Unable to generate meeting link", meetingResponse.data);
      return { status: false, message: "Unable to create meeting...!" };
    }

    return { status: true, data: meetingResponse.data };
  } catch (error) {
    if (error.response) {
      // Server responded with a status other than 200 range
      console.error("Error creating meeting:", error.response.data);
    }
  }
}

/**
 * Get zoom meeting list API
 * This API will return all the zoom meetings excluding the expired meetings
 */
exports.get_meetings_list = [
  login_validator,
  async (req, res) => {
    try {
      const user_id = req.user.user._id;

      const user = await user_model.findById(user_id);
      if (!user) {
        return res
          .status(404)
          .json({ status: false, message: "User not found" });
      }

      const currentDateTime = new Date();
      const meetings = await zoom_model.find({
        //user_id,
        end_time: { $gte: currentDateTime },
      });

      return res.status(200).json({
        status: true,
        message: "Meetings list",
        data: meetings,
      });
    } catch (err) {
      console.error(err.message);
      return apiResponse.serverErrorResponse(
        res,
        "Server Error...!",
        err.message
      );
    }
  },
];

// Delete a Zoom meeting by ID

exports.delete_meeting_by_id = [
  login_validator,
  admin_validator,
  async (req, res) => {
    try {
      const { meeting_id } = req.params;
      if (!meeting_id) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error",
          "Meeting ID is required"
        );
      }

      // Find the meeting by ID
      const meeting_found = await zoom_model.findById(meeting_id);
      console.log("line 28", meeting_found);
      if (!meeting_found) {
        return apiResponse.notFoundResponse(res, "Meeting not found");
      }

      // Delete the found meeting
      await zoom_model.findByIdAndDelete({ _id: meeting_id });

      return apiResponse.successResponse(res, "Meeting deleted successfully");
    } catch (err) {
      return apiResponse.serverErrorResponse(res, err.message);
    }
  },
];

/**
 * Get Zoom meeting filter by today and history meetings
 * filter will today, upcoming and history
 */

exports.get_meetings_by_filter = [
  login_validator,
  async (req, res) => {
    try {
      const { filter } = req.params;
      const user_id = req.user.user._id;

      const user = await user_model.findById(user_id);
      if (!user) {
        return res
          .status(404)
          .json({ status: false, message: "User not found" });
      }

      let meetings = [];
      if (filter === "today") {
        meetings = await zoom_model.find({
         //user_id:"66604c32c3a5b5d0e8c99049",
          start_time: { $gte: new Date().setHours(0, 0, 0, 0) },
        });
      } else if (filter === "upcoming") {
        meetings = await zoom_model.find({
          // user_id,
          start_time: { $gte: new Date() },
        });
      } else if (filter === "history") {
        meetings = await zoom_model.find({
          // user_id,
          start_time: { $lt: new Date() },
        });
      } else {
        return res
          .status(400)
          .json({ status: false, message: "Invalid filter" });
      }

      return res.status(200).json({
        status: true,
        message: "Meetings list",
        data: meetings,
      });
    } catch (err) {
      console.error(err.message);
      return apiResponse.serverErrorResponse(
        res,
        "Server Error...!",
        err.message
      );
    }
  },
];
