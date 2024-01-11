//waf to send otp to mobile using twilio


const twilio = require("twilio");
//const sgMail = require("@sendgrid/mail");
//const nodemailer = require("nodemailer");

require("dotenv").config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;


//const fast2sms = require('fast-two-sms');
require('dotenv').config();
//const axios=require("axios")
//const fast2sms = require('fast-two-sms');

//const API_KEY = process.env.FAST2SMS_API_KEY;

//fast2sms.initialize(API_KEY);



//===========================FAST2SMS===================================================//

// function sendOTP(apiKey, numbers, otp) {
//     const apiUrl = 'https://www.fast2sms.com/dev/bulkV2';

//     const config = {
//         headers: {
//             'authorization': "alQdx22hK3RSF0Y58PBkg0pwq6OET9XGjLfMvNsmreiAVJ17HCLWdJoUpnX71mPAZv8CF4600jlrbc",//apiKey,
//             'Content-Type': 'application/x-www-form-urlencoded'
//         },
//         params: {
//             'variables_values': otp,
//             'route': 'otp',
//             'numbers': numbers.join(',')
//         }
//     };

//     return axios.post(apiUrl, null, config)
//         .then(response => {
//             return response.data;
//         })
//         .catch(error => {
//             if (error.response) {
//                 // The request was made and the server responded with a status code
//                 // that falls out of the range of 2xx
//                 console.error('Server responded with a non-2xx status:', error.response.data);
//             } else if (error.request) {
//                 // The request was made but no response was received
//                 console.error('No response received from the server');
//             } else {
//                 // Something happened in setting up the request that triggered an Error
//                 console.error('Error setting up the request:', error.message);
//             }
//             throw new Error('Failed to send OTP');
//         });
// }

// // Example usage:
// //const apiKey = 'alQdx22hK3RSF0Y58PBkg0pwq6OET9XGjLfMvNsmreiAVJ17HCLWdJoUpnX71mPAZv8CF4600jlrbc';
// // const mobileNumbers = ['9871948174'];
// // const otpToSend = '5599';

// // sendOTP(apiKey, mobileNumbers, otpToSend)
// //     .then(response => console.log(response))
// //     .catch(error => console.error(error));

//     module.exports={
//         sendOTP
//     }

//===========================TWILIO===================================================
















const client = twilio(accountSid, authToken);
//otp generator
function generateOTP() {
    return Math.floor(1000 + Math.random() * 9000);
}
//send otp to mobile
async function  sendOTP  (phone,email){
    try {
        const otp = generateOTP();
        console.log(otp);
        client.messages
            .create({
                body: `Your OTP for login is ${otp}`,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: `+91${phone}`,
            })
            .then((message) => console.log(message.sid));
    

        return otp;
    } catch (err) {
        console.error(err.message);
        return res.status(500).json({ status: false, msg: "OTP Not Sent", error: err.message });
    }
};
//sendOTP("9871948174","abhishek.tom963@gmailcom");

module.exports = { sendOTP };
