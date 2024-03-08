/**
 * Health Card controllers
 */

const healthcard_model=require("../models/healthcard.model")
const user_model=require("../models/user.model")
const login_validator=require("../middlewares/jwt.auth.middleware").authentication
const { validationResult } = require("express-validator");
const { single_file_upload } = require("../helpers/aws.s3");

const apiResponse=require("../response/apiResponse")

const dotenv = require("dotenv");
dotenv.config();


// const storage = multer.memoryStorage({
//     destination: function (req, file, callback) {
//       callback(null, "");
//     },
//   });
  
//   const upload = multer({ storage }).single("file");

/**
 * Add healthcard api
 */

const multer = require('multer');
const upload = multer(); // create an instance of multer

exports.add_healthcard = [
    upload.none(), // This middleware is used for parsing form data with content-type multipart/form-data

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({
                errors: errors.array()
            });
        }
        next();
    },
    async (req, res) => {
        try {
            console.log("line 45", req.body);
            const {
                name,
                gender,
                date_of_birth,
                blood_group,
                height,
                weight,
                cancer_type,
                cancer_stage,
                current_treatment,
                presiding_doctor,
                hospital_details_primary,
                hospital_details,
                emergency_conatct,
                document_attached
            } = req.body;

            // Uncomment the following lines if you have user authentication and want to get user_id
            // const user_id = req.user._id;
            // const user = await user_model.findOne({_id: user_id});
            // if (!user) {
            //     return res.status(404).json({
            //         message: "User not found"
            //     });
            // }

            // Create health card
            const healthcard = new healthcard_model({
                // user_id,
                // CANID: req.user.CANID,
                name,
                gender,
                date_of_birth,
                blood_group,
                height,
                weight,
                cancer_type,
                cancer_stage,
                current_treatment,
                presiding_doctor,
                hospital_details_primary,
                hospital_details,
                emergency_conatct,
                document_attached
            });

           const healthcard_saved= await healthcard.save();
            return apiResponse.successResponseWithData(
                res,
                "Successfully,Healthcard added",
                healthcard_saved
            )
        } catch (err) {
            return res.status(500).json({
                message: err.message
            });
        }
    }
];


/**
 * Get healthcard api
 */

exports.get_healthcard=[
    login_validator,
    async(req,res)=>{
        try{
            const user_id=req.user._id;
            const healthcard=await healthcard_model.findOne({user_id:user_id});
            if(!healthcard){
                return res.status(404).json({
                    message:"Healthcard not found"
                })
            }
            return apiResponse.successResponseWithData(
                res,
                "Successfully,Healthcard fetched",
                healthcard
            
            )
        }
        catch(err){
            return apiResponse.serverErrorResponse(
                res,
                "Server error",
                err.message
            
            )
        }
    }
]