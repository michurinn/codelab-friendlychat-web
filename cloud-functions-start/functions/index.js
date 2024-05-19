
// Import the Firebase SDK for Google Cloud Functions.
//import { region, logger } from 'firebase-functions/v1';
// Import and initialize the Firebase Admin SDK.

//import pkg from 'firebase-admin';
//const { messaging } = pkg;
// The Firebase Admin SDK to access Firestore.
//const admin = require("firebase-admin");
// The Firebase Admin SDK to access Firestore.
// The Cloud Functions for Firebase SDK to create Cloud Functions and set up triggers.

const functions = require('firebase-functions/v1');
const admin = require("firebase-admin");

// norbu-app-6b798-abee1abf8393.json
// norbu-app-6b798-fa8f4f73e432.json
const serviceAccount = require(`${__dirname}/norbu-app-6b798-99ee5626e15f.json`);
//home/michurinnn/firebaseExample/friendlychat/cloud-functions-start/functions
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
// admin.initializeApp({
//   credential: admin.credential.applicationDefault()
// })

exports.sendNotifications = functions.firestore.document('personal_chats/{channelId}/comments/{comment}').onCreate(
  async (snapshot, context) => {
    // Notification details.
    const text = snapshot.data().text;
    const userName = snapshot.data().userName;
    
    const channelId = context.params.channelId;
    const docPath = 'personal_chats/' + channelId;
    functions.logger.log('Channel Id:', channelId);
    const channelDocument = await admin.firestore().doc(docPath).get();
    functions.logger.log('channelDocument:', channelDocument);
    const token = channelDocument.data().token;
    const isMuted = channelDocument.data().isMuted;
    const channelIdfull = channelDocument.data().channelId;
    const payload = {
      data: {
        title: `${userName}`,
        body: `${text}`,
        channelId: `${channelIdfull}` ,
      }
    };
    if (token == null || isMuted) {
      functions.logger.log('Token is:', token, 'isMuted:', isMuted);
      return;
    }
    functions.logger.log('Token is:', token);

    // Send a message to the device corresponding to the provided
    // registration token.
    admin.messaging().sendToDevice(token, payload)
      .then((response) => {
        // Response is a message ID string.
        functions.logger.log('Successfully sent message:', response);
      })
      .catch((error) => {
        functions.logger.log('Error sending message:', error);
      });
    // Get the list of device tokens.

  });
