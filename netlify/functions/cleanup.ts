const { schedule } = require('@netlify/functions');
const axios = require('axios');

const handler = async function (event, context) {
    console.log("Received event:", event);
    let res;
    try{
        res = await axios.get("https://chatroom-2bf9b-default-rtdb.firebaseio.com/.json");
    } catch(error){
        console.error("Error:", error.response.data);
        return {
            statusCode: error.response.status,
        }
    }
    const data = res.data;
    const deleteList = [];
    for (const id in data) {
        const numUsers = data[id]['users'] !== undefined ? Object.keys(data[id]['users']).length : 0;
        const lastUpdated = data[id]['lastUpdated'];
        const now = Date.now()
        if (lastUpdated !== undefined && now - lastUpdated > 3600000 && numUsers === 0)
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
        let response;
        try {
            response = await axios.patch('https://chatroom-2bf9b-default-rtdb.firebaseio.com/.json',update);
        } catch (error) {
            console.error('Error: ', error.response.data);
            return {
                statusCode: error.response.status,
            };
        }
        console.log('Successfully updated:', response.data);
        return {
            statusCode: response.status,
        };
    }

};

exports.handler = schedule("@hourly", handler);