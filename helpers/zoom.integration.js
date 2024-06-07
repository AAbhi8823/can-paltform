const express = require("express");
const router = express.Router();
//const requestPromise = require("request-promise");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// const payload = {
//   iss: process.env.ZOOM_API_KEY, //your API KEY
//   exp: new Date().getTime() + 5000,
// };
// const token = jwt.sign(payload, process.env.ZOOM_API_SECRET); //your API SECRET HERE


const axios = require("axios");
const api_base_url= "https://api.zoom.us/v2";
const auth_token_url = "https://zoom.us/oauth/token";

async function createMeeting(topic, duration, start_time) {
  try {
    const authResponse = await axios.post(
      auth_token_url,
      {
        grant_type: "account_credentials",
        account_id: "Jz6LCqrwQha_IQ1_KXdoAQ",
        client_secret: "CPb5LC1pR7juuPtXdO3bZZAtvy694k9L",
      },
      {
        auth: {
          username: "JU1b0CDWRq2_pQIJqq0LNw",
          password: "CPb5LC1pR7juuPtXdO3bZZAtvy694k9L",
        },
      }
    );

    if (authResponse.status !== 200) {
      console.log("Unable to get access token");
      return;
    }

    const access_token = authResponse.data.access_token;
    console.log("line 52",access_token);

    const headers = {
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
    };

    const startTime = `${start_time}T10:00:00Z`; // Assuming start_time is correctly formatted

    const payload = {
      topic: topic,
      duration: duration,
      start_time: startTime,
      type: 2,
    };

    const meetingResponse = await axios.post(
      `${api_base_url}/users/me/meetings`,
      payload,
      { headers }
    );

    if (meetingResponse.status !== 201) {
      console.log("Unable to generate meeting link");
      return;
    }

    const response_data = meetingResponse.data;

    const content = {
      meeting_url: response_data.join_url,
      password: response_data.password,
      meetingTime: response_data.start_time,
      purpose: response_data.topic,
      duration: response_data.duration,
      message: "Success",
      status: 1,
    };

    console.log(content);
  } catch (error) {
    console.error(error);
  }
}

// Example usage:
//add_meeting("Meeting Topic", 60, "2024-03-04T12:00:00Z"); // Adjust start_time according to your requirements


//================================================================================================
// const axios = require("axios");
// const api_base_url= "https://api.zoom.us/v2";
// const auth_token_url = "https://zoom.us/oauth/token";


// async function add_meeting(topic, duration, start_time) {
//   try {
//     const authResponse = await axios.post(
//       auth_token_url,
//       {
//         grant_type: "account_credentials",
//         account_id: "Jz6LCqrwQha_IQ1_KXdoAQ",//account_id,
//         client_secret: "CPb5LC1pR7juuPtXdO3bZZAtvy694k9L",//client_secret,
//       },
//       {
//         auth: {
//           username: "JU1b0CDWRq2_pQIJqq0LNw",//client_id,
//           password: "CPb5LC1pR7juuPtXdO3bZZAtvy694k9L",//client_secret,
//         },
//       }
//     );

//     if (authResponse.status !== 200) {
//       console.log("Unable to get access token");
//       return;
//     }

//     const access_token = authResponse.data.access_token;

//     const headers = {
//       Authorization: `Bearer ${access_token}`,
//       "Content-Type": "application/json",
//     };

//     const startTime = `${start_date}T10:${start_time}`;

//     const payload = {
//       topic: topic,
//       duration: duration,
//       start_time: start_time,
//       type: 2,
//     };

//     const meetingResponse = await axios.post(
//       `${api_base_url}/users/me/meetings`,
//       payload,
//       { headers }
//     );

//     if (meetingResponse.status !== 201) {
//       console.log("Unable to generate meeting link");
//       return;
//     }

//     const response_data = meetingResponse.data;

//     const content = {
//       meeting_url: response_data.join_url,
//       password: response_data.password,
//       meetingTime: response_data.start_time,
//       purpose: response_data.topic,
//       duration: response_data.duration,
//       message: "Success",
//       status: 1,
//     };

//     console.log(content);
//   } catch (error) {
//     console.error(error);
//   }
// }


module.exports = {createMeeting};
