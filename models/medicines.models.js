/**
 * Medicines Model
 */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const medicineSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    medicines: [
      {
        CANID: { type: String, required: false },
        medicine_name: { type: String, required: false },
        medicine_type: { 
          type: String,
         // enum: ["Oncology","Gastrology","Neurology"],
          required: false,
        },
        medicine_dosage: { type: String, required: true },
        meal: { 
          type: String,
          //enum: ["Before Breakfast", "After Breakfast", "Before Lunch", "After Lunch", "Before Dinner", "After Dinner", ],
          required: true,
        },
        time_for_reminder: { type: String, required: false },
        medicine_start_date: { type: Date, required: false },
        medicine_stop_date: { type: Date, required: false },
        isReminderSet: { type: Boolean, default: false },
        add_note: { type: String, required: false },
      }
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Medicine", medicineSchema);

// Export the model

