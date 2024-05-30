/**
 * Saved mystory model
 * It is used to save the mystory of the user
 */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const savedMystorySchema = new Schema(
  {
    story_id: {
      type: ObjectId,
      ref: "MyStory",
      required: true,
    },
    user_id: {
      type: ObjectId,
      ref: "User",
      required: true,
    },
    // saved_at: {
    //   type: Date,
    //   default: Date.now,
    // },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("SavedMystory", savedMystorySchema);
