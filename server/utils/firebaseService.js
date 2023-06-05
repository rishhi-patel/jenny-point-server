const admin = require("firebase-admin")

const serviceAccount = {
  TYPE: process.env.TYPE,
  project_id: process.env.PROJECT_ID,
  private_key_id: process.env.PRIVATE_KEY_ID,
  private_key: process.env.PRIVATE_KEY,
  client_email: process.env.CLIENT_EMAIL,
  client_id: process.env.CLIENT_ID,
  auth_uri: process.env.AUTH_URI,
  token_uri: process.env.TOKEN_URI,
  auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
  universe_domain: process.env.UNIVERSE_DOMAIN,
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://jenny-point-default-rtdb.firebaseio.com",
  })
}

const notification_options = {
  priority: "high",
  timeToLive: 60 * 60 * 24,
}

const firebaseService = {
  sendNotification: async ({ fcmToken, message, title }) => {
    const options = notification_options
    var payload = {
      notification: {
        title,
        body: message,
      },
    }
    try {
      const data = await admin
        .messaging()
        .sendToDevice(fcmToken, payload, options)
      return data
    } catch (error) {
      console.log({ error })
    }
  },
  serviceAccount,
}

module.exports = firebaseService
