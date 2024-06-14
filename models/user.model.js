/**
 * User Model
 */

const mongoose = require("mongoose");
const { report } = require("../routes/user.routes");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    full_name: { type: String, required: true },
    email: { type: String, required: false, unique: true },
    phone_number: { type: String, required: false, unique: true },
    gender: {
      type: String,
      enum: ["male", "female", "others"],
      required: true,
    },
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
      isActive: {
        type: Boolean,
        default: false,
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
    isLive: {
      type: Boolean,
      default: false,
    },
    time_spent_online: {
      type: Number,
      default: 0,
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },
    blockedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: false,
      },
    ],
    blockedTo: [
      {
        user_id: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: false,
        },
      },
    ],
    isAdmin: {
      type: Boolean,
      default: false,
    },
    date_of_joining: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Blocked"],
      default: "Active",
    },
    
    reportedBy: [
      {
        user_id: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: false,
        },
        story_id:{
          type: Schema.Types.ObjectId,
          ref: "MyStory",
          required: false,
        },
        
        report_reason: {
          type: String,
          required: false,
          trim: true,
        },
      },
    ],

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
