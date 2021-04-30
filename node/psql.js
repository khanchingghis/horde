const { Pool, Client } = require('pg')
const score = require('./score')
const writerPSQLSettings = require('./psqlOptions.json')

const pool = new Pool(writerPSQLSettings)

async function sendData(playerList, serverInfo) {

    try{
    const nameIntRegex = /<[0-9]. /g
    let playerListFormatted = playerList.map(e => {
        const kda = e.PlayerInfo.KDA.split('/')
        e.PlayerInfo.k = parseInt(kda[0])
        e.PlayerInfo.d = parseInt(kda[1])
        e.PlayerInfo.a = parseInt(kda[2])
        e.PlayerInfo.PlayerName = e.PlayerInfo.PlayerName.replace(nameIntRegex, "")
        e.PlayerInfo.TeamId = parseInt(e.PlayerInfo.TeamId)
        return e
    });

    playerListFormatted = JSON.stringify(playerListFormatted)
    const serverInfoFormatted = JSON.stringify(serverInfo)

    pool.query(`INSERT INTO raw_scores (playerList, serverInfo) VALUES ($1, $2)`, [playerListFormatted, serverInfoFormatted])
    } catch (e){
        console.log(e,'Playerlist:',playerList,'serverInfo:',serverInfo)
    }
}

async function logData(clientId, data, result) {

    pool.query(`INSERT INTO logs (client, body_data, result) VALUES ($1, $2, $3)`, [clientId, data, result])

}

async function writeReport(report) {
    const thisQuery = `INSERT INTO monitor (report) VALUES ($1)`
    const res = await pool.query(thisQuery, [report])
    return res.rows
}

module.exports = { writeReport, sendData, logData }