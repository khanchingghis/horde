const axios = require('axios')
const readline = require('readline')
const fs = require('fs')

async function getBotSettings() {
    let botSettings = {}
    const botPath = './botSettings.json'

    try {
        botSettings = require(botPath)
    } catch (e) {
        console.log("No webhook setting found.")
        const serverWebook = await askInput("What is your discord webhook Url?")
        botSettings = {
            "url": serverWebook
        }
        fs.writeFileSync(botPath, JSON.stringify(botSettings))
    }
    return botSettings
}

function askInput(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })

    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }))
}

async function sendDiscordMessage(msg) {

    const botSettings = await getBotSettings()
    const webhookUrl = botSettings.url

    const sendObj = {
        "content": msg
    }
    axios.post(webhookUrl,
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