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

  const Meeting = require('../models/zoom.live.meeting.management.model');

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

const zoom_credentials = {
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
        return apiResponse.validationErrorWithData(res, "Validation Error", errors.array());
      }

      const { topic, type, start_time, duration, timezone, password } = req.body;
      const user_id = req.user.user._id;

      const user = await user_model.findById(user_id);
      if (!user) {
        return res.status(404).json({ status: false, message: "User not found" });
      }

      const payload = { topic, type, start_time, duration, timezone, password };

      const response = await createMeeting(payload);
      if (!response || !response.id) {
        return res.status(500).json({ status: false, message: "Unable to create meeting" });
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

      return res.status(201).json({ status: true, message: "Meeting created successfully", data: new_meeting });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ status: false, message: "Server Error...!", error: err.message });
    }
  },
];

// // Helper function to create a Zoom meeting
async function createMeeting({ topic, type, start_time, duration, timezone, password }) {
  try {
    const authResponse = await axios.post(
      auth_token_url,
      `grant_type=client_credentials`,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${zoom_credentials.client_id}:${zoom_credentials.client_secret}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    if (authResponse.status !== 200) {
      console.error("Unable to get access token", authResponse.data);
      return null;
    }

    const access_token ="eyJzdiI6IjAwMDAwMSIsImFsZyI6IkhTNTEyIiwidiI6IjIuMCIsImtpZCI6IjY4ODE0OTM3LTY2MWQtNDIyNC04NjNlLWZkYTYyNWZlNzk3NSJ9.eyJhdWQiOiJodHRwczovL29hdXRoLnpvb20udXMiLCJ1aWQiOiJubThtdEpRSlEwaWY1UlNGRlp4bEtBIiwidmVyIjo5LCJhdWlkIjoiYzJiM2I3ZWUwNjNkNzg3Nzk3Y2UzZGI4Y2M1YzNmYjMiLCJuYmYiOjE3MTc5Mjc4NzksImNvZGUiOiIyUVEzR0xselQybWxQRVFrTElFWEpBU0FDeFJuVGZ5dEsiLCJpc3MiOiJ6bTpjaWQ6SlUxYjBDRFdScTJfcFFJSnFxMExOdyIsImdubyI6MCwiZXhwIjoxNzE3OTMxNDc5LCJ0eXBlIjozLCJpYXQiOjE3MTc5Mjc4NzksImFpZCI6Ikp6NkxDcXJ3UWhhX0lRMV9LWGRvQVEifQ.V4IsXZ_jnWZ1lTYizs4tiV1rUSzNCraUmTgEGpSA98AxTRZM7PiRhSAYAL72ULqxYYlH8o66kZY9JmY_k9m11g"// authResponse.data.access_token;
    console.log("Access Token", access_token);
    const headers = {
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
    };

    const payload = { topic, type, start_time, duration, timezone, password };

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

