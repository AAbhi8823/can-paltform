//Validation regex for mobile number
exports.validatePhoneNumber = (phoneNumber) => {
  //const {mobileNumber}=req.body
  const phoneNumberRegex = /^[6-9]\d{9}$/;
   return phoneNumberRegex.test(phoneNumber)
};

//Validation regex for email
exports.validateEmail = (email) => {
  //const {email}=req.body
  const emailRegex = /^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$/;
    return emailRegex.test(email)

//   if (!emailRegex.test(email)) {
//     return res.status(400).json({ status: false, msg: "Invalid email" });
//   }
//   next();
};


//validation regex for 4 digit numbers only
exports.validatePin = (pin) => {
  //const {pin}=req.body
  const pinRegex = /^[0-9]{4}$/;
    return pinRegex.test(pin)

//   if (!pinRegex.test(pin)) {
//     return res.status(400).json({ status: false, msg: "Invalid pin" });
//   }
//   next();
}

//validation regex for date
// exports.validateDate = (date) => {
//   //const {date}=req.body
//   const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
//     return dateRegex.test(date)

// //   if (!dateRegex.test(date)) {
// //     return res.status(400).json({ status: false, msg: "Invalid date" });
// //   }
// //   next();
// }

// //validation regex for time
// exports.validateTime = (time) => {
//   //const {time}=req.body
//   const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
//     return timeRegex.test(time)

// //   if (!timeRegex.test(time)) {
// //     return res.status(400).json({ status: false, msg: "Invalid time" });
// //   }
// //   next();
// }

//Validation regex for time and date
exports.validateDateTime = (dateTime) => {
  const dateTimeRegex = /^\d{4}-\d{1,2}-\d{1,2}T\d{2}:\d{2}:\d{2}Z$/;
  console.log(dateTimeRegex.test(dateTime))
  return dateTimeRegex.test(dateTime);
}


