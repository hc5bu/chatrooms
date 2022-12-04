const { schedule } = require('@netlify/functions');
const admin = require("firebase-admin");
const { getStorage } = require("firebase-admin/storage");

const handler = async function (event, context) {
    console.log("Received event:", event);
    
    // First, set up firebase-admin (this code is private)
    const serviceAccount = {
        "type": "service_account",
        "project_id": "chatroom-2bf9b",
        "private_key_id": "e1e2dfb1cbd4996f3c053b4c41c783a69dfa4050",
        "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQCvUmL4YvpnRiqk\n/Kquj8vCU/jNu41eyl3NGrD/9eIMY8oExWXUOv6FVHmkaRaHuSypnD4hlJ+elHwJ\nSdjZ57s/1p1sVEW29DYshIDKWpkJHJebuz71DxaijZM6xcxpI88okqNUwgyjW45l\nedxFUXoobTlgDUq1S/cEYfbF1efgerk6l2Qppk7iqR2atOOisAaQ/bfbdhzGwLI1\n+L3KxEaggR/u9Htzt+ydd4xEj6gToOP8KC5YGCrWRcQKNzjnIPhb9d4v36TXMIPD\n23XcLKYDRBHgNdzAiX5121Prc8xSeyzsjABccDwCXTKUosVGoiU5dRIfpwSf1/9/\ncv6vDCI7AgMBAAECggEAQuMQpSjF1Z68aEOJLp3no9T7iCn0rmRQUw7K1mxNeGKd\n0SIqTkTPk7h9zA7XrKIl+vOD9LXKC+skQzrsQ34YPyu21Xx1OG6FOIi4xfq4hfRl\nluFiDIZcIVoYAIU0Diy+PQFs1MpPngcxFV/ffIawLzo0eIO5q982d3KUfje0hjxK\nM5og9KNRgkbLCra2nUBUVEAy632Z+ebYBWdqL7eHcbbtPP4i8f2dwZOMBDc2VVnF\nRDhq+PAlLIe5zZIcfFfVgTzf7gu9ywVaE7TjGitz6TRRJnuMS30EAeqKjvizgR4r\nUryIQ4q6rQRDvZIgqTITv4zcqzQdzdumIcZH6EipqQKBgQDaO9nx50k9Ig6bqm9b\nJHDiXoKuMYu0Iwg/yzKJ0ICNKmF+oUaEccDiSovulvL//rCl7KbxJvGK1Fp6ACix\n+h+7uPjoYd2lRjNot5Ck3zG4z9o6YBb/LYSCGJdgc0W5w48AtGk3BojmeZf7gs2Y\nv8QtwjiRKjNxH272izXGTnd4BQKBgQDNqXU5/+QBLhArE++OCv1HmM/Ng54IcO2D\n6aDOFHqNKn8Gc/077G1XeJiQLPg8nCFPf04ipkK/8g9tvSTbc9NhA6ihxqOmUULX\nRujaj5VeC7xiFZQ5f2N5bn3d7pvzOsDBfcVwiLAieeJBN8ynJJ5VUXLzh6xul1Ht\nGar5Dg+FPwKBgQDORBmn6XowvNrfyMR9ecD0RG3xpMStmxr16OG4noiSZIdHv7k9\n/6JWgC0ociX1Tc261iWn8q4EENf/Td0o8wdBUAB6690plGOMy0t8ebSuQE68NAwo\nXeZLbGDPecRiYvLrsJltt9B3PmAnCae3gzEyKst6cU+z0Qj5H/TQnWOP3QKBgQCa\nlUDTs49Bg8oLVxS8g24VHrszEjb6yUb92+FOhP4IlWSdCRnSrMcS9EZYODTt+bzf\n8CRezvFlLSCDr6PAf7LmPMXHs3LWVEYVYessPLhc1B1o7CdZgHLYl0BsTClUDVlN\nFqgNCfC6OTrjInnlOBT6tBnfCp+FEKA3ww9L3FG2KQKBgQChFp96B3dIz2/0rXfa\nNGPNgCI+XIaZ6DdOnX/MGWCvGT43wx1adeppLncBxUvnFhXs3GM4Wsic+4jyHrip\n3jBUNq/jKpRNIJlefNpnTkzucNpHzKpbkoFq1VnId0JQ6xwKAEy4FJ8QrVwn38Fh\n/qdWOA+v0t36GX1vtrM4TUDrqQ==\n-----END PRIVATE KEY-----\n",
        "client_email": "firebase-adminsdk-21avi@chatroom-2bf9b.iam.gserviceaccount.com",
        "client_id": "118252749289075467241",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-21avi%40chatroom-2bf9b.iam.gserviceaccount.com"
      }
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: "https://chatroom-2bf9b-default-rtdb.firebaseio.com",
      storageBucket: "chatroom-2bf9b.appspot.com/"
    });
    
    const db = admin.database();
    const ref = db.ref("/");
    const bucket = getStorage().bucket();

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
        const promiseList = [];
        for (const id of deleteList) {
            update[id] = {};
            update[id]['lastUpdated'] = null;
            update[id]['messages'] = null;

            if(data[id]['files'] !== undefined){
                for(const filepath of Object.values(data[id]['files']))
                    promiseList.push(bucket.file(filepath).delete());                  
                update[id]['files'] = null;
            }
        }
        await Promise.all(promiseList); 
        await ref.update(update);
        console.log("Deleted.")
        return {
            statusCode: 200,
        };
    }
};

exports.handler = schedule("@hourly", handler);