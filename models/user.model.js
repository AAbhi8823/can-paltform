/**
 * User Model
 */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    full_name: { type: String, required: true },
    email: { type: String, required: false },
    phone_number: { type: String, required: false },
    gender: { type: String, required: true },
    date_of_birth: { type: Date, required: true },
    agreed_To_Terms: { type: Boolean, required: true, default: false },
    otp: { type: String, required: false },
    otpExpiary: {
      type: Date,
      required: false,
    },
    isOTPVerified: {
      type: Boolean,
      default: false,
    },
    CANID: {
      type: String,
      default: () => `CAN${parseInt(1000 + Math.random() * 9000)}`,
      unique: false,
    },
    password: { type: String, required: false },

    user_profile: {
      type: String,
      required: false,
      // default: null,
    },
    // pin: {
    //   type: String,
    //   required: false,
    // },
    isSubscribed: {
      type: Boolean,
      default: false,
    },
    profile_image: { type: String, required: false },

    // user_profile: [
    //   {
    //     full_name: {
    //       type: String,

    //       required: false,
    //     },
    //     // chiled_user_type: {
    //     //   type: String,
    //     //   required: false,
    //     // },
    //     profile_about: {
    //       type: String,
    //       required: false,
    //     },
    //     profile_description: {
    //       type: String,
    //       required: false,
    //     },
    //     CANID: {
    //       type: String,
    //       default: () => `CAN${parseInt(100000 + Math.random() * 900000)}`,
    //       unique: true,
    //     },
    //     profile_role: {
    //       type: String,
    //       enum: ["Veteran", "Caregiver"],
    //       required: false,
    //     },
    //     pin: {
    //       type: String,
    //       required: true,
    //     },
    //     profile_image: { type: String, required: false },
    //     phone_number: {
    //       type: String,
    //       required: false,
    //     },
    //     date_of_birth: {
    //       type: String,
    //       required: false,
    //     },
    //     // isSubscribed: {
    //     //   type: Boolean,
    //     //   default: false,
    //     // },
    //     isBlocked: {
    //       type: Boolean,
    //       default: false,
    //     },
    //     blockedBy: {
    //       type: String,
    //       required: false,
    //     },
    //     status: {
    //       type: String,
    //       enum: ["Active", "Inactive"],
    //       default: "Active",
    //     },
    //   },
    // ],
    isBlocked: {
      type: Boolean,
      default: false,
    },
    isAdimn: {
      type: Boolean,
      default: false,
    },

    // user_profile_image_url: { type: String, required: false },
    // user_profile_name: { type: String, required: false },

    // user_type: {
    //   type: String,
    //   enum: ["Admin", "User"],
    //   required: false,
    // },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
