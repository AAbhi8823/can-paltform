// // invoice controllers

// const Invoice = require("../models/invoice.model");
// const User = require("../models/user.model");

// const PDFDocument = require('pdfkit');
// const fs = require('fs');

// const  sendInvoiceEmail = require('../helpers/helpers').sendInvoiceEmail;
// // const Subscription = require("../models/subscription.model");
// // const SubscriptionPlan = require("../models/subscription.plan.model");

// // Create and Save a new Invoice

// exports.addInvoice = [
//   async (req, res) => {
//     try {
//         const { customerName, customerEmail, items } = req.body;
//         const totalAmount = items.reduce((total, item) => total + item.price * item.quantity, 0);
    
//         const newInvoice = new Invoice({
//           customerName,
//           customerEmail,
//           items,
//           totalAmount,
//         });
    
//         const invoice = await newInvoice.save();
    
//         const doc = new PDFDocument();
//         doc.pipe(fs.createWriteStream(`./invoices/${invoice._id}.pdf`));
    
//         doc.fontSize(25).text('Invoice', { align: 'center' });
//         doc.fontSize(18).text(`Customer: ${customerName}`, { align: 'left' });
//         doc.fontSize(18).text(`Email: ${customerEmail}`, { align: 'left' });
//         doc.moveDown();
    
//         items.forEach((item, index) => {
//           doc.fontSize(14).text(
//             `${index + 1}. ${item.description} - ${item.quantity} x $${item.price} = $${
//               item.quantity * item.price
//             }`
//           );
//         });
    
//         doc.moveDown();
//         doc.fontSize(18).text(`Total Amount: $${totalAmount}`, { align: 'right' });
    
//         doc.end();
//     // Send invoice to customer email
//        // sendInvoiceEmail(customerEmail, invoice);
//         res.status(201).json(invoice);
//       } catch (err) {
//         res.status(500).json({ message: 'Server error' });
//       }
//   },
// ];
