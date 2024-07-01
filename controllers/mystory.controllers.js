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
      // if (!post_title) {
      //   return apiResponse.validationErrorWithData(
      //     res,
      //     "Post Title is required"
      //   );
      // }

      //atleast one thing is required to post a story either post_title or post_description or media_files
      if (!post_title && !post_description && !req.files) {
        return apiResponse.validationErrorWithData(
          res,
          "Atleast one thing is required to post a story"
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
  login_validator,
  async (req, res) => {
    try {
      // Check if req.user is set
      if (!req.user || !req.user.user || !req.user.user._id) {
        return apiResponse.validationErrorWithData(
          res,
          "Authentication required"
        );
      }

      // Get the authenticated user ID
      const authenticatedUserId = req.user.user._id;

      // Fetch the authenticated user's profile to get the blocked users
      const userProfile = await user_model
        .findOne({ _id: authenticatedUserId })
        .select("blockedTo");
      const blockedUsers = userProfile.blockedTo.map(
        (blocked) => blocked.user_id
      );

      // Fetch the stories excluding those from blocked users
      const mystory_list = await mystory_model
        .find({
          user_id: { $nin: blockedUsers },
        })
        .populate("user_id", "full_name profile_image user_profile CANID")
        .select("-CANID")
        .sort({ createdAt: -1 });

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
      console.log("line 113", mystory_list);
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
      console.log("line 160", check_like_found);
      if (check_like_found) {
        //now remove the like from the story
        mystory.likes.pull({ _id: req.user.user._id });
        const like_saved = await mystory.save();
        //If like 10 then make isTrending true
        if (like_saved.likes.length >= 10) {
          mystory.isTrending = true;
          await mystory.save();
        }
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
      if (!mystory) {
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
  },
];
/**
 * Most Liked story api
 * This api will return the most liked story decending order of likes
 * means the story with most likes will be on top and so on
 *
 */
exports.most_liked_story = [
  //login_validator,
  async (req, res) => {
    try {
      const mystory_list = await mystory_model
        .find()
        .sort({ likes: -1 })
        .populate("user_id", "full_name profile_image user_profile CANID")
        .select("-CANID");
      return apiResponse.successResponseWithData(
        res,
        "Most Liked Story List",
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
      return apiResponse.successResponseWithData(res, "Story Saved", saved);
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
 * When user delete the story, all the comments, likes, shares will be deleted
 * Also the media files will be deleted from the s3 bucket
 *
 */
exports.delete_story = [
  login_validator,
  async (req, res) => {
    try {
      const story = await mystory_model.findOne({
        user_id: req.user.user._id,
        _id: req.params.story_id,
      });
      if (!story) {
        return apiResponse.notFoundResponse(res, "Story not found");
      }
      //delete the media files from s3 bucket
      // await awsS3.delete_files(story.media_files);
      //delete the story
      const story_deleted = await mystory_model.findByIdAndDelete(
        req.params.story_id
      );

      //delete the comments of the story
      await comment_model.deleteMany({ story_id: req.params.story_id });
      //delete the saved story
      await mystory_save_model.deleteMany({ story_id: req.params.story_id });

      return apiResponse.successResponseWithData(
        res,
        "Story deleted successfully",
        story_deleted
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
 * Get STORY BY FILTER API
 * in this api user will be able to see the story by filter
 * If filter is empty then all the story will be fetched and
 * other filters new , trending, most liked will be applied
 */

exports.get_story_by_filter = [
  //login_validator,
  async (req, res) => {
    try {
      let filter = req.params.filter;
      let mystory_list = [];
      console.log(filter);
      if (filter === "new") {
        mystory_list = await mystory_model
          .find({})

          .sort({ createdAt: -1 })
          .populate("user_id", "full_name profile_image user_profile CANID");
      } else if (filter === "trending") {
        mystory_list = await mystory_model
          .find({ isTrending: true })
          .populate("user_id", "full_name profile_image user_profile CANID");
      } else if (filter === "most_liked") {
        console.log("line 377", "most_liked");
        mystory_list = await mystory_model
          .find({})
          .sort({ likes: -1 })
          .populate("user_id", "full_name profile_image user_profile CANID");
      } else {
        console.log("line 377");
        mystory_list = await mystory_model
          .find()
          .populate("user_id", "full_name profile_image user_profile CANID");
        // .select("-CANID");
      }
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

// exports.get_story_by_filter = [
//   //login_validator,
//   async (req, res) => {
//     try {
//       let filter = req.params.filter;
//       let mystory_list = [];
//       console.log(filter);

//       if (filter === "new") {
//         mystory_list = await mystory_model
//           .find({})
//           .sort({ createdAt: -1 })
//           .populate("user_id", "full_name profile_image user_profile CANID");
//       } else if (filter === "trending") {
//         mystory_list = await mystory_model
//           .find({ isTrending: true })
//           .populate("user_id", "full_name profile_image user_profile CANID");
//       } else if (filter === "most_liked") {
//         console.log("line 377", "most_liked");
//         mystory_list = await mystory_model
//           .aggregate([
//             {
//               $addFields: {
//                 likesCount: { $size: "$likes" },
//               },
//             },
//             {
//               $sort: { likesCount: -1 },
//             },
//           ])
//           .lookup({
//             from: "users", // the collection to join
//             localField: "user_id",
//             foreignField: "_id",
//             as: "user_id",
//           })
//           .unwind("$user_id")
//           .project({
//             "user_id.full_name": 1,
//             "user_id.profile_image": 1,
//             "user_id.user_profile": 1,
//             "user_id.CANID": 1,
//             post_title: 1,
//             post_description: 1,
//             media_files: 1,
//             comments: 1,
//             shares: 1,
//             createdAt: 1,
//             updatedAt: 1,
//             isNew: 1,
//             isTrending: 1,
//             likesCount: 1,
//           });

//       } else {
//         console.log("line 377");
//         mystory_list = await mystory_model
//           .find()
//           .populate("user_id", "full_name profile_image user_profile CANID");
//         // .select("-CANID");
//       }

//       return apiResponse.successResponseWithData(
//         res,
//         "Mystory List Fetched",
//         mystory_list
//       );
//     } catch (err) {
//       return apiResponse.serverErrorResponse(
//         res,
//         "Server Error...!",
//         err.message
//       );
//     }
//   },
// ];

//Get Total number Active Mystory

exports.get_total_active_mystory = [
  //login_validator,
  async (req, res) => {
    try {
      const mystory = await mystory_model.find({}).countDocuments();
      return apiResponse.successResponseWithData(
        res,
        "Total Active Mystory",
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

//Get story by ID

exports.get_story_by_id = [
  //login_validator,
  async (req, res) => {
    try {
      const mystory = await mystory_model
        .findById(req.params.story_id)
        .
        populate("user_id", "full_name profile_image user_profile CANID");
      return apiResponse.successResponseWithData(
        res,
        "Story fetched successfully",
        mystory
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
