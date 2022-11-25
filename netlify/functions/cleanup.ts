const { schedule } = require('@netlify/functions');

const handler = async function (event, context) {
    console.log("Received event:", event);
    const resp = await fetch("https://chatroom-2bf9b-default-rtdb.firebaseio.com/.json", {
        method: "GET",
    });
    const data = await resp.json();
    if (!resp.ok) {
        console.error("Error:", data);
        return {
            statusCode: resp.status,
        }
    }
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
        let response: Response;
        try {
            response = await fetch('https://chatroom-2bf9b-default-rtdb.firebaseio.com/.json', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(update),
            });
        } catch (error) {
            console.error('Error: ', error);
            return {
                statusCode: 400,
            };
        }
        const rj = await response.json();
        if (!response.ok)
            console.error("Error:", rj);
        else
            console.log('Successfully updated:', rj);
        return {
            statusCode: response.status,
        };
    }

};

exports.handler = schedule("@hourly", handler);