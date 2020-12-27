const { Client } = require('pg')
const score = require('./score')

async function sendData(psqlSettings, playerList, serverInfo) {
    
    const nameIntRegex = /<[0-9]. /g
    let playerListFormatted = playerList.map(e => {
        const kda = e.PlayerInfo.KDA.split('/')
        e.PlayerInfo.k=parseInt(kda[0])
        e.PlayerInfo.d=parseInt(kda[1])
        e.PlayerInfo.a=parseInt(kda[2])
        e.PlayerInfo.PlayerName = e.PlayerInfo.PlayerName.replace(nameIntRegex,"")
        e.PlayerInfo.TeamId = parseInt(e.PlayerInfo.TeamId)
        return e
    });

    playerListFormatted = JSON.stringify(playerListFormatted)
    const serverInfoFormatted = JSON.stringify(serverInfo)

    const client = new Client(psqlSettings)

    client.connect().then(x => {
        client.query(`INSERT INTO raw_scores (playerList, serverInfo) VALUES ($1, $2)`,[playerListFormatted,serverInfoFormatted]).then(y=>{
            client.end()
        })
    })
}


async function logData(psqlSettings, clientId, data, result){
    const client = new Client(psqlSettings)

    client.connect().then(x => {
        client.query(`INSERT INTO logs (client, body_data, result) VALUES ($1, $2, $3)`,[clientId,data, result]).then(y=>{
            client.end()
        })
    })
}

module.exports = {sendData, logData}