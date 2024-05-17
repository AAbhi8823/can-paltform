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
    appointment_day: {
      type: String,
      enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      required: false,
    },
    appointment_time: [
      {
        type: String,
        enum: [
          "11:00 - 12:15PM",
          "12:15 - 1:30PM",
          "1:30 - 2:45PM",
          "2:45 - 4:00PM",
          "4:00 - 5:15PM",
          "5:15 - 6:30PM",
          "6:30 - 7:45PM",
          "7:45 - 9:00PM",
          "9:00 - 10:15PM",
          "10:15 - 11:30PM",
          "11:30 - 12:45AM",
          "12:45 - 2:00AM",
          "2:00 - 3:15AM",
          "3:15 - 4:30AM",
          "4:30 - 5:45AM",
          "5:45 - 7:00AM",
          "7:00 - 8:15AM",
          "8:15 - 9:30AM",
          "9:30 - 10:45AM",
          "10:45 - 12:00PM",
        ],
        required: true,
      },
    ],
    add_note: { type: String, required: false },
  },
  { timestamps: true }
);

// Export the model
module.exports = mongoose.model("Appointment", appointmentSchema);
