const { createErrorResponse } = require("../utils/utils")

const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`)
  res.status(404)
  next(error)
}

const errorHandler = (err, req, res, next) => {
  createErrorResponse(
    res,
    {
      message: err.message,
      stack: process.env.NODE_ENV === "production" ? null : err.stack,
    },
    res.statusCode === 200 ? 400 : res.statusCode
  )
  next()
}

module.exports = { notFound, errorHandler }
