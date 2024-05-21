/**
 * Health card model
 */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const healthcardSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: false },
    CANID: { type: String, required: false },
    name: { type: String, required: false },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },
    date_of_birth: { type: Date, required: true },
    blood_group: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      required: true,
    },
    height: { type: String, required: false },
    weight: { type: String, required: false },
    cancer_type: {
      type: String,
      enum: [
        "Breast Cancer",
        "Lung Cancer",
        "Prostate Cancer",
        "Colon Cancer",
        "Lymphoma",
        "Melanoma",
        "Leukemia",
        "Pancreatic Cancer",
        "Liver Cancer",
        "Other",
      ],
      required: true,
    },

    cancer_stage: {
      type: String,
      enum: ["Stage 0", "Stage IA", "Stage IB", "Stage IIB", "Stage IV"],
      required: true,
    },

    current_treatment: { type: String, required: false },
    last_treatment: {
      type: String,
      required: false,
    },
    presiding_doctor: {
      type: String,
      required: false,
    },
    hospital_details_primary: {
      type: String,
      required: false,
    },
    hospital_details: {
      type: String,
      required: false,
    },

    emergency_contact: [
      {
        name: { type: String, required: false },
        phone: { type: String, required: false },
        // email:{type:String,required:false},
        // relation:{type:String,required:false}
      },
    ],
    adhaar_card: {
      type: String,
      required: false,
    },
    fit_to_fly_certificate: {
      type: String,
      required: false,
    },
    biopsy_certificate: {
      type: String,
      required: false,
    },
  },

  { timestamps: true }
);

// Export the model
module.exports = mongoose.model("Healthcard", healthcardSchema);
