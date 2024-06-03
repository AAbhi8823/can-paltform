const JWT = require("jsonwebtoken");
const apiResponse = require("../response/apiResponse");
const user_model = require("../models/user.model");
const dotenv = require("dotenv");
dotenv.config();

const secret = process.env.JWT_SECRET;

const authentication = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res
        .status(401)
        .json({ status: false, message: "Not Authorized!" });
    }
    let token = "";
    if (authHeader) {
      token = authHeader.split(" ")[1];
    }
   
    
    if (!token) {
      return res
        .status(401)
        .json({ status: false, message: "Token Not Found" });
    }
    const decoded_token = JWT.decode(token);
    if (!decoded_token) {
      return res.status(401).json({ status: false, message: "SignUp First" });
    }
     //check if token is present in jwtTokenBlockList in db
  //    console.log("line 33",decoded_token);
  //   const user_found= await user_model.findOne({ _id: decoded_token.user._id});
  // console.log("line 34",user_found);

    // if (user_found.jwtTokenBlockList.includes(token)) {
    //   return res.status(401).json({ status: false, message: "Invalid Token" });
    // }

    if (decoded_token.exp < Date.now() / 1000) {
      return res.status(401).json({ status: false, message: "Login First!" });
    }
    //verfy the token
    JWT.verify(token, secret, (err, user) => {
      if (err) {
        return res
          .status(401)
          .json({ status: false, message: "Invalid Token" });
      } else {
        req.user = user;
        next();
      }
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};
module.exports = { authentication };

