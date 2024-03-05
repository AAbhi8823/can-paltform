const jwt = require("jsonwebtoken");
const apiResponse = require("../response/apiResponse");
const secret = process.env.JWT_SECRET;

const profilePinAuthenticate = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (authHeader == null)
    return apiResponse.unauthorizedResponse(res, "Unauthorized Token");
  const token = authHeader.split(" ")[1];
  const decoded_token = jwt.decode(token);
  console.log("line 12",decoded_token)
  

  jwt.verify(token, secret, (err, user) => {
    if (err) return apiResponse.unauthorizedResponse(res, "Unauthorized Token");
    if (user.user.isAdmin == false)//user.user.isAdmin !== true
      return apiResponse.unauthorizedResponse(
        res,
        "You don't have admin privileges"
      );
    next();
  });
};
module.exports = {profilePinAuthenticate };
