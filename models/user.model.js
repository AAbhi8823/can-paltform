/**
 * User Model
 */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    full_name: { type: String, required: true },
    email: { type: String, required: false, unique: true },
    phone_number: { type: String, required: false, unique: true },
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
    subscription: {
      plan: {
        type: Schema.Types.ObjectId,
        ref: "SubscriptionPlan",
        required: false,
      },
      start_date: {
        type: Date,
        required: false,
      },
      end_date: {
        type: Date,
        required: false,
      },
    },
    profile_image: { type: String, required: false },

    resetPasswordToken: {
      type: String,
      required: false,
    },
    jwtTokenBlockedList: [
      {
        type: String,
        required: false,
      },
    ],

    isBlocked: {
      type: Boolean,
      default: false,
    },
    isAdimn: {
      type: Boolean,
      default: false,
    },

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
