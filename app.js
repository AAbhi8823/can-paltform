
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const compression = require("compression");
const apiRoutes = require("./routes/api");


// const config = require('./config');
const path = require("path");
const cors = require("cors");
const morgan = require("morgan"); //for logging
const multer = require("multer");
//const passport = require("passport");
const flash = require("connect-flash"); //for flash messages
//const session = require('express-session');
//const cookieParser = require('cookie-parser');
const db_connection=require("./database/db.configurations").connectDB
const PORT=process.env.PORT || 3000
const dotenv=require('dotenv')
dotenv.config();

//-------------------
//connect to database
//-------------------
db_connection()
  .then(() => {
    console.log("Successfully connected to database");
  })
  .catch((err) => {
    console.log("Error connecting to database", err);
    process.exit();
  });
//------------------
//configure app
//------------------

app.use(cors());
app.use(morgan("dev"));
//app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
//  app.use(

app.use(flash());

app.use(compression());

//define routes
app.use("/api/v1", apiRoutes);
app.use("*", (req, res) => {
  res.status(404).json([{status:false, message: `The URL ${req.originalUrl} is  not on this server` }]);
});

//start server
app.listen(`${PORT}`, () => {
  console.log(`Server started on port ${PORT}`);
});
