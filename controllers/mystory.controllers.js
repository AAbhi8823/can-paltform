/**
 * Mystory Controllers
 */

const mystory_model = require("../models/mystory.model");
const user_model = require("../models/user.model");
const comment_model = require("../models/comments.model");
const { validationResult } = require("express-validator");
const apiResponse = require("../response/apiResponse");
const login_validator =
  require("../middlewares/jwt.auth.middleware").authentication;
const profilePin_validator =
  require("../middlewares/profile.pin.auth.middleware").profilePinAuthenticate;
const awsS3 = require("../helpers/aws.s3");
//const { sendOTP } = require("../helpers/helpers");
const mystory_save_model = require("../models/saved.mystory.model");

const multer = require("multer");

//multer storage
const upload = multer({ storage: multer.memoryStorage() });

// Create and Save a new Mystory
exports.add_mystory = [
  login_validator,
  //profilePin_validator,
  upload.array("media_files", 10),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { user_id, post_title, post_description, media_files } = req.body;
      if (!post_title) {
        return apiResponse.validationErrorWithData(
          res,
          "Post Title is required"
        );
      }

      //uploading media files to s3 bucket
      const media_files_url = await awsS3.multiple_file_upload(req.files);
      console.log(media_files_url);
      console.log("line 42", req.user.user);

      const mystory = new mystory_model({
        user_id: req.user.user._id,
        post_title: post_title,
        post_description: post_description,
        media_files: media_files_url,
        CANID: req.user.user.CANID,
      });
      const saved_mystory = await mystory.save();
      return apiResponse.successResponseWithData(
        res,
        "Successfully, Story Added!",
        saved_mystory
      );
    } catch (err) {
      return apiResponse.serverErrorResponse(
        res,
        "Server Error...!",
        err.message
      );
    }
  },
];

//Get All POST/STORY LIST OF USER

exports.get_mystory_list = [
  //login_validator,
  async (req, res) => {
    try {
      // console.log("line 77",req.user.user._id)
      const mystory_list = await mystory_model.find({
        // user_id: req.user.user._id,
      }).sort({
        createdAt:-1
      });
      return apiResponse.successResponseWithData(
        res,
        "Mystory List Fetched",
        mystory_list
      );
    } catch (err) {
      return apiResponse.serverErrorResponse(
        res,
        "Server Error...!",
        err.message
      );
    }
  },
];

/**
 *  Get My story list api
 * in this api use will be able to fetch/see their won story list only
 *   */
exports.get_my_story_list = [
  login_validator,
  async (req, res) => {
    try {
      const mystory_list = await mystory_model.find({
        CANID: req.user.user.CANID,
      });
      return apiResponse.successResponseWithData(
        res,
        "Mystory List Fetched",
        mystory_list
      );
    } catch (err) {
      return apiResponse.serverErrorResponse(
        res,
        "Server Error...!",
        err.message
      );
    }
  },
];

/**
 * like story api
 * in this api user will be able to like the won  story
 */

exports.like_story = [
  login_validator,
  async (req, res) => {
    try {
      const { story_id } = req.body;
      const mystory = await mystory_model.findById(story_id);
      if (!mystory) {
        return apiResponse.notFoundResponse(res, "Story not found");
      }

      //check if user has already liked the story or not
      const check_like_found = mystory.likes.find(
        (like) => like._id.toString() === req.user.user._id.toString()
      );
      console.log(check_like_found);
      if (check_like_found) {
        //now remove the like from the story
        mystory.likes.pull({ _id: req.user.user._id });
        const like_saved = await mystory.save();
        return apiResponse.successResponseWithData(
          res,
          "Successfully, Story Unliked",
          like_saved.likes.length
        );
      } else {
        mystory.likes.unshift({
          _id: req.user.user._id,
          CANID: req.user.user.CANID,
        });
        const like_saved = await mystory.save();
        return apiResponse.successResponseWithData(
          res,
          "Successfully, Story Liked",
          like_saved.likes.length
        );
      }
    } catch (err) {
      return apiResponse.serverErrorResponse(
        res,
        "Server Error...!",
        err.message
      );
    }
  },
];

//get likes of a story API
exports.get_likes = [
  //login_validator,
  async (req, res) => {
    try {
      const story_id = req.body.story_id;
      const mystory = await mystory_model.findById(story_id);
      if(!mystory){
        return apiResponse.notFoundResponse(res, "Story not found");
      }
      return apiResponse.successResponseWithData(
        res,
        "Likes list",
        mystory.likes.length
      );
    } catch (err) {
      return apiResponse.serverErrorResponse(
        res,
        "Server Error...!",
        err.message
      );
    }
  }
];
/**
 * Most Liked story api
 * in this api user will be able to see the most liked story/post of the user
 * 
 */
exports.most_liked_story = [
  login_validator,
  async (req, res) => {
    try {
      let user_id = req.user.user._id;
      const mystory = await mystory_model.find({user_id:user_id}).sort({ likes: -1 }).limit(1);
      return apiResponse.successResponseWithData(
        res,
        "Most Liked Story",
        mystory
      );
    } catch (err) {
      return apiResponse.serverErrorResponse(
        res,
        "Server Error...!",
        err.message
      );
    }
  },
];

/**
 * Delete story api
 * in this api user will be able to delete their own story
 * 
 */
exports.delete_story = [
  login_validator,
  async (req, res) => {
    try {
      console.log("line 191", req.param.story_id);
      const story = await mystory_model.findByIdAndDelete(req.params.story_id);
      if (!story) {
        return apiResponse.notFoundResponse(res, "Story not found");
      }
      //delete the media files from s3 bucket
      //await awsS3.delete_files(story.media_files);
      
      //detete the comments of the story
      await comment_model.deleteMany({story_id: story._id
      });
      return apiResponse.successResponseWithData(
        res,
        "Story deleted successfully",
        story
      );
    } catch (err) {
      return apiResponse.serverErrorResponse(
        res,
        "Server Error...!",
        err.message
      );
    }
  },
];

/**
 * Save story api
 * in this api user will be able to save the story
 */
exports.save_story = [
  login_validator,
  async (req, res) => {
    try {
      const { story_id } = req.body;
      const mystory = await mystory_model.findById(story_id);
      if (!mystory) {
        return apiResponse.notFoundResponse(res, "Story not found");
      }
      const user = await user_model.findById(req.user.user._id);
      if (!user) {
        return apiResponse.notFoundResponse(res, "User not found");
      }
      const saved_mystory = new mystory_save_model({
        story_id: story_id,
        user_id: req.user.user._id,
      });
      const saved = await saved_mystory.save();
      return apiResponse.successResponseWithData(
        res,
        "Story Saved",
        saved
      );
    } catch (err) {
      return apiResponse.serverErrorResponse(
        res,
        "Server Error...!",
        err.message
      );
    }
  },
];
 


//add comment to story
// exports.add_comment = [
//   login_validator,
//   async (req, res) => {
//     try {
//       const { story_id, comment } = req.body;
//       const mystory = await mystory_model.findById(story_id);
//       if(!mystory){
//         return apiResponse.notFoundResponse(res, "Story not found");
//       }
//       const comment_data = {
//         user_id: req.user.user._id,
//         comment: comment,
//       }; 