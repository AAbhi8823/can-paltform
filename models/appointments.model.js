/**
 * Appointments model
 *
 */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const appointmentSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    CANID: { type: String, required: true },
    appointment_name: { type: String, required: true },
    doctor_name: { type: String, required: true },
    hospital_name: { type: String, required: true },
    hospital_address: { type: String, required: false },
    appointment_date: { type: Date, required: true },
    appointment_time: { type: String, required: true },
   add_note: { type: String, required: true },
  },
  { timestamps: true }
);

// Export the model
module.exports = mongoose.model("Appointment", appointmentSchema);
