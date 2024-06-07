/**
 * Zoom Controller for Zoom API integration with Node.js and MongoDB
 * @module controllers/zoom.controllers
 *
 */

const apiResponse = require("../helpers/helpers");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const zoom_model = require("../models/zoom.live.meeting.management.model");
const user_model = require("../models/user.model");
const zoom = require("../helpers/zoom.integration");
const login_validator =
  require("../middlewares/jwt.auth.middleware").authentication;

/**
 * Create a new Zoom meeting
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */

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

const zoom_credentials = {
  account_id: "Jz6LCqrwQha_IQ1_KXdoAQ",
  client_secret: "CPb5LC1pR7juuPtXdO3bZZAtvy694k9L",
  username: "JU1b0CDWRq2_pQIJqq0LNw",
  password: "CPb5LC1pR7juuPtXdO3bZZAtvy694k9L",
};

exports.create_meeting = [
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

      const { topic, type, start_time, duration, timezone, password } =
        req.body;
      const user_id = req.user.user._id;

      const user = await user_model.findById(user_id);
      if (!user) {
        return res
          .status(404)
          .json({ status: false, message: "User not found" });
      }

      const payload = {
        topic,
        type,
        start_time,
        duration,
        timezone,
        password,
      };

      const response = await createMeeting(payload);
      if (!response || !response.id) {
        return res.status(500).json({
          status: false,
          message: "Unable to create meeting",
        }); 
      }

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
      console.error(err);
      return res.status(500).json({
        status: false,
        message: "Server Error...!",
        error: err.message,
      });
    }
  },
];

// Helper function to create a Zoom meeting
async function createMeeting({
  topic,
  type,
  start_time,
  duration,
  timezone,
  password,
}) {
  try {
    const authResponse = await axios.post(
      auth_token_url,
      {
        grant_type: "account_credentials",
        account_id: zoom_credentials.account_id,
        client_secret: zoom_credentials.client_secret,
      },
      {
        auth: {
          username: zoom_credentials.username,
          password: zoom_credentials.password,
        },
      }
    );

    if (authResponse.status !== 200) {
      console.error("Unable to get access token", authResponse.data);
      return null;
    }

    const access_token = authResponse.data.access_token;
    const headers = {
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
    };

    const payload = {
      topic,
      type,
      start_time,
      duration,
      timezone,
      password,
    };

    const meetingResponse = await axios.post(
      `${api_base_url}/users/me/meetings`,
      payload,
      { headers }
    );

    if (meetingResponse.status !== 201) {
      console.error("Unable to generate meeting link", meetingResponse.data);
      return null;
    }

    return meetingResponse.data;
  } catch (error) {
    console.error("Error creating meeting", error);
    return null;
  }
}
