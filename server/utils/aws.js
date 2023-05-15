const fs = require("fs")
const AWS = require("aws-sdk")
const _ = require("lodash")

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  signatureVersion: "v4",
  region: process.env.AWS_S3_REGION,
})

const awsService = {
  uploadFile: (data) => {
    const { originalname } = data.file
    let key = Date.now().toString() + ".webp"
    return new Promise(async (resolve, reject) => {
      const fileBuffer = data.file.buffer
      const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
        Body: fileBuffer,
        ACL: "public-read-write",
      }
      s3.upload(params, async (err, res) => {
        if (err) reject(err)
        resolve({ url: process.env.AWS_S3_URl + key, key })
      })
    })
  },
  getPreSignedURL: async (fileKey) => {
    const getParams = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: fileKey,
      Expires: 60 * 5,
    }
    console.log({ getParams })
    return { url: await s3.getSignedUrlPromise("getObject", getParams) }
  },
}

module.exports = awsService
