const validateRequest = (schema, property = "body") => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property])
    const valid = error == null
    if (valid) {
      next()
    } else {
      const { details } = error
      const message = details[0].message.split('"')
      res.status(400)
      throw new Error(message[1] + message[2])
    }
  }
}
module.exports = validateRequest
