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
  date_Of_Birth: { type: Date, required: true },
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
  CANID: {
    type: String,
    default: () => `CAN${parseInt(Math.random() * 1000000)}`,
    unique:true
  },

  user_profile: {
    type: String,
    enum: ["Veteran", "Caregiver", "Fighter"],
    required: false,
  },
});

module.exports = mongoose.model("User", userSchema);
