require("dotenv").config()
const msg91 = require("msg91-api")(process.env.MSG91_APIKEY)
msg91.setOtpExpiry(5)
msg91.setOtpLength(6)

const templates = {
  login: process.env.MSG91_LOGIN_TEMPLATE,
  delivery: process.env.MSG91_DELIVERY_TEMPLATE,
}

const smsService = {
  sendOtpToMobile: async (mobileNo, otp, template = "login") => {
    const args = {
      flow_id: templates[template],
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
