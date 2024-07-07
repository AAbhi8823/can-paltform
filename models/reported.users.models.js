//Reported user schema
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reportedUserSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    reported_by: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    report_reason: {
        type: String,
        required: true,
        trim: true,
    },
    status: {
        type: String,
        enum: ["Pending", "Resolved"],
        default: "Pending",
    },
    reported_at: {
        type: Date,
        default: Date.now,
    },
    },{
    timestamps: true,
    
    });
module.exports = mongoose.model("Reportedstory", reportedUserSchema);