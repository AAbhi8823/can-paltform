/**
 * Feed back model will be used to store the feedback of the user
 * user will be able to write comments and give ratings as emoji
 */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const feedbackSchema = new Schema(
  {
    user_id: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: false,
      },
    feedback: {
      type: String,
      required: false,
    },
    rating: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feedback", feedbackSchema);
