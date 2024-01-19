/**
 * User Model
 */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  full_name: { type: String, required: true },
  email: { type: String, required: true },
  phone_number: { type: String, required: true },
  gender: { type: String, required: true },
  date_of_birth: { type: Date, required: true },
  agreed_To_Terms: { type: Boolean, required: true, default: false },
  otp: { type: String, required: false },
  // otpExpiary: {
  //   type: Date,
  //   default: Date.now,
  //   expires: 600,
  // },
  isOTPVerified: {
    type: Boolean,
    default: false,
  },
  password: { type: String, required: false },
  // CANID: {
  //   type: String,
  //   default: () => `CAN${parseInt(Math.random() * 1000000)}`,
  //   unique: true,
  // },

  user_profile: [
    {
      profile_name: {
        type: String,

        required: false,
      },
      profile_about: {
        type: String,
        required: false,
      },
      profile_description: {
        type: String,
        required: false,
      },
      CANID: {
        type: String,
        default: () => `CAN${parseInt(Math.random() * 1000000)}`,
        unique: true,
      },
      profile_role: {
        type: String,
        enum: ["Veteran", "Caregiver", "Fighter"],
        required: false,
      },
      pin: {
        type: String,
        required: false,
      },
      profile_image: { type: String, required: false },
      phone_number: {
        type: String,
        required: false,
      },
      date_of_birth: {
        type: String,
        required: false,
      },
      isBlocked:{
        type:Boolean,
        default:false
      },
      blockedBy:{
        type:String,
        required:false
      },
      status:{
        type:String,
        enum:["Active","Inactive"],
        default:"Active"
      },
      
    },
  ], // user_profile_image_url: { type: String, required: false },
  // user_profile_name: { type: String, required: false },

  user_type: {
    type: String,
    enum: ["Admin", "User"],
    required: false,
  },
}); 

module.exports = mongoose.model("User", userSchema);
