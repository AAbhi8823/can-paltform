const feedback_model = require("../models/feedback.model");
const { validationResult } = require("express-validator");
const apiResponse = require("../response/apiResponse");

const login_validator =
  require("../middlewares/jwt.auth.middleware").authentication;

// Create and Save a new Feedback
exports.add_feedback = [
  login_validator,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {feedback, rating } = req.body;
      if (!rating) {
        return apiResponse.validationErrorWithData(res, "Rating is required");
      }

      const new_feedback = new feedback_model({
        user_id: req.user.user._id,
        feedback: feedback,
        rating: rating,
      });
      const saved_feedback = await new_feedback.save();
      return apiResponse.successResponseWithData(
        res,
        "Successfully, Feedback Added!",
        saved_feedback
      );
    } catch (error) {
      return apiResponse.ErrorResponse(res, error);
    }
  },
];

//Get feedback by user id
exports.get_feedback_by_user_id = [
    login_validator,
    async (req, res) => {
      try {
          const errors = validationResult(req);
          if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
          }
  
          const user_id  = req.user.user._id;
          console.log("line 42", req.user.user, typeof user_id);
  
          const feedback = await feedback_model.find({ user_id: user_id }).populate("user_id", "name email");
  
          if (!feedback) {
            return apiResponse.notFoundResponse(res, "No feedback found for this user.");
          }
  
          return apiResponse.successResponseWithData(
            res,
            "Successfully, Feedback Found!",
            feedback
          );
      } catch (error) {
        console.error(error); // Log the error for debugging
        return apiResponse.serverErrorResponse(
          res,
          "Server Error",
          error.message
        );
      }
    },
  ];