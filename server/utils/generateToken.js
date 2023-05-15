const dotenv = require("dotenv")
dotenv.config()
const jwt = require("jsonwebtoken")

const generateToken = (id, expiresIn = "30d") => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn,
  })
}

module.exports = generateToken
