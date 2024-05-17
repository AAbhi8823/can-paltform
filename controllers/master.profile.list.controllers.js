/**
 * Mater Profile List Controllers
 */

const master_profile_list_controller = require("../models/master.profile.list.model");
const user_controller = require("../models/user.model");
const { validationResult } = require("express-validator");
const apiResponse = require("../response/apiResponse");
const aws = require("../helpers/aws.s3");
const multer = require("multer");

//multer storage
const upload = multer({ storage: multer.memoryStorage() });

//Add Master Profile List api
exports.add_master_profile_list = [
  upload.single("profile_image"),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      }

      const { profiles } = req.body;
      //upload profile images to s3
      const profile_image_url = await aws.single_file_upload(
        req.file.buffer,
        req.file.originalname
      );
      const master_Profile_List = new master_profile_list_controller({
        role: req.body.role,
        profile_description: req.body.profile_description,
        profile_image: profile_image_url,
      });

      const master_profile_list_saved = await master_Profile_List.save();
      return apiResponse.successResponseWithData(
        res,
        "Master Profile List added successfully.",
        master_profile_list_saved
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

//Get Master Profile List api
exports.get_master_profile_list = [
  async (req, res) => {
    try {
      const master_profile_list = await master_profile_list_controller.find();
      return apiResponse.successResponseWithData(
        res,
        "Operation success",
        master_profile_list
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

// //Update Master Profile List api
// exports.updateMasterProfileList = [
//   async (req, res) => {
//     try {
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return apiResponse.validationErrorWithData(
//           res,
//           "Validation Error.",
//           errors.array()
//         );
//       } else {
//         const { profiles } = req.body;
//         const masterProfileList = await master_profile_list_controller.findById(
//           req.params.id
//         );
//         if (!masterProfileList) {
//           return apiResponse.notFoundResponse(
//             res,
//             "Master Profile List not found"
//           );
//         } else {
//           masterProfileList.profiles = profiles;
//           masterProfileList.save((err) => {
//             if (err) {
//               return apiResponse.ErrorResponse(res, err);
//             }
//             return apiResponse.successResponse(
//               res,
//               "Master Profile List updated successfully."
//             );
//           });
//         }
//       }
//     } catch (err) {
//       return apiResponse.ErrorResponse(res, err);
//     }
//   },
// ];

// //Delete Master Profile List api
// exports.deleteMasterProfileList = [
//   async (req, res) => {
//     try {
//       const masterProfileList = await master_profile_list_controller.findById(
//         req.params.id
//       );
//       if (!masterProfileList) {
//         return apiResponse.notFoundResponse(
//           res,
//           "Master Profile List not found"
//         );
//       } else {
//         masterProfileList.delete((err) => {
//           if (err) {
//             return apiResponse.ErrorResponse(res, err);
//           }
//           return apiResponse.successResponse(
//             res,
//             "Master Profile List deleted successfully."
//           );
//         });
//       }
//     } catch (err) {
//       return apiResponse.ErrorResponse(res, err);
//     }
//   },
// ];

//Get User Profile by id api
