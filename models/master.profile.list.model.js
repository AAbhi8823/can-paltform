/**
 * Master Profile List Model
 */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const masterProfileListSchema = new Schema({
  profiles: [
    {
      role: {
        type: String,
        enum: ["Veteran", "Caregiver", "Fighter"],
        required: true,
      },
      profile_description: {
        type: String,
        required:false,
      },
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model("MasterProfileList", masterProfileListSchema);
