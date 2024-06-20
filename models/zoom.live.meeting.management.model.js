// /**
//  * Zoom Live Meeting Model
//  */
// const mongoose = require("mongoose");
// const Schema = mongoose.Schema;

// // Define the schema for storing meetings

// const meetingSchema = new mongoose.Schema(
//   {
//     host_name: { type: String, required: true },
//     topic: { type: String, required: true },
//     host_profile_tag: { type: String, required: true },
//     description: { type: String, required: true },
//     scheduled_time: { type: Date, required: true },
//     start_url: { type: String, required: true },
//     join_url: { type: String, required: true },
//     isAnonymousJoinEnabled: { type: Boolean, default: true },
//     categories: [{ type: String }], // You can define multiple categories for a meeting
//     createdAt: { type: Date, default: Date.now },
//   },
//   {
//     timestamps: true,
//   }
// );

// // schema for storing access tokens

// const accessTokenSchema = new mongoose.Schema(
//   {
//     access_token: { type: String, required: true },
//     refresh_token: { type: String, required: true },
//     token_type: { type: String, required: true },
//     expires_at: { type: Number, required: true },
//     scope: { type: String, required: true },
//     createdAt: { type: Date, default: Date.now },
//   },
//   {
//     timestamps: true,
//   }
// );
// module.exports = {
//   Meeting: mongoose.model("Meeting", meetingSchema),
//   AccessToken: mongoose.model("AccessToken", accessTokenSchema),
// };

const mongoose = require('mongoose');

const zoomSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  zoom_meeting_id: { type: String, required: true },
  topic: { type: String, required: true },
  start_time: { type: String, required: true },
  duration: { type: Number, required: true },
  timezone: { type: String, required: true },
  password: { type: String },
  join_url: { type: String, required: true },
  start_url: { type: String, required: true },
},
{
  timestamps: true,
});

module.exports = mongoose.model('Zoommeeting', zoomSchema);
