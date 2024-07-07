//waf to send otp to mobile using twilio

//const twilio = require("twilio");
//const sgMail = require("@sendgrid/mail");
//const nodemailer = require("nodemailer");

//require("dotenv").config();

// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;

//const fast2sms = require('fast-two-sms');
require("dotenv").config();
const axios = require("axios");
const fast2sms = require("fast-two-sms");
const crypto = require('crypto');

const API_KEY = process.env.FAST2SMS_API_KEY;
const emailUser = process.env.EMAIL_SMTP_USERNAME;
const emailPass = process.env.EMAIL_SMTP_PASSWORD;
const nodemailer = require("nodemailer");

//fast2sms.initialize(API_KEY);

//===========================FAST2SMS===================================================//

function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000);
}

function sendOTP(numbers,otp) {
  const apiUrl = "https://www.fast2sms.com/dev/bulkV2";
  

  const config = {
    headers: {
      authorization:API_KEY, 
       // "RTGB4Z5NZRjnKuFFRra6qvSneBlJhggH3tNCv11BaKsgZI7S1cwUnrvxklDq", //apiKey,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    params: {
      variables_values: otp,
      route: "otp",
      numbers: numbers//.join(","),
    },
  };

  return axios
    .post(apiUrl, null, config)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error(
          "Server responded with a non-2xx status:",
          error.response.data
        );
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received from the server");
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error setting up the request:", error.message);
      }
      throw new Error("Failed to send OTP");
    });
}



//===========================Password Reset Function===================================================



// Generate a unique token for password reset link
function generateResetToken() {
    return crypto.randomBytes(20).toString('hex');
}

// Send password reset link to Email
async function sendResetLink(emailAddress, resetLink) {
    try {
        // const resetToken = generateResetToken();
        // console.log(resetToken);

        // Code to save resetToken in the database with user's email for verification
        
        // Constructing the password reset link
        //const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;
        
        // Create and send email
        const emailTransporter = nodemailer.createTransport({
            service: "gmail", // Replace with your email service,
            auth: {
              user: emailUser, //email username,
              pass: emailPass, //email password,
            },
          });
          
          const emailOptions = {
            from: emailUser,
            to: emailAddress,
            subject: 'Password Reset Request',
            text: `Dear User,\n\nYou requested to reset your password. Please click on the following link to reset your password:\n\n${resetLink}\n\nIf you did not request this, please ignore this email.\n\nBest Regards,\nYour Website Team`,
          };
          
          emailTransporter.sendMail(emailOptions, (err, info) => {
            if (err) {
              console.log(err);
            } else {
              console.log(`Email sent: ${info.response}`);
            }
          });
          
        return resetLink;
    } catch (error) {
        console.log(error);
    }
}

//===================Send invoice to email using nodemailer function===================//

function sendInvoiceEmail(email,invoice){
  const emailTransporter = nodemailer.createTransport({
    service: "gmail", // Replace with your email service,
    auth: {
      user: emailUser, //email username,
      pass: emailPass, //email password,
    },
  });
  
  const emailOptions = {
    from: emailUser,
    to: email,
    subject: 'Invoice',
    text: `Dear User,\n\nPlease find the attached invoice.\n\nBest Regards,\nYour Website Team`,
    attachments: [
      {
        filename: 'invoice.pdf',
        content: invoice,
        encoding: 'base64',
      },
    ],
  };
  
  emailTransporter.sendMail(emailOptions, (err, info) => {
    if (err) {
      console.log(err);
    } else {
      console.log(`Email sent: ${info.response}`);
    }
  });
}




module.exports={
  sendOTP,
  generateOTP,
  sendResetLink,
  generateResetToken,
  sendInvoiceEmail
}