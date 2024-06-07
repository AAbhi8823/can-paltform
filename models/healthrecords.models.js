/**
 * Health Record Model
 * In this section user will be able to store following
health documents : These fields are subject to
change at the time of Development(Also admin will
have the Premission to Add/Edit/Remove)
○ Biopsy/Molecular Markers Reports
○ CT scan reports
○ Doctor’s letter
○ Histopathology/ Lab reports
○ Imaging reports
○ MRI scan reports
○ PET Scan reports
○ Ultrasound Endoscopic reports
○ Others
● In order to add the document user will be simply
attaching the document wrt document type like doc,
excel, pdf, png, jpeg, jpg, etc.

 */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const healthRecordSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: false },
    CANID: { type: String, required: false },
    doc_id: { type: Number, required: false },
    document_type: { type: String, required: false },
    document_size:{type:Number,required:false},
    document_name: { type: String, required: false },
    document_url: { type: String, required: false },
    document_date: { type: Date, required: false },
    document_description: { type: String, required: false },
   
  },
  { timestamps: true }
);
/**
 * Health records master folder schema 
 * In this section user will be able to store following
 * this schema will store multiple health records win folder with smae doc name for different
 * user will have to create the folder and then add the document
 */



module.exports = mongoose.model("HealthRecord", healthRecordSchema);
