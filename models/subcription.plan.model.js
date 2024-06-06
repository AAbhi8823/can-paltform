/**
 * This is the schema of the subscription plan
 * @param {String} plan_name - Name of the plan
 * @param {Number} price - Price of the plan
 * @param {Number} duration - Duration of the plan
 * @param {String} description - Description of the plan
 * @param {String} status - Status of the plan
 * @param {String} created_at - Created date of the plan
 * @param {String} updated_at - Updated date of the plan
 * @param {String} deleted_at - Deleted date of the plan
 * @param {String} created_by - Created by of the plan
 * @param {String} updated_by - Updated by of the plan
 * @param {String} deleted_by - Deleted by of the plan
 * @param {String} deleted - Deleted status of the plan
 * @param {String} is_active - Active status of the plan
 * @param {String} is_deleted - Deleted status of the plan
 * @param {String} is_blocked - Blocked status of the plan
 * @param {String} is_verified - Verified status of the plan
 * @param {String} is_email_verified - Email verified status of the plan
 * @param {String} is_phone_verified - Phone verified status of the plan
 * @param {String} is_admin_verified - Admin verified status of the plan
 */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const subscriptionPlanSchema = new Schema({
  plan_name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    default: 0.0,
    trim: true,
  },
  offer_price: {
    type: Number,
    default: 0.0,
    trim: true,
  },
  discount_percent:{
    type:Number,
    default:0.0
  },
  duration: {
    type: String,
    required:true ,
  },
  duration_type: {
    type: String,
   //enum: ["Month", "Year"],
    default: "Month",
  },
  description: {
    type: String,
    default: "",
  },
  plan_features: [
    {
      feature_name: {
        type: String,
        default: "",
      },
      is_available: {
        type: Boolean,
        default: true,
      },
      //   feature_description: {
      //     type: String,
      //     default: "",
      //   },
    },
  ],

  status: {
    type: String,
    enum: ["Active", "Inactive", "Deleted"],
    default: "Active",
  },
  // created_at: {
  //   type: Date,
  //   default: Date.now,
  // },
  // updated_at: Date,
  // deleted_at: Date,
  // created_by: {
  //   type: Schema.Types.ObjectId,
  //   ref: "User",
  // },
  // updated_by: {
  //   type: Schema.Types.ObjectId,
  //   ref: "User",
  // },
  // deleted_by: {
  //   type: Schema.Types.ObjectId,
  //   ref: "User",
  // },
  deleted: {
    type: Boolean,
    default: false,
  },
  is_active: {
    type: Boolean,
    default: true,
  },
  is_deleted: {
    type: Boolean,
    default: false,
  },
 
});

module.exports = mongoose.model("SubscriptionPlan", subscriptionPlanSchema);
