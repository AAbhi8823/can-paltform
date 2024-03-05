const config = require("../config/config");
const jwt = require("jsonwebtoken");

//Use the ApiKey and APISecret from config.js
const payload = {
    iss: config.ZOOM_API_KEY,
    exp: ((new Date()).getTime() + 5000)
};
const token = jwt.sign(payload, config.ZOOM_API_SECRET);

function addToken(req, res, next) {
    req.body["token"] = token;
    next();
}

module.exports = { addToken }