/**
 * Ticket Management Controller
 */
const apiResponse = require("../helpers/helpers");
const { validationResult } = require("express-validator");
//const jwt = require("jsonwebtoken");
//const axios = require("axios");
const ticket_model = require("../models/ticket.management.model");
const user_model = require("../models/user.model");
const login_validator =
  require("../middlewares/jwt.auth.middleware").authentication;
//const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const admin_validator =
  require("../middlewares/admin.auth.middleware").adminAuthenticate;

  const aws = require("../helpers/aws.s3");

  const multer = require("multer");
  const upload = multer({ storage: multer.memoryStorage() });
    

// Create a new Ticket
exports.create_ticket = [
  login_validator,
  admin_validator,

  upload.single("file_attachement"),
  async (req, res) => {
 
    try {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        console.log("line 64", req.body)
      const {
        ticket_subject,
        ticket_type,
        ticket_comment,
        file_attachement,
        isTicketResolved,
        ticket_description,
        ticket_priority,
        ticket_status,
        email,
        CANID,
      } = req.body;
      console.log("line 64", req.body);
      //   const user_id = req.user.user._id;
      //   const CANID = req.user.user.CANID;
      
       // Upload document to S3 bucket
    const  file= req.file;
       const document_url = await aws.single_file_upload(
        req.file.buffer,
        req.file.originalname
      );
console.log("line 64", document_url);
      const new_ticket = new ticket_model({
        ticket_subject,
        ticket_description,
        ticket_priority,
        ticket_type,
        ticket_comment,
        file_attachment: document_url,
        isTicketResolved,
        ticket_status,
        //user_id,
        CANID,
        email,
      });
      await new_ticket.save();
      return res.status(201).json({
        status: true,
        message: "Ticket created successfully",
        data: new_ticket,
      });
    } catch (err) {
      console.error(err.message);
      res
        .status(500)
        .json({ status: false, msg: "Server error", error: err.message });
    }
  },
];

// Get all Tickets list

exports.get_tickets_list = [
  login_validator,
  admin_validator,
  async (req, res) => {
    try {
      const tickets = await ticket_model.find();
      return res.status(200).json({
        status: true,
        message: "Tickets list",
        data: tickets,
      });
    } catch (err) {
      console.error(err.message);
      res
        .status(500)
        .json({ status: false, msg: "Server error", error: err.message });
    }
  },
];

// Get Ticket by ID

exports.get_ticket_by_id = [
    login_validator,
    admin_validator,
    async (req, res) => {
        try {
        const ticket = await ticket_model.findById(req.params.ticket_id);
        if (!ticket) {
            return res.status(404).json({ msg: "Ticket not found" });
        }
        return res.status(200).json({
            status: true,
            message: "Ticket details",
            data: ticket,
        });
        } catch (err) {
        console.error(err.message);
        res
            .status(500)
            .json({ status: false, msg: "Server error", error: err.message });
        }
    },
    ];

    // Update Ticket by ID

exports.update_ticket_by_id = [
    login_validator,
    admin_validator,
    upload.single("file_attachement"),
    async (req, res) => {
        try {
            console.log("line 64",req.params.ticket_id, req.body)
        const ticket = await ticket_model.findByIdAndUpdate(
            req.params.ticket_id,
            req.body,
            {
            new: true,
            runValidators: true,
            }
        );
        if (!ticket) {
            return res.status(404).json({ msg: "Ticket not found" });
        }
        return res.status(200).json({
            status: true,
            message: "Ticket updated successfully",
            data: ticket,
        });
        } catch (err) {
        console.error(err.message);
        res
            .status(500)
            .json({ status: false, msg: "Server error", error: err.message });
        }
    },
    ];

    // Delete Ticket by ID

exports.delete_ticket_by_id = [
    login_validator,
    admin_validator,
    async (req, res) => {
        try {
        const ticket = await ticket_model.findByIdAndDelete(req.params.ticket_id);
        if (!ticket) {
            return res.status(404).json({ msg: "Ticket not found" });
        }
        return res.status(200).json({
            status: true,
            message: "Ticket deleted successfully",
        });
        } catch (err) {
        console.error(err.message);
        res
            .status(500)
            .json({ status: false, msg: "Server error", error: err.message });
        }
    },
    ];

    // Get Ticket by CANID
