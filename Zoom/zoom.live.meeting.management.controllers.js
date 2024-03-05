const axios = require('axios');
const config = require('../config/config');
const jwt = require('jsonwebtoken');
const express = require('express');




const clientId = "JU1b0CDWRq2_pQIJqq0LNw"
const accountId = "Jz6LCqrwQha_IQ1_KXdoAQ"
const clientSecret = "CPb5LC1pR7juuPtXdO3bZZAtvy694k9L"
const auth_token_url = "https://zoom.us/oauth/token"
const api_base_url = "https://api.zoom.us/v2"


exports. createMeeting=async(topic, duration, start_time)=>{
  try {
      const authResponse = await axios.post(auth_token_url, {
          grant_type: 'account_credentials',
          account_id: accountId,
          client_secret: clientSecret
      }, {
          auth: {
              username: clientId,
              password: clientSecret
          }
      });
    
  }
  catch (error) {
      console.error(error);
  }
}


//const axios = require('axios');

async function createMeeting(topic, duration, start_time) {
    try {
        const authResponse = await axios.post(auth_token_url, {
            grant_type: 'account_credentials',
            account_id: account_id,
            client_secret: client_secret
        }, {
            auth: {
                username: client_id,
                password: client_secret
            }
        });

        if (authResponse.status !== 200) {
            console.log('Unable to get access token');
            return;
        }

        const access_token = authResponse.data.access_token;

        const headers = {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json'
        };

        const startTime = `${start_date}T10:${start_time}`;

        const payload = {
            topic: topic,
            duration: duration,
            start_time: start_time,
            type: 2
        };

        const meetingResponse = await axios.post(`${api_base_url}/users/me/meetings`, payload, { headers });

        if (meetingResponse.status !== 201) {
            console.log('Unable to generate meeting link');
            return;
        }

        const response_data = meetingResponse.data;

        const content = {
            meeting_url: response_data.join_url,
            password: response_data.password,
            meetingTime: response_data.start_time,
            purpose: response_data.topic,
            duration: response_data.duration,
            message: 'Success',
            status: 1
        };

        console.log(content);
    } catch (error) {
        console.error(error);
    }
}

