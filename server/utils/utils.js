const createSuccessResponse = (res, data, status = 200, message) => {
  return res.status(status).send({
    status: "success",
    data,
    message,
  })
}
const createErrorResponse = (res, message, status = 400) => {
  return res.status(status).send({
    status: "fail",
    ...message,
  })
}

module.exports = { createSuccessResponse, createErrorResponse }
