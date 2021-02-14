const axios = require('axios')
const readline = require('readline')
const fs = require('fs')

async function sendDiscordMessage(msg, webhookurl) {

    const sendObj = {
        "content": msg,
        'username':"Horde",
        'avatar_url': "https://pavlovhorde.com/static/horde1opac1-72895d8ae3e2449633940b00e7f79afe.png"
    }
    axios.post(webhookurl,
        sendObj
    )
}

function capFirst(string) {
    return string.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.substring(1)).join(' ')
}

async function waitMS(ms) {
    // return await for better async stack trace support in case of errors.
    return await new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {sendDiscordMessage}