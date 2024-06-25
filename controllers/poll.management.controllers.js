/**
 * Poll Controllers
 */
const poll_model = require("../models/poll.management.model");
const user_model = require("../models/user.model");
const apiResponse = require("../response/apiResponse");
const { validationResult } = require("express-validator");
const login_validator =
  require("../middlewares/jwt.auth.middleware").authentication;
const admin_validator =
  require("../middlewares/admin.auth.middleware").adminAuthenticate;

//Create a new poll
exports.create_poll = [
  login_validator,
  //admin_validator,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { poll_question, poll_options, poll_end_date } = req.body;
      const user_id = req.user.user._id;
      const poll = new poll_model({
        user_id,
        poll_question,
        poll_options,
        poll_end_date,
      });
      const new_poll = await poll.save();
      return apiResponse.successResponseWithData(
        res,
        "Poll created successfully",
        new_poll
      );
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error...!",
        error: err.message,
      });
    }
  },
];

//Update a poll
exports.update_poll = [
  login_validator,
  //admin_validator,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { poll_id, poll_question, poll_options, poll_end_date } = req.body;
      const user_id = req.user.user._id;
      const poll = await poll_model.findById(poll_id);
      if (!poll) {
        return apiResponse.notFoundResponse(res, "Poll not found");
      }
      if (poll.user_id.toString() !== user_id) {
        return apiResponse.unauthorizedResponse(res, "You are not authorized");
      }
      poll.poll_question = poll_question;
      poll.poll_options = poll_options;
      poll.poll_end_date = poll_end_date;
      const updated_poll = await poll.save();
      return apiResponse.successResponseWithData(
        res,
        "Poll updated successfully",
        updated_poll
      );
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error...!",
        error: err.message,
      });
    }
  },
];

//Delete a poll by Admin
exports.delete_poll_by_id = [
  async (req, res) => {
    try {
      const poll = await poll_model.findById(req.params.poll_id);
      if (!poll) {
        return apiResponse.notFoundResponse(res, "Poll not found");
      }
      await poll.remove();
      return apiResponse.successResponse(res, "Poll deleted successfully");
    } catch (err) {
      return apiResponse.errorResponse(res, err.message);
    }
  },
];

//Get Polls list
exports.get_poll_list = [
  async (req, res) => {
    try {
      const polls = await poll_model
        .find({})
        .populate("user_id", "full_name CANID profile_image");
      console.log("line 108", polls);
      return apiResponse.successResponseWithData(
        res,
        "Polls fetched successfully",
        polls
      );
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error...!",
        error: err.message,
      });
    }
  },
];
//Get Pool By ID
exports.get_poll_by_id = [
  login_validator,
  async (req, res) => {
    try {
      const poll = await poll_model.findById(req.params.poll_id);
      if (!poll) {
        return apiResponse.notFoundResponse(res, "Poll not found");
      }
      return apiResponse.successResponse(
        res,
        "Poll fetched successfully",
        poll
      );
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error...!",
        error: err.message,
      });
    }
  },
];

/**
 * Vote a poll option API
 * The user can vote a poll option
 */

exports.vote_poll_option = [
  login_validator,
  async (req, res) => {
    try {
      const { poll_id, option_id } = req.body; // Assume `option_id` is passed in the request body
      const user_id = req.user.user._id;

      // Find the poll
      const poll_found = await poll_model.findById(poll_id);
      if (!poll_found) {
        return apiResponse.notFoundResponse(res, "Poll not found");
      }
      //console.log("Poll found:", poll_found);

      // Find the user
      const user = await user_model.findById(user_id);
      if (!user) {
        return apiResponse.notFoundResponse(res, "User not found");
      }

      // Find the option
      const option_found = poll_found.poll_options.id(option_id); // Use Mongoose subdocument method
      if (!option_found) {
        return apiResponse.notFoundResponse(res, "Option not found");
      }
      //console.log("Option found:", option_found);

      // Check if the user has already voted in this poll and remove their previous vote
      let hasVoted = false;
      for (let option of poll_found.poll_options) {
        const voteIndex = option.votes.indexOf(user_id);
        if (voteIndex !== -1) {
          hasVoted = true;
          option.votes.splice(voteIndex, 1);
          break; // User can only vote once, so we can stop checking further
        }
      }

      // Add the new vote
      option_found.votes.push(user_id);
      await poll_found.save();

      const message = hasVoted ? "Vote updated successfully" : "Vote added successfully";
      return apiResponse.successResponse(res, message);
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error...!",
        error: err.message,
      });
    }
  },
];


//Get Poll Results
exports.get_poll_results = [
  async (req, res) => {
    try {
      // Find the poll by ID and populate the votes field
      const poll = await poll_model.findById(req.params.poll_id).populate({
        path: "poll_options.votes",
        select: "profile_image name", // Select only necessary fields
      });

      if (!poll) {
        return apiResponse.notFoundResponse(res, "Poll not found");
      }
      

      // Calculate the votes and include voter profile images
      let results = poll.poll_options.map((option) => ({
        option: option.option,
        votes: option.votes.map((voter) => ({
          _id: voter._id,
          name: voter.name,
          profile_image: voter.profile_image,
        })),
        vote_count: option.votes.length,
      }));
      //now count total vote count in poll and add to the results by name total_users

      results.total_users = poll.poll_options.reduce(
        (acc, option) => acc + option.votes.length,
        0
      );
      // poll.total_users = results.total_users;
      // await poll.save();
      results = {
        total_users: poll.total_users,
        poll_results: results,
      };

      return apiResponse.successResponseWithData(res, "Poll results", results);
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error...!",
        error: err.message,
      });
    }
  },
];
