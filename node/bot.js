const axios = require('axios')
const readline = require('readline')
const fs = require('fs')



async function getBotSettings(){
    
}

function sendDiscordMessage(msg) {
    let serverWebook = ''
    const botPath = './botOptions.json'
    try {
        serverWebook = require(botPath).webhook
    } catch (e) {
        console.log("No webhook setting found.")
        serverWebook = askInput("What is your discord webhook?")
        fs.writeFileSync(botPath, JSON.stringify(serverDetails))
    }
    const sendObj = {
        "content": "Hello World!"
    }
    axios.post(serverWebook,
        sendObj
    )
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
