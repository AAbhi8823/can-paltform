/**
 * Ticket Management Model
 */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ticketSchema = new Schema(
  {
    //user_id: { type: Schema.Types.ObjectId, ref: "User", required: false },
    ticket_id: {
      type: String,
      default:"CAN"+ (parseInt(Math.random()*999999 + 1000000)),
    },
    CANID: { type: String, required: true },
    ticket_subject: { type: String, required: true },
    ticket_description: { type: String, required: true },
    email: { type: String, required: true },
    ticket_status: {
      type: String,
      enum: ["Open", "In Progress", "Closed"],
      default: "Open",
    },
    ticket_priority: {
      type: String,
      enum: ["Low", "Medium", "Top"],
      default: "Low",
    },
    ticket_type: {
      type: String,
      enum: ["Refund request", "Order status", "Payment issue", "Others"],
    },
    ticket_assignee: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    ticket_comments: [
      {
        user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
        comment: { type: String, required: true },
        attachments: [{ type: String }],
        createdAt: { type: Date, default: Date.now },
      },
    ],
    file_attachment:[ { type: String }],
    isTicketResolved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ticket", ticketSchema);
