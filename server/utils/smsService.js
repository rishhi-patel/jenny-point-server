require("dotenv").config()
const msg91 = require("msg91-api")(process.env.MSG91_APIKEY)
msg91.setOtpExpiry(5)
msg91.setOtpLength(6)

const smsService = {
  sendOtpToMobile: async (mobileNo, otp) => {
    // otp = 987654
    const args = {
      flow_id: process.env.MSG91_TEMPLATE,
      mobiles: "91" + mobileNo,
      var: otp,
    }
    return await msg91.sendSMS(args)
  },

  generateOTP: (length = 6) => {
    // Math.floor(100000 + Math.random() * 900000) || 987654,
    let randomNumber = ""
    for (let i = 0; i < length; i++) {
      randomNumber += Math.floor(Math.random() * 10)
    }
    return randomNumber
  },
}

module.exports = smsService
