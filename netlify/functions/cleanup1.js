const { schedule } = require('@netlify/functions');
const admin = require("firebase-admin");

const handler = async function (event, context) {
    console.log("Received event:", event);
    
    // First, set up firebase-admin
    const serviceAccount = {
        "type": "service_account",
        "project_id": "chatroom-2bf9b",
        "private_key_id": "e1e2dfb1cbd4996f3c053b4c41c783a69dfa4050",
        "private_key": process.env.FIREBASE_ADMIN_KEY,
        "client_email": "firebase-adminsdk-21avi@chatroom-2bf9b.iam.gserviceaccount.com",
        "client_id": "118252749289075467241",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-21avi%40chatroom-2bf9b.iam.gserviceaccount.com"
      }
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: "https://chatroom-2bf9b-default-rtdb.firebaseio.com"
    });
    
    const db = admin.database();
    const ref = db.ref("/");

    const snapshot = await ref.once('value');
    const data = snapshot.val();
    
    const deleteList = [];
    for (const id in data) {
        const numUsers = data[id]['users'] !== undefined ? Object.keys(data[id]['users']).length : 0;
        const lastUpdated = data[id]['lastUpdated'];
        const now = Date.now()
        if (lastUpdated !== undefined && (
            (numUsers === 0 && now - lastUpdated > 3600000) || now - lastUpdated > 86400000))
            deleteList.push(id);
    }

    if (deleteList.length === 0) {
        console.log("Nothing to delete.");
        return {
            statusCode: 200,
        };
    } else {
        console.log("To delete: ", deleteList);
        const update = {};
        for (const id of deleteList) {
            update[id] = {};
            update[id]['lastUpdated'] = null;
            update[id]['messages'] = null;
        }

        await ref.update(update);
        return {
            statusCode: 200,
        };
    }
};

exports.handler = schedule("@hourly", handler);