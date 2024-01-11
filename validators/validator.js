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
