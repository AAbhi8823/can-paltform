/**
 * Medicines Model
 */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const medicineSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    CANID: { type: String, required: false },
    medicine_name: { type: String, required:false },
    medicine_type: { 
      type: String,
      enum: ["Tablet", "Capsule", "Syrup", "Injection", "Other"],
      required: false,
     },
    medicine_dosage: { type: String, required: true },
    meal: { 
      type: String,
      enum: ["Before Meal", "After Meal", "With Meal", "Empty Stomach"],
      required: true,
     },
    time_for_reminder: { type: String, required: true },
    medicine_start_date: { type: Date, required: true },
    medicine_stop_date: { type: Date, required: true },
    
    isReminderSet: { type: Boolean, default: false },

    add_note: { type: String, required: false },
  },
  { timestamps: true }
);

// Export the model
module.exports = mongoose.model("Medicine", medicineSchema);
