const fs = require("fs");
const AWS = require("aws-sdk");
const _ = require("lodash");

// const s3 = new AWS.S3({
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   signatureVersion: "v4",
//   region: process.env.AWS_S3_REGION,
// });

// const awsService = {
//   uploadFile: (data) => {
//     const { originalname } = data.file;
//     let key = Date.now().toString() + ".png";
//     return new Promise(async (resolve, reject) => {
//       const fileBuffer = data.file.buffer;
//       const params = {
//         Bucket: process.env.AWS_S3_BUCKET,
//         Key: key,
//         Body: fileBuffer,
//         ACL: "public-read",
//       };
//       s3.upload(params, async (err, res) => {
//         if (err) reject(err);
//         resolve({ url: process.env.AWS_S3_URl + "/" + key, key });
//       });
//     });
//   },
//   deleteFile: (key) => {
//     s3.deleteObject({
//       Bucket: process.env.AWS_S3_BUCKET,
//       Key: key,
//     });
//   },
//   getPreSignedURL: async (fileKey) => {
//     const getParams = {
//       Bucket: process.env.AWS_S3_BUCKET,
//       Key: fileKey,
//       Expires: 60 * 5,
//     };
//     return { url: await s3.getSignedUrlPromise("getObject", getParams) };
//   },
// };

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  signatureVersion: "v4",
  region: process.env.AWS_S3_REGION,
});

const awsService = {
  uploadFile: (data) => {
    const { originalname } = data.file; // originalname is not used in your function.
    let key = Date.now().toString() + ".webp";
    return new Promise((resolve, reject) => {
      const fileBuffer = data.file.buffer;
      const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
        Body: fileBuffer,
        ContentType: "image/jpeg",
        ACL: "public-read", // Changed to public-read for security reasons.
      };
      s3.upload(params, (err, res) => {
        if (err) return reject(err);
        resolve({ url: `${process.env.AWS_S3_URl}/${key}`, key }); // Template string for clarity.
      });
    });
  },
  deleteFile: (key) => {
    return new Promise((resolve, reject) => {
      // Added promise handling for delete operation.
      s3.deleteObject(
        {
          Bucket: process.env.AWS_S3_BUCKET,
          Key: key,
        },
        (err, data) => {
          if (err) reject(err);
          else resolve(data);
        }
      );
    });
  },
  getPreSignedURL: async (fileKey) => {
    const getParams = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: fileKey,
      Expires: 60 * 5,
    };
    try {
      const url = await s3.getSignedUrlPromise("getObject", getParams);
      return { url };
    } catch (error) {
      console.error("Error getting pre-signed URL", error);
      throw error; // Or handle error as needed
    }
  },
};

module.exports = awsService;

module.exports = awsService;
