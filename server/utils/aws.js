const fs = require("fs")
const AWS = require("aws-sdk")
const _ = require("lodash")

const IMGUR_API_URL = "https://api.imgur.com/3/image"
const IMGUR_CLIENT_ID = "b4ff012d37b8b9f"

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  signatureVersion: "v4",
  region: process.env.AWS_S3_REGION,
})

const awsService = {
  // paid but my employer is broke
  // uploadFile: (data) => {
  //   const { originalname } = data.file
  //   let key = Date.now().toString() + ".webp"
  //   return new Promise(async (resolve, reject) => {
  //     const fileBuffer = data.file.buffer
  //     const params = {
  //       Bucket: process.env.AWS_S3_BUCKET,
  //       Key: key,
  //       Body: fileBuffer,
  //       ACL: "public-read-write",
  //     }
  //     s3.upload(params, async (err, res) => {
  //       if (err) reject(err)
  //       resolve({ url: process.env.AWS_S3_URl + key, key })
  //     })
  //   })
  // },

  // Free Service
  uploadFile: (data) => {
    return new Promise(async (resolve, reject) => {
      const imgurResponse = await axios.post(IMGUR_API_URL, data.file.buffer, {
        headers: {
          Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
          "Content-Type": "multipart/form-data",
        },
      })
      resolve({
        url: imgurResponse.data.data.link,
        key: imgurResponse.data.data.link,
      })
    })
  },
  deleteFile: (key) => {
    s3.deleteObject({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
    })
  },
  getPreSignedURL: async (fileKey) => {
    const getParams = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: fileKey,
      Expires: 60 * 5,
    }
    return { url: await s3.getSignedUrlPromise("getObject", getParams) }
  },
}

module.exports = awsService
