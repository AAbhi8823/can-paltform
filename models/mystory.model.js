/**
 * Model for MyStory
 */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const mystorySchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    post_title: {
      type: String,
      required: false,
    },
    post_description: {
      type: String,
      required: false,
    },
    isNew: {
      type: Boolean,
      default: true,
    },
    isTrending: {
      type: Boolean,
      default: false,
    },
    


    media_files: [
      {
        type: String,
        required: false,
        trim: true,
      },
    ],

    likes: [
      {
        _id: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: false,
        },

        CANID: {
          type: String,
          required: false,
        },
      },
    ],

    comments: [
      {
        comment_id: {
          type: Schema.Types.ObjectId,
          ref: "Comment",
          required: false,
        },
        name: { 
          type: String, 
          required: true 
        },
        user_id: { type: Schema.Types.ObjectId, ref: "User", required: false },
        CANID: {
          type: String,
          required: false,
        },
        user_profile: {
          type: String,
          required: false,
        },
        profile_image: {
          type: String,
          required: false,
        },
        comment: {
          type: String,
          required: false,
        },
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
    isBlocked: {
      type: Boolean,
      default: false,
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
