// const website_model = require("../models/website.model");
const validator = require("express-validator");

const AWS = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const fs = require("fs");

const { S3Client } = require("@aws-sdk/client-s3");

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_BUCKET_REGION,
});
const dotenv = require("dotenv");
dotenv.config();

//FUNCTION TO UPLOAD A SINGLE FILE TO AWS S3 BUCKET
exports.single_file_upload = async (buffer, originalname) => {
  return new Promise(function (resolve, reject) {
    let s3 = new AWS.S3({ apiVersion: "2006-03-01" });
    var uploadParams = {
     // ACL: "public-read",
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: "canplatform/" + originalname,
      Body: Buffer.from(buffer), // Convert ArrayBuffer to Buffer
    };

    s3.upload(uploadParams, function (err, data) {
      if (err) {
        console.log("Error", err);
        return reject({ error: err.message });
      }
      return resolve(data.Location);
    });
  });
};

//FUNCTION TO UPLOAD MULTIPLE FILES TO AWS S3 BUCKET
exports.multiple_file_upload = async (files) => {
  return new Promise(function (resolve, reject) {
    let s3 = new AWS.S3({ apiVersion: "2006-03-01" });
    let uploadPromises = files.map((file) => {
      return new Promise((resolve, reject) => {
        var uploadParams = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: "canplatform/" + file.originalname,
          Body: file.buffer,
        };
        s3.upload(uploadParams, function (err, data) {
          if (err) {
            console.log("Error", err);
            return reject({ error: err.message });
          }
          return resolve(data.Location);
        });
      });
    });

    Promise.all(uploadPromises)
      .then((results) => {
        return resolve(results);
      })
      .catch((err) => {
        return reject(err);
      });
  });
};

