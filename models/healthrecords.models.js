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

const healthRecordSchema = new Schema({
    CANID: { type: String, required: true },
    document_type: { type: String, required: false },
    document_name: { type: String, required: false },
    document_url: { type: String, required: false },
    document_date: { type: Date, required: false },
    document_description: { type: String, required: false },
    });

module.exports = mongoose.model("HealthRecord", healthRecordSchema);