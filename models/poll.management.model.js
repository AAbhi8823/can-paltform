/**
 * Poll managemnt model
 * This model is used to store the poll data
 */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const pollSchema = new Schema(
  {
    user_id: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    poll_question: { type: String, required: true },
    poll_options: [
      {
        option: { type: String, required: true },
        votes: { type: Number, default: 0 },
      },
    ],
    poll_end_date: { type: Date, required: true },
    poll_status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Poll", pollSchema);
