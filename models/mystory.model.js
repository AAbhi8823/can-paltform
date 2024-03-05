/**
 * Model for MyStory
 */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const mystorySchema = new Schema(
  {
    post_title: {
      type: String,
      required: true,
    },
    post_description: {
      type: String,
      required: false,
    },
    media_files: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],

    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: false,
      },
    ],

    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
        required: false,
        createdAt: {
          type: Date,
          default: Date.now,
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    shares: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: false,
      },
    ],
    CANID: {
      type: String,
      required: false,
    },

    // story: {
    //     type: String,
    //     required: true
    // },

    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("MyStory", mystorySchema);
