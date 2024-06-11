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
      const polls = await poll_model.find({});
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
 * The user can vote a poll option by providing the poll id and option id
 */

exports.vote_poll_option = [
  login_validator,
  async (req, res) => {
    try {
      const { poll_id, option_id } = req.body;
      const user_id = req.user.user._id;

      const poll = await poll_model.findById(poll_id);
      if (!poll) {
        return apiResponse.notFoundResponse(res, "Poll not found");
      }
      console.log("line 159", poll);

      const option = poll.poll_options.id(option_id); // Use Mongoose subdocument method
      console.log("line 163", option);
      if (!option) {
        return apiResponse.notFoundResponse(res, "Option not found");
      }
      console.log("line 167", poll.poll_options, poll.poll_options);

      if (poll.poll_options.votes.includes(user_id)) {
        return apiResponse.successResponse(
          res,
          "You have already voted for this option"
        );
      }

      option.votes.push(user_id);
      await poll.save();

      return apiResponse.successResponse(
        res,
        "You have successfully voted for this option"
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
