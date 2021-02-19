const axios = require('axios')
const readline = require('readline')
const fs = require('fs')

async function sendDiscordMessage(msg, webhookurl) {

    const sendObj = {
        "content": msg,
        'username':"Horde",
        'avatar_url': "https://pavlovhorde.com/static/PHorde2-0f28d87f6d78c882bb2061c2ab9d5f67.png"
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