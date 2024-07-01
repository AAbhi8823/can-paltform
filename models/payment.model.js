/**
 * Payment Model - Mongoose Schema
 * This model is used to store payment data
 */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const paymentSchema = new Schema(
    {
        user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
        subscription_id: { type: Schema.Types.ObjectId, ref: "Subscription", required: true },
        payment_amount: { type: Number, required: true },
        payment_gateway: { type: String, required: true },
        payment_status: {
        type: String,
        enum: ["Success", "Failed"],
        default: "Success",
        },
       
        payment_date: { type: Date, default: Date.now },
        total_balance: { type: Number, default: 0.0 },
    },
    { timestamps: true }
    );

module.exports = mongoose.model("Payment", paymentSchema);