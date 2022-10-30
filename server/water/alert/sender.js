

const { default: axios } = require("axios");

function getAuthorizationHeader(username, password) {
    const authKey = Buffer.from(`${username}:${password}`).toString("base64");
    return `Basic ${authKey}`
}

function getHeders(authHeader) {
    return {
        headers: {
            Authorization: authHeader
        }
    }
}

module.exports.sendSMS = async (message, username, password, phonenumber) => {
    try {
        const url = "https://api.46elks.com/a1/sms";

        const data = {
            from: "VATTEN",
            to: phonenumber,
            message: message
        };

        const urlData = new URLSearchParams(data);
        const authHeader = getAuthorizationHeader(username, password)
        const config = getHeders(authHeader);

        await axios.post(url, urlData.toString(), config);
    } catch (err) {
        console.error(err);
    }
}

module.exports.makeCall = async (messageURL, username, password, phonenumber) => {
    try {
        const url = "https://api.46elks.com/a1/calls";

        const action = {
            play: messageURL,
        };
        const data = {
            from: process.env.ELKS_FROM_NUMBER,
            to: phonenumber,
            voice_start: JSON.stringify(action)
        };

        const urlData = new URLSearchParams(data);
        const authHeader = getAuthorizationHeader(username, password)
        const config = getHeders(authHeader);

        await axios.post(url, urlData.toString(), config);
    } catch (err) {
        console.error(err);
    }
};
