//Comment model
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema(
  {
    name: {
      type: String,
      required: false,
    },
    comment: {
      type: String,
      required: true,
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    user_profile: {
      type: String,
      required: false,
    },
    profile_image: {
      type: String,
      required: false,
    },
    CANID: {
      type: String,
      required: true,
    },
    comment_like: [
      {
        like: {
          type: String,
          required: false,
        },
       
      },
      {
        timestamps: true,
      }
    ],

    story_id: {
      type: Schema.Types.ObjectId,
      ref: "MyStory",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Comment", commentSchema);
